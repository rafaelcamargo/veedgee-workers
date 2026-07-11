const cheerio = require('cheerio');
const songkickResource = require('../resources/songkick');
const eventService = require('../services/event');
const reportService = require('../services/report');
const requestService = require('../services/request');
const { useCounter } = require('../hooks/useCounter');

const _public = {};

_public.crawl = reportId => {
  return Promise.all(buildRequests()).then(responses => {
    const events = responses.map(({ data }) => buildEvents(data)).flat();
    return enrichEventsWithDescriptions(events, reportId);
  });
};

function buildRequests(){
  return buildRequestParams().map(params => songkickResource.get(params));
}

function buildRequestParams(){
  return [
    'blumenau',
    'curitiba',
    'florianopolis',
    'itajai',
    'joinville',
    'porto-alegre'
  ].reduce((params, city) => {
    return [
      ...params,
      { city, page: 1 },
      { city, page: 2 },
    ];
  }, []);
}

function buildEvents(htmlString){
  const $ = cheerio.load(htmlString);
  return Array.from($('.metro-area-calendar-listings script[type="application/ld+json"]'))
    .map(eventEl => formatEvent($(eventEl)))
    .filter(({ city, state }) => eventService.isWantedCity(city, state));
}

function formatEvent($eventEl){
  const [data] = JSON.parse($eventEl.text().trim());
  const [date, time] = formatDateTime(data.startDate);
  const [city, state] = formatCityState(data);
  return {
    title: data.name,
    date,
    time,
    city,
    state,
    country: 'BR',
    url: data.url.split('?')[0],
    category: 'music'
  };
}

function formatDateTime(dateString){
  const [date, time] = dateString.split('T');
  return [date, formatTime(time)];
}

function formatTime(timeString){
  return timeString && timeString.substring(0,5);
}

function formatCityState({ location }){
  const city = location.address.addressLocality;
  return [city, getStateByCity(city)];
}

function getStateByCity(city){
  return {
    'Blumenau': 'SC',
    'Curitiba': 'PR',
    'Florianópolis': 'SC',
    'Itajaí': 'SC',
    'Joinville': 'SC',
    'Porto Alegre': 'RS'
  }[city];
}

async function enrichEventsWithDescriptions(events, reportId){
  const { check } = useCounter();
  const task = 'Crawling: songkick (descriptions)';
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
  return songkickResource.getEventDetailsPage(event.url).then(({ data }) => {
    const [description, image] = extractEnrichmentData(data);
    return { ...event, description, image };
  });
}

function extractEnrichmentData(htmlString){
  const $ = cheerio.load(htmlString);
  const description = $('meta[property="og:description"]').attr('content');
  const image = $('meta[property="og:image"]').attr('content');
  return [description, image];
}

module.exports = _public;
