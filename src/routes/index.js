const root = require('./root');
const crawlers = require('./crawlers');
const notifications = require('./notifications');

const _public = {};

_public.init = app => {
  root.init(app);
  crawlers.init(app);
  notifications.init(app);
};

module.exports = _public;
