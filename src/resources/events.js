const ENV = require('../services/environment')();
const baseResource = require('./base');

const _public = {};

const BASE_URL = `${ENV.VEEDGEE.API_BASE_URL}/events`;

_public.save = event => baseResource.post(BASE_URL, event, {
  headers: {
    vatoken: ENV.VEEDGEE.API_TOKEN
  }
});

_public.get = params => baseResource.get(BASE_URL, params);

module.exports = _public;
