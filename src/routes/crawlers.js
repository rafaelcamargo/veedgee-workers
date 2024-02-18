const crawlersController = require('../controllers/crawlers');
const { isPermitted } = require('../services/permission');

const _public = {};

_public.init = app => {
  app.post('/crawlers', isPermitted, crawlersController.start);
};

module.exports = _public;


