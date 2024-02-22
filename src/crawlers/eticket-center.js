const cheerio = require('cheerio');
const { BASE_URL } = require('../constants/eticket-center');
const eventService = require('../services/event');
const eticketCenterResource = require('../resources/eticket-center');

const _public = {};

_public.crawl = () => {
  return Promise.all([1, 2].map(fetchContentByPageNumber)).then(responses => {
    return responses.map(({ data }) => buildEvents(data)).flat();
  });
};

function fetchContentByPageNumber(pageNumber){
  return eticketCenterResource.get({ pagina: pageNumber });
}

function buildEvents(htmlString){
  const $ = cheerio.load(htmlString);
  return Array.from($('.BoxGerInfo1'))
    .map(eventEl => formatEvent($(eventEl)))
    .filter(({ city }) => eventService.isWantedCity(city));
}

function formatEvent($eventEl){
  const eventLink = $eventEl.find('.ExtTitulo a');
  const [date, time] = formatDateTime($eventEl);
  const [city, state] = formatCityState($eventEl);
  return {
    title: eventLink.text(),
    date,
    time,
    city,
    state,
    country: 'BR',
    url: [BASE_URL, eventLink.attr('href')].join('')
  };
}

function formatDateTime($eventEl){
  const [date, time] = $eventEl.find('.BoxData').text().trim().split(' - ');
  return [date.split('/').reverse().join('-'), time];
}

function formatCityState($eventEl){
  const location = $eventEl.find('.ExtLocol').text().trim().split('(');
  const cityState = location && location[1];
  return cityState && cityState.replace(')', '').split('/');
}

module.exports = _public;
