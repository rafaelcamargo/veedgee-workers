const cheerio = require('cheerio');
const { BASE_URL } = require('../constants/eticket-center');
const eticketCenterResource = require('../resources/eticket-center');
const eventCategoryService = require('../services/event-category');
const eventService = require('../services/event');
const reportService = require('../services/report');
const requestService = require('../services/request');
const { useCounter } = require('../hooks/useCounter');

const _public = {};

_public.crawl = reportId => {
  return Promise.all([1, 2, 3].map(fetchContentByPageNumber)).then(responses => {
    const events = responses.map(({ data }) => buildEvents(data)).flat();
    return enrichEventsWithDescriptions(events, reportId);
  });
};

function fetchContentByPageNumber(pageNumber){
  return eticketCenterResource.get({ Pagina: pageNumber });
}

function buildEvents(htmlString){
  const $ = cheerio.load(htmlString);
  return Array.from($('.BoxGerInfo1'))
    .map(eventEl => formatEvent($(eventEl)))
    .filter(({ city, state }) => eventService.isWantedCity(city, state));
}

function formatEvent($eventEl){
  const eventLink = $eventEl.find('.ExtTitulo a');
  const href = eventLink.attr('href');
  const [date, time] = formatDateTime($eventEl);
  const [city, state] = formatCityState($eventEl);
  return {
    title: eventLink.text(),
    date,
    time,
    city,
    state,
    country: 'BR',
    url: [BASE_URL, href].join(''),
    category: eventCategoryService.findCategoryByKeywords([extractCategorySlug(href)]),
    image: extractImageUrl($eventEl)
  };
}

function extractImageUrl($eventEl){
  const image = findImageUrl($eventEl);
  return image && !image.startsWith('data:') && image;
}

function findImageUrl(html){
  const find = attrName => html.find('.ImgPrincipal').attr(attrName);
  return [find('data-src'), find('src')].find(Boolean);
}

function extractCategorySlug(href){
  const result = href.match(/\/eventos\/([^/]+)\//);
  return result?.[1];
}

function formatDateTime($eventEl){
  const [date, time] = getDateTimeElement($eventEl).text().trim().split(' - ');
  return [date.split('/').reverse().join('-'), time];
}

function getDateTimeElement($eventEl){
  const multiDateEl = $eventEl.find('.BoxDatas button');
  return multiDateEl.html() ? multiDateEl : $eventEl.find('.BoxData');
}

function formatCityState($eventEl){
  const location = $eventEl.find('.ExtLocol').text().trim().split('(');
  const cityState = location && location[1];
  return cityState && cityState.replace(')', '').split('/');
}

async function enrichEventsWithDescriptions(events, reportId){
  const { check } = useCounter();
  const task = 'Crawling: eticket-center (descriptions)';
  try {
    const enrichedEvents = await requestService.bulkRequest({
      method: enrichEventWithDescription,
      params: events,
      batchSize: 2
    });
    reportService.addItem(reportId, { task, result: 'success', time: check() });
    return enrichedEvents;
  } catch (err) {
    reportService.addItem(reportId, { task, result: 'error', time: check() }, err);
    return events;
  }
}

function enrichEventWithDescription(event){
  return eticketCenterResource.getEventDetailsPage(event.url).then(({ data }) => {
    return {
      ...event,
      description: eventService.parseDescription(extractDescription(data))
    };
  });
}

function extractDescription(htmlString){
  const match = htmlString.match(/<meta name="Description" content="(.*)" \/>/i);
  return match?.[1];
}

module.exports = _public;
