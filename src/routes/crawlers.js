const crawlersController = require('../controllers/crawlers');

const _public = {};

_public.init = app => {
  app.post('/crawlers', crawlersController.start);
};

module.exports = _public;


