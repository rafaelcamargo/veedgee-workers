const { BASE_URL, IMAGE_BASE_URL } = require('../constants/disk-ingressos');
const eventCategoryService = require('../services/event-category');
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
    return shouldCrawl(event) ? [...result, formatEvent(event)] : result;
  }, []);
}

function shouldCrawl(event){
  const { city, state } = event._source;
  return eventService.isWantedCity(city, state);
}

function formatEvent(event){
  const { eventname, date, city, state, classification, imagewebp: webpImgPath, image: defaultImgPath } = event._source;
  const category = eventCategoryService.findCategoryByKeywords(classification);
  const image = buildImageURL({ webpImgPath, defaultImgPath });
  return {
    title: eventname,
    date,
    city,
    state,
    country: 'BR',
    url: buildEventURL(event._source),
    ...(category && { category }),
    ...(image && { image })
  };
}

function buildImageURL({ webpImgPath, defaultImgPath }){
  const imgPath = [webpImgPath, defaultImgPath].find(Boolean);
  return imgPath && `${IMAGE_BASE_URL}${imgPath}`;
}

function buildEventURL({ date, eventname, city, state, slug, groupid }){
  const uri = [
    buildUrlPrfix(groupid),
    slug,
    formatDate(date),
    state,
    city,
    eventname.replace(/\//g, '-')
  ].map(text => urlService.buildSlug(text)).join('/');
  return `${BASE_URL}/${uri}`;
}

function buildUrlPrfix(groupid){
  return groupid === 0 ? 'evento' : 'grupo';
}

function formatDate(dateString){
  return dateString.split('-').reverse().join('-');
}

module.exports = _public;
