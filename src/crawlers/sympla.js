const { WANTED_CITIES } = require('../constants/events');
const symplaResource = require('../resources/sympla');
const dateService = require('../services/date');
const eventService = require('../services/event');
const objectService = require('../services/object');
const reportService = require('../services/report');
const requestService = require('../services/request');
const { removeAccents } = require('../services/text');
const { useCounter } = require('../hooks/useCounter');

const _public = {};

_public.crawl = reportId => {
  return Promise.all(buildLocations().map(fetchContentByLocation))
    .then(buildEventsList)
    .then(events => enrichEventsWithDescriptions(events, reportId));
};

function buildLocations(){
  return WANTED_CITIES.map(({ city, state }) => ({
    city: removeAccents(city.toLocaleLowerCase()),
    state
  }));
}

function fetchContentByLocation({ city, state }){
  return symplaResource.get({ city, state });
}

function buildEventsList(responses){
  return responses.map(({ data }) => data?.data ? buildEvents(data.data) : []).flat();
}

function buildEvents(data){
  return data.filter(item => {
    const { location } = item;
    return eventService.isWantedCity(location.city, location.state);
  }).map(item => {
    const [date, time] = parseEventDateTime(item);
    return {
      title: item.name,
      date,
      time,
      city: item.location.city,
      state: item.location.state,
      country: 'BR',
      url: item.url,
      image: item.images?.original,
      id: item.id
    };
  });
}

function parseEventDateTime(item){
  return item.start_date
    ? dateService.buildDateAndTimeFromUTCIsoDateString(item.start_date)
    : parseDateTime(item.start_date_formats.en);
}

function parseDateTime(dateTimeString){
  const [date, time] = dateTimeString.split(' · ');
  return [parseDate(date), time];
}

function parseDate(dateString){
  const [day, monthName, year] = dateString.split(', ')[1].replace(' - ', ' ').split(' ');
  const month = dateService.convertMonthPrefixToNumber(monthName);
  return `${year}-${month}-${day.padStart(2, '0')}`;
}

async function enrichEventsWithDescriptions(events, reportId){
  const { check } = useCounter();
  const task = 'Crawling: sympla (descriptions)';
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
    return events.map(evt => objectService.removeAttrs(evt, ['id']));
  }
}

function enrichEventWithDescription(event){
  const eventData = objectService.removeAttrs(event, ['id']);
  const getEventDetails = getEventDetailsResourceMethod(eventData.url);
  const eventId = getEventId(event);
  return getEventDetails(eventId).then(({ data }) => {
    return {
      ...eventData,
      description: eventService.parseDescription(getEventDescription(data, eventData.url))
    };
  });
}

function getEventDetailsResourceMethod(eventUrl){
  return eventUrl.includes('bileto')
    ? symplaResource.getBiletoEventDetails
    : symplaResource.getEventDetails;
}

function getEventId(event){
  return event.url.includes('bileto') ? parseBiletoEventId(event.url) : event.id;
}

function parseBiletoEventId(eventUrl){
  const [id] = eventUrl.split('/').reverse();
  return id;
}

function getEventDescription(data, eventUrl){
  return eventUrl.includes('bileto') ? data.description.raw : data.detail;
}

module.exports = _public;
