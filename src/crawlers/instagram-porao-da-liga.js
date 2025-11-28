const dateService = require('../services/date');
const eventFetcherService = require('../services/event-fetcher');
const huggingFaceResource = require('../resources/hugging-face');
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
      return events.filter(evt => {
        return !savedEventDates.includes(evt.date);
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
  return huggingFaceResource.inferImageData({
    prompt: buildInferenceRequestPrompt(),
    imageUrl: post.imageUrl
  }).then(({ data }) => {
    const events = parseVlmInferenceResponse(data);
    return events.map(evt => ({
      ...evt,
      title: formatEventTitle(evt.title),
      date: parseEventDate(evt.date),
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: `https://www.instagram.com/poraodaliga/p/${post.id}/`
    }));
  });
}

function buildInferenceRequestPrompt(){
  return `
Identify the events being promoted on the following image.
Extract the name of the attractions, and date/time on which they're going to happen.
If the image does not contain the name "Porão da Liga", respond with an empty Array.
Structure the events as an Array of objects. Each object should represent data found on a image:
[{ title: String, date: YYYY-MM-DD, time: HH:MM }]
Time should be 24h, not 12h (am/pm). If no time is found, time should be null in the JSON.
The JSON returned should be plain text, Do not insert it in markdown notation.
`.trim();
}

function parseVlmInferenceResponse({ choices }){
  const { content } = choices[0].message;
  const response = content.replace(/```/g, '').replace(/^json/, '');
  return JSON.parse(response);
}

function formatEventTitle(title){
  const attraction = title.replace(/porão da liga/i, '').trim().replace(/^-/, '').trim();
  return `Porão da Liga - ${attraction}`;
}

function parseEventDate(dateString){
  const currentYear = new Date().getFullYear();
  const [year, month, day] = dateString.split('-');
  const eventYear = parseInt(year);
  const parsedYear = eventYear < currentYear ? currentYear : eventYear;
  return `${parsedYear}-${month}-${day}`;
}

function startWithPrefixTerm(eventTitle, prefix){
  return eventTitle.toLowerCase().startsWith(prefix);
}

module.exports = _public;
