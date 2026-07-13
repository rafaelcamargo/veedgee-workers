const cheerio = require('cheerio');
const pensaNoEventoResource = require('../resources/pensa-no-evento');
const eventService = require('../services/event');
const reportService = require('../services/report');
const requestService = require('../services/request');
const { useCounter } = require('../hooks/useCounter');

const _public = {};

_public.crawl = reportId => {
  const requests = Object.values(getCityCodes()).map(crawlEventsByCityCode);
  return Promise.all(requests).then(responses => {
    return enrichEventsWithDescriptions(responses.flat(), reportId);
  });
};

function getCityCodes(){
  return {
    'curitiba': 32,
    'jonville': 19,
    'barra_velha': 137,
    'picarras': 95,
    'blumenau': 9,
    'itajai': 43,
    'bc': 7,
    'sao_jose': 2,
    'floripa': 1,
    'porto_alegre': 33
  };
}

function crawlEventsByCityCode(code){
  return pensaNoEventoResource.get({ cityCode: code }).then(({ data }) => {
    return data?.data ? buildEvents(data.data) : [];
  });
}

function buildEvents(data){
  return data.map(item => {
    const { evento, data, cidade, estado, url, capaURL } = item;
    const [date, time] = parseDateTime(data);
    return {
      title: evento,
      date,
      time,
      city: cidade,
      state: estado,
      country: 'BR',
      url,
      ...(capaURL && { image: capaURL })
    };
  }).filter(builtEvent => !isBlackListed(builtEvent));
}

function parseDateTime(dateTimeString){
  const [date, time] = dateTimeString.split(' ');
  return [date, parseTime(time)];
}

function parseTime(timeString){
  return timeString && timeString.substring(0,5);
}

function isBlackListed({ title }){
  return getBlackList().some(term => title.toLowerCase().includes(term));
}

function getBlackList(){
  return [
    'rancho açoriano',
    'ruta 40 gastro pub',
    'dom piero',
    'los troncos parrilla uruguaya',
    'capitão gaivota',
    'narbona',
    'l\'ile brasserie',
    'feeling floripa',
    'portofino',
    'espartano skatepark',
    'pippo ristorante',
    'trezze rooftop',
    'don\'t tell mama - praia brava',
    'bibi pizza floripa'
  ];
}

async function enrichEventsWithDescriptions(events, reportId){
  const { check } = useCounter();
  const task = 'Crawling: pensa-no-evento (descriptions)';
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
  return pensaNoEventoResource.getEventDetailsPage(event.url).then(({ data }) => {
    return {
      ...event,
      description: eventService.parseDescription(extractDescription(data))
    };
  });
}

function extractDescription(htmlString){
  const $ = cheerio.load(htmlString);
  return $('meta[name="description"]').attr('content');
}

module.exports = _public;
