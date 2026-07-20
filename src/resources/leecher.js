const ENV = require('../services/environment').get();
const baseResource = require('./base');

const BASE_URL = `${ENV.LEECHER_BASE_URL}/documents`;

const _public = {};

_public.crawlViaGet = (url, options) => {
  return baseResource.get(BASE_URL, { url }, {
    headers: buildCustomHeaders(options?.headers)
  });
};

_public.crawlViaPost = (url, body) => {
  return baseResource.post(BASE_URL, { url, body });
};

function buildCustomHeaders(headers = {}){
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [`X-custom-${key}`, value])
  );
}

module.exports = _public;
