const ENV = require('../services/environment').get();
const baseResource = require('./base');

const BASE_URL = `${ENV.LEECHER_BASE_URL}/documents`;

const _public = {};

_public.crawlViaGet = url => {
  return baseResource.get(BASE_URL, { url });
};

_public.crawlViaPost = (url, body) => {
  return baseResource.post(BASE_URL, { url, body });
};

module.exports = _public;
