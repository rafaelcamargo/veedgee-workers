const notificationsController = require('../controllers/notifications');
const { isPermitted } = require('../services/permission');

const _public = {};

_public.init = app => {
  app.post('/notifications', isPermitted, notificationsController.start);
};

module.exports = _public;


