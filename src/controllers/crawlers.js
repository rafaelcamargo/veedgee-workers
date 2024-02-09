const eventsService = require('../services/event');
const eventimService = require('../services/eventim');

const _public = {};

_public.start = (req, res) => {
  return eventimService.get().then(eventsService.multiSave).then(() => res.status(200).send());
};

module.exports = _public;
