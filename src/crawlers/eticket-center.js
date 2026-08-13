const cheerio = require('cheerio');
const { BASE_URL } = require('../constants/eticket-center');
const eticketCenterResource = require('../resources/eticket-center');
const eventService = require('../services/event');
const objectService = require('../services/object');
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
    image: extractImageUrl($eventEl),
    venue: formatVenue($eventEl)
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

function formatVenue($eventEl){
  const [venue] = $eventEl.find('.ExtLocol').text().trim().split('(');
  return venue && venue.trim();
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
      description: eventService.parseDescription(extractDescription(data)),
      ...extractLocation(data)
    };
  });
}

function extractDescription(htmlString){
  const match = htmlString.match(/<meta name="Description" content="(.*)" \/>/i);
  return match?.[1];
}

function extractLocation(htmlString){
  const $ = cheerio.load(htmlString);
  const address = $('h2')
    .filter((_, el) => $(el).text().includes('Informações sobre o Local'))
    .parent()
    .find('.font-s-18.bold.color-cinza2.mb20')
    .first()
    .text()
    .trim();
  const mapsHref = $('a[href*="google.com/maps"]').attr('href') || '';
  const [, latitude, longitude] = mapsHref.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/) || [];
  return objectService.removeFalsyAttrs({
    address,
    latitude,
    longitude
  });
}

module.exports = _public;
