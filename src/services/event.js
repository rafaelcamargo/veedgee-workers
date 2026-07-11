const { WANTED_CITIES } = require('../constants/events');
const {
  removeAccents,
  capitalize,
  removeUnnecessarySpaces,
  fixInvalidSpaceChars
} = require('../services/text');
const dateService = require('../services/date');
const htmlService = require('../services/html');
const objectService = require('../services/object');
const urlService = require('../services/url');
const eventFetcherService = require('../services/event-fetcher');
const eventsResource = require('../resources/events');

const _public = {};

_public.multiSave = events => {
  return getEventSlugsFromToday().then(existingEventSlugs => {
    const newEvents = events
      .map(evt => formatEvent(formatEventDate(evt)))
      .filter(event => isEventValid(event, existingEventSlugs));
    return newEvents.length
      ? eventsResource.bulkSave(newEvents)
      : Promise.resolve();
  });
};

_public.isWantedCity = (cityName, cityState) => {
  const parse = name => removeAccents(name).toLowerCase();
  return !!WANTED_CITIES.find(item => {
    return parse(item.city) === parse(cityName) && parse(item.state) === parse(cityState);
  });
};

_public.parseDescription = description => {
  if (!description) return '';
  const html = htmlService.createHTMLFromString(description);
  return html.textContent.substring(0, 1000);
};

function getEventSlugsFromToday(){
  return eventFetcherService.cachedFetch({ minDate: dateService.buildTodayDateString() }).then(({ data }) => {
    return data.map(({ slug }) => slug);
  });
}

function formatEvent(event){
  const {
    title,
    date,
    time,
    city,
    state,
    country,
    url,
    category,
    image,
    description
  } = event;
  return objectService.removeFalsyAttrs({
    title: capitalize(removeUnnecessarySpaces(fixInvalidSpaceChars(title))),
    date,
    time,
    city,
    state,
    country,
    url,
    category,
    image,
    description,
    slug: buildEventSlug(event)
  });
}

function isEventValid({ date, slug }, existingEventSlugs){
  return !!date && !isPastEventDate(date) && !existingEventSlugs.includes(slug);
}

function isPastEventDate(date){
  return dateService.isValidISODateString(date)
    && date < dateService.buildTodayDateString();
}

function formatEventDate(event){
  return {
    ...event,
    date: dateService.isValidISODateString(event.date) ? event.date : ''
  };
}

function buildEventSlug(event){
  const { title, date, city, state, category } = event;
  return [
    getSlugPrefix(category),
    title,
    city,
    state,
    date.replace(/-/g,'')
  ].reduce((result, text) => {
    return [...result, urlService.buildSlug(text)];
  }, []).filter(value => !!value).join('-');
}

function getSlugPrefix(category){
  return {
    movies: 'cinema'
  }[category] || '';
}

module.exports = _public;
