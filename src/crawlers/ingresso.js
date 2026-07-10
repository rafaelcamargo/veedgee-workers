const { CITIES } = require('../constants/ingresso');
const ingressoResource = require('../resources/ingresso');
const dateService = require('../services/date');
const eventService = require('../services/event');

const _public = {};

_public.crawl = () => {
  return Promise.all(CITIES.map(fetchNowPlayingByCity)).then(responses => responses.flat());
};

function fetchNowPlayingByCity({ id, city, state }){
  return ingressoResource.getNowPlaying(id).then(({ data }) => {
    return data?.items ? buildEvents(data.items, { city, state }) : [];
  });
}

function buildEvents(items, { city, state }){
  return items.flatMap(({ contentItems }) => contentItems.map(movie => formatMovieEvent({ ...movie, city, state })));
}

function formatMovieEvent({ title, url, premiereDate, contentType, city, state, images, synopsis }){
  const poster = images?.find(({ type }) => type === 'PosterPortrait');
  return {
    title,
    date: buildEventDate(premiereDate?.localDate),
    city,
    state,
    country: 'BR',
    url,
    category: contentType,
    image: poster?.url,
    description: eventService.parseDescription(synopsis)
  };
}

function buildEventDate(localDate){
  const premiereDate = localDate?.split?.('T')[0];
  const today = dateService.buildTodayDateString();
  return premiereDate > today ? premiereDate : today;
}

module.exports = _public;
