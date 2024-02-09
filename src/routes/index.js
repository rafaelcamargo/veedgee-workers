const root = require('./root');
const crawlers = require('./crawlers');

const _public = {};

_public.init = app => {
  root.init(app);
  crawlers.init(app);
};

module.exports = _public;
