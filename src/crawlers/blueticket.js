const blueticketResource = require('../resources/blueticket');
const eventCategoryService = require('../services/event-category');
const eventService = require('../services/event');
const objectService = require('../services/object');
const reportService = require('../services/report');
const requestService = require('../services/request');
const { useCounter } = require('../hooks/useCounter');

const _public = {};

_public.crawl = reportId => {
  return blueticketResource.get({ categoria: 11 }).then(({ data }) => {
    const events = data ? buildEvents(data) : [];
    return enrichEventsWithDescriptions(events, reportId);
  });
};

function buildEvents(data){
  return data.filter(item => {
    const { data_indefinida, nome_cidade, uf_cidade } = item;
    return data_indefinida === 0 && eventService.isWantedCity(nome_cidade, uf_cidade);
  }).map(item => {
    const [date, time] = parseDateTime(item.data);
    const category = eventCategoryService.findCategoryByKeywords([item.categoria, item.categoria_alt]);
    return {
      title: item.nome,
      date,
      time,
      city: item.nome_cidade,
      state: item.uf_cidade,
      country: 'BR',
      url: `https://www.blueticket.com.br/evento/${item.codigo}/${item.slug}`,
      eventCode: item.codigo,
      ...(category && { category }),
      ...(item.url && { image: item.url })
    };
  });
}

function parseDateTime(dateTimeString){
  const [date, time] = dateTimeString.split(' ');
  return [date, parseTime(time)];
}

function parseTime(timeString){
  return timeString && timeString.substring(0,5);
}

async function enrichEventsWithDescriptions(events, reportId){
  const { check } = useCounter();
  const task = 'Crawling: blueticket (descriptions)';
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
    return events.map(evt => objectService.removeAttrs(evt, ['eventCode']));
  }
}

function enrichEventWithDescription(event){
  const { eventCode, ...eventData } = event;
  return blueticketResource.getEventDetails(eventCode).then(({ data }) => {
    return {
      ...eventData,
      description: eventService.parseDescription(data.release)
    };
  });
}

module.exports = _public;
