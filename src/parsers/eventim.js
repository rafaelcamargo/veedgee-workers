const cheerio = require('cheerio');
const textService = require('../services/text');

const _public = {};

_public.parse = htmlString => {
  const $ = cheerio.load(htmlString);
  return buildEventsData(getEvents($, $('script[type="application/ld+json"]')));
};

function getEvents($, jsonScriptTags){
  return Array.from(jsonScriptTags)
    .map(tag => JSON.parse($(tag).text()))
    .filter(evt => evt['@type'] == 'MusicEvent');
}

function buildEventsData(events){
  return events.map(buildEvent);
}

function buildEvent({ name, location, startDate, url }){
  const { city, state, country } = parseEventLocation(location);
  const { date, time } = parseEventDate(startDate);
  return {
    title: textService.capitalize(textService.fixMultiSpaces(name)),
    date,
    time,
    city,
    state,
    country,
    url
  };
}

function parseEventLocation({ address }){
  return {
    city: textService.capitalize(address.addressLocality),
    state: address.addressRegion,
    country: address.addressCountry
  };
}

function parseEventDate(startDate){
  const [date, hour] = startDate.split('T');
  const [time] = hour.split(':00.000');
  return {
    date,
    time
  };
}

module.exports = _public;
