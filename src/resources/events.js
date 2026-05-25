const ENV = require('../services/environment').get();
const baseResource = require('./base');

const _public = {};

const BASE_URL = `${ENV.VEEDGEE.API_BASE_URL}/events`;
const BULK_URL = `${ENV.VEEDGEE.API_BASE_URL}/bulk/events`;

_public.save = event => baseResource.post(BASE_URL, event, {
  headers: {
    vatoken: ENV.VEEDGEE.API_TOKEN
  }
});

_public.bulkSave = events => baseResource.post(BULK_URL, events, {
  headers: {
    vatoken: ENV.VEEDGEE.API_TOKEN
  }
});

_public.get = params => baseResource.get(BASE_URL, params);

module.exports = _public;
