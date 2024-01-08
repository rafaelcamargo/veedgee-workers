const eventsService = require('../services/event');
const eventimService = require('../services/eventim');

const _public = {};

_public.init = () => eventimService.get().then(eventsService.multiSave);

module.exports = _public;
