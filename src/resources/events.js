const ENV = require('../services/environment').get();
const baseResource = require('./base');

const _public = {};

const BASE_URL = `${ENV.VEEDGEE.API_BASE_URL}/events`;
const BULK_URL = `${ENV.VEEDGEE.API_BASE_URL}/bulk/events`;

_public.save = event => baseResource.post(BASE_URL, event, buildOptions());

_public.bulkSave = events => baseResource.post(BULK_URL, events, buildOptions());

_public.get = params => baseResource.get(BASE_URL, params);

function buildOptions(){
  return {
    headers: {
      vatoken: ENV.VEEDGEE.API_TOKEN
    }
  };
}

module.exports = _public;
