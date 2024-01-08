const crawlersWorker = require('./crawlers');

const _public = {};

_public.init = () => {
  crawlersWorker.init();
};

module.exports = _public;
