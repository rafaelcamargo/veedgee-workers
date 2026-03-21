const dateService = require('../services/date');
const eventsResource = require('../resources/events');
const eventsMailer = require('../mailers/events');

const _public = {};

_public.start = (req, res) => {
  const startTime = Date.now();
  const minCreationDate = req.body.minCreationDate || dateService.buildTodayDateString();
  return eventsResource.get({ minCreationDate }).then(({ data }) => {
    if(data.length) {
      return eventsMailer.send(data.sort(sortByCity), minCreationDate).then(stats => {
        res.status(200).send({ ...stats, ...buildDurationStats(startTime) });
      });
    }
    return res.status(200).send(buildDurationStats(startTime));
  });
};

function sortByCity(a, b){
  return a.city > b.city ? 1 : -1;
}

function buildDurationStats(startTime){
  return { duration:  Date.now() - startTime };
}

module.exports = _public;
