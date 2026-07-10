const { WANTED_CITIES } = require('../constants/events');
const symplaResource = require('../resources/sympla');
const dateService = require('../services/date');
const eventCategoryService = require('../services/event-category');
const eventService = require('../services/event');
const objectService = require('../services/object');
const { removeAccents } = require('../services/text');

const _public = {};

_public.crawl = () => {
  return Promise.all(buildLocations().map(fetchContentByLocation))
    .then(buildEventsList);
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
    const [date, time] = parseDateTime(item.start_date_formats.en);
    const category = eventCategoryService.findCategoryByKeywords(
      eventCategoryService.extractCategoryKeywordsFromText(item.name)
    );
    return objectService.removeFalsyAttrs({
      title: item.name,
      date,
      time,
      city: item.location.city,
      state: item.location.state,
      country: 'BR',
      url: item.url,
      category,
      image: item.images?.original
    });
  });
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

module.exports = _public;
