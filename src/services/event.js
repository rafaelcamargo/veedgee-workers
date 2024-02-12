const { WANTED_CITIES } = require('../constants/events');
const {
  removeAccents,
  capitalize,
  removeUnnecessarySpaces,
  fixInvalidSpaceChars
} = require('../services/text');
const urlService = require('../services/url');
const eventsResource = require('../resources/events');

const _public = {};

_public.multiSave = events => Promise.all(events.map(event => {
  return saveIfNotExists(formatEvent(event));
}));

_public.isWantedCity = cityName => {
  const parse = name => removeAccents(name).toLowerCase();
  return WANTED_CITIES.map(parse).includes(parse(cityName));
};

function formatEvent(event){
  const {
    title,
    date,
    time,
    city,
    state,
    country,
    url
  } = event;
  return {
    title: capitalize(removeUnnecessarySpaces(fixInvalidSpaceChars(title))),
    date,
    time,
    city,
    state,
    country,
    url,
    slug: buildEventSlug(event)
  };
}

function saveIfNotExists(event){
  return eventsResource.get({ slug: event.slug }).then(({ data }) => {
    return data.length === 0 && eventsResource.save(event);
  });
}

function buildEventSlug(event){
  const { title, date, city, state } = event;
  return [
    title,
    city,
    state,
    date.replace(/-/g,'')
  ].reduce((result, text) => {
    return [...result, urlService.buildSlug(text)];
  }, []).join('-');
}

module.exports = _public;
