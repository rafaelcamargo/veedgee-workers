const notificationsController = require('../controllers/notifications');

const _public = {};

_public.init = app => {
  app.post('/notifications', notificationsController.start);
};

module.exports = _public;


