const { VLM_INFERENCE_PARSE_ERROR } = require('../constants/eventNames');
const { CATEGORY_ALIASES } = require('../constants/event-categories');
const dateService = require('../services/date');
const eventCategoryService = require('../services/event-category');
const eventFetcherService = require('../services/event-fetcher');
const loggerService = require('../services/logger');
const { removeAccents } = require('../services/text');
const googleAiResource = require('../resources/google-ai');
const rapidApiResource = require('../resources/rapid-api');

const _public = {};

_public.crawl = () => {
  return Promise.all([
    rapidApiResource.getInstagramPosts({ username: 'poraodaliga' }),
    eventFetcherService.cachedFetch({ minDate: dateService.buildTodayDateString() })
  ]).then(responses => {
    const [{ data: postsData }, { data: eventsData }] = responses;
    const posts = getPostsInfo(postsData);
    return extractEventsFromPosts(posts).then(events => {
      const savedEventDates = eventsData.filter(evt => {
        return startWithPrefixTerm(evt.title, 'porão da liga');
      }).map(evt => evt.date);
      return events.filter(({ date }) => {
        return date && !savedEventDates.includes(date);
      });
    });
  });
};

function getPostsInfo(data){
  return data.result.edges.map(({ node }) => {
    return {
      id: node.code,
      imageUrl: findMediumResImage(node.image_versions2.candidates).url
    };
  }).slice(0, 4);
}

function findMediumResImage(candidates){
  return candidates.find(image => image.width <= 1000);
}

function extractEventsFromPosts(posts){
  const requests = posts.map(extractEventsFromSinglePost);
  return Promise.all(requests).then(events => events.flat());
}

function extractEventsFromSinglePost(post){
  return googleAiResource.inferImageData({
    prompt: buildInferenceRequestPrompt(),
    imageUrl: post.imageUrl
  }).then(({ data }) => {
    const events = parseVlmInferenceResponse(data, { instagramPostId: post.id, imageUrl: post.imageUrl });
    return events.map(evt => {
      const { title, date, time, category: vlmCategory } = evt;
      const formattedTitle = formatEventTitle(title);
      const category = resolveCategory(vlmCategory, formattedTitle);
      return {
        title: formattedTitle,
        date: parseEventDate(date),
        time,
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: `https://www.instagram.com/poraodaliga/p/${post.id}/`,
        ...(category && { category }),
        image: post.imageUrl
      };
    });
  });
}

function buildInferenceRequestPrompt(){
  const categories = Object.keys(CATEGORY_ALIASES).join(', ');
  return `
Analyze the image and identify all events being promoted.
Rules:
1. Only return events if the image explicitly contains the exact text "Porão da Liga".
2. If "Porão da Liga" does not appear anywhere in the image, return exactly: []
3. Extract, for each event:
- title
- date
- time
- category
4. Return a valid JSON array only. Do not include explanations, comments, markdown, or extra text.
5. Each event object in the Array must follow this exact schema:
{ "title": "String", "date": "YYYY-MM-DD", "time": "HH:MM" | null, "category": "String" | null }
6. Suggest category based on the visual and textual content of the image (event type, genre, poster format).
7. Accepted category values (use exactly one of these names): ${categories}
8. Use null for category when it cannot be inferred with confidence from the image.
9. Convert all times to 24-hour format.
10. If a date is incomplete, ambiguous, or unreadable, omit that event entirely.
11. If a time is not present in the image, use null.
12. Preserve the event title exactly as written in the image, except for trimming unnecessary whitespace.
13. The output must always be valid JSON parsable by standard JSON parsers.
`.trim();
}

function parseVlmInferenceResponse(data, context){
  try {
    return parseVlmInferenceEvents(data);
  } catch (err) {
    loggerService.track(VLM_INFERENCE_PARSE_ERROR, err, buildVlmParseErrorMetadata(data, context));
    return [];
  }
}

function parseVlmInferenceEvents(data){
  const content = data.text;
  if (!content) throw new Error('VLM inference response has no text');
  const normalized = content.replace(/```/g, '').replace(/^json/i, '').trim();
  const parsed = JSON.parse(normalized);
  if (!Array.isArray(parsed)) {
    throw new Error('VLM inference response is not an array');
  }
  return parsed;
}

function buildVlmParseErrorMetadata(data, { instagramPostId, imageUrl }){
  const metadata = {
    instagram_post_id: instagramPostId,
    image_url: imageUrl
  };
  const content = data?.text;
  if (content) metadata.vlm_raw_content = String(content).slice(0, 1000);
  return metadata;
}

function formatEventTitle(title){
  return `Porão da Liga - ${extractAttractionFromTitle(title)}`;
}

function extractAttractionFromTitle(title){
  return title.replace(/porão da liga/i, '').trim().replace(/^-/, '').trim();
}

function resolveInternalCategory(value){
  if (!value) return null;
  const normalized = removeAccents(String(value)).toLowerCase().trim();
  return Object.keys(CATEGORY_ALIASES).find(category => category === normalized) || null;
}

function resolveCategory(vlmCategory, formattedTitle){
  return resolveInternalCategory(vlmCategory) || eventCategoryService.findCategoryByKeywords(
    eventCategoryService.extractCategoryKeywordsFromText(extractAttractionFromTitle(formattedTitle))
  );
}

function parseEventDate(dateString){
  if (!dateService.isValidISODateString(dateString)) return null;
  const currentYear = dateService.getNow().getFullYear();
  const [year, month, day] = dateString.split('-');
  const eventYear = parseInt(year);
  const parsedYear = eventYear < currentYear ? currentYear : eventYear;
  return `${parsedYear}-${month}-${day}`;
}

function startWithPrefixTerm(eventTitle, prefix){
  return eventTitle.toLowerCase().startsWith(prefix);
}

module.exports = _public;
