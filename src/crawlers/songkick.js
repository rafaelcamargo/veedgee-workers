const cheerio = require('cheerio');
const eventService = require('../services/event');
const songkickResource = require('../resources/songkick');

const _public = {};

_public.crawl = () => {
  return Promise.all(buildRequests()).then(responses => {
    return responses.map(({ data }) => buildEvents(data)).flat();
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
    url: data.url.split('?')[0]
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

module.exports = _public;
