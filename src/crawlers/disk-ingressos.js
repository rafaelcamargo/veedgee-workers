const { BASE_URL } = require('../constants/disk-ingressos');
const eventService = require('../services/event');
const urlService = require('../services/url');
const diskIngressosResource = require('../resources/disk-ingressos');

const _public = {};

_public.crawl = () => {
  return diskIngressosResource.get({ size: 1000, from: 0 }).then(({ data }) => {
    return data?.hits?.hits ? buildEvents(data.hits.hits) : [];
  });
};

function buildEvents(events){
  return events.reduce((result, event) => {
    return shouldCrawl(event) ? [...result, FormatEvent(event)] : result;
  }, []);
}

function shouldCrawl(event){
  const { city, state } = event._source;
  return eventService.isWantedCity(city, state);
}

function FormatEvent(event){
  const { eventname, date, city, state } = event._source;
  return {
    title: eventname,
    date,
    city,
    state,
    country: 'BR',
    url: buildEventURL(event._source)
  };
}

function buildEventURL({ date, eventname, city, state, slug }){
  const uri = [
    'evento',
    slug,
    formatDate(date),
    state,
    city,
    eventname.replace(/\//g, '-')
  ].map(text => urlService.buildSlug(text)).join('/');
  return `${BASE_URL}/${uri}`;
}

function formatDate(dateString){
  return dateString.split('-').reverse().join('-');
}

module.exports = _public;
