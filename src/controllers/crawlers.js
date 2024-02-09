const eventsService = require('../services/event');
const eventimService = require('../services/eventim');

const _public = {};

_public.start = (req, res) => {
  return eventimService.get().then(events => {
    return eventsService.multiSave(events);
  }).then(() => {
    res.status(200).send();
  }).catch(err => {
    console.error(err);
    res.status(500).send({ error: err });
  });
};

module.exports = _public;
