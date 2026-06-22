const dateService = require('../services/date');
const eventsResource = require('../resources/events');
const eventsMailer = require('../mailers/events');

const _public = {};

_public.start = (req, res) => {
  const startTime = Date.now();
  const todayDate = req.body.minCreationDate || dateService.buildTodayDateString();
  const yesterdayDate = dateService.buildYesterdayDateString(todayDate);
  return eventsResource.get({ minCreationDate: yesterdayDate }).then(({ data }) => {
    const todayEvents = filterEventsByCreationDate(data, todayDate);
    const yesterdayMovies = filterYesterdayMovies(data, yesterdayDate);
    const events = removeDuplicateMovies(todayEvents, yesterdayMovies);
    if(events.length) {
      return eventsMailer.send(events.sort(sortByCity), todayDate).then(stats => {
        res.status(200).send({ ...stats, ...buildDurationStats(startTime) });
      });
    }
    return res.status(200).send(buildDurationStats(startTime));
  });
};

function filterEventsByCreationDate(events, dateString){
  return events.filter(({ created_at }) => isCreatedOnDate(created_at, dateString));
}

function filterYesterdayMovies(events, yesterdayDate){
  return events.filter(({ slug, created_at }) => {
    return slug?.startsWith('cinema') && isCreatedOnDate(created_at, yesterdayDate);
  });
}

function removeDuplicateMovies(todayEvents, yesterdayMovies){
  const yesterdayMovieKeys = new Set(yesterdayMovies.map(buildMovieKey));
  return todayEvents.filter(event => {
    return !isMovie(event) || !yesterdayMovieKeys.has(buildMovieKey(event));
  });
}

function isMovie({ slug }){
  return slug?.startsWith('cinema');
}

function buildMovieKey({ title, city, state }){
  return [title, city, state].join('|');
}

function isCreatedOnDate(createdAt, dateString){
  return createdAt.split('T')[0] === dateString;
}

function sortByCity(a, b){
  return a.city > b.city ? 1 : -1;
}

function buildDurationStats(startTime){
  return { duration:  Date.now() - startTime };
}

module.exports = _public;
