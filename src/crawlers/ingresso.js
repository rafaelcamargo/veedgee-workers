const ingressoResource = require('../resources/ingresso');
const dateService = require('../services/date');

const _public = {};

_public.crawl = () => {
  return ingressoResource.getNowPlaying().then(({ data }) => {
    return data?.items ? buildEvents(data.items) : [];
  });
};

function buildEvents(items){
  return items.flatMap(({ contentItems }) => contentItems.map(formatMovieEvent));
}

function formatMovieEvent({ title, url, premiereDate, contentType }){
  return {
    title,
    date: buildEventDate(premiereDate?.localDate),
    city: 'Joinville',
    state: 'SC',
    country: 'BR',
    url,
    category: contentType
  };
}

function buildEventDate(localDate){
  const premiereDate = localDate?.split?.('T')[0];
  const today = dateService.buildTodayDateString();
  return premiereDate > today ? premiereDate : today;
}

module.exports = _public;
