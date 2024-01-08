const ENV = require('../services/environment')();
const baseResource = require('./base');

const _public = {};

const BASE_URL = `${ENV.VEEDGEE.API_BASE_URL}/events`;

_public.save = event => {
  return baseResource.post(BASE_URL, event);
};

_public.get = params => {
  const options = params ? { params } : {};
  return baseResource.get(BASE_URL, options);
};

module.exports = _public;
