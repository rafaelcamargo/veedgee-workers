const root = require('./root');
const crawlers = require('./crawlers');
const enrichments = require('./enrichments');
const notifications = require('./notifications');

const _public = {};

_public.init = app => {
  root.init(app);
  crawlers.init(app);
  enrichments.init(app);
  notifications.init(app);
};

module.exports = _public;
