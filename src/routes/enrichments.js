const enrichmentsController = require('../controllers/enrichments');
const { isPermitted } = require('../services/permission');

const _public = {};

_public.init = app => {
  app.post('/enrichments', isPermitted, enrichmentsController.start);
};

module.exports = _public;
