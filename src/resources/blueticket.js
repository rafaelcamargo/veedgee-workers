const { BASE_URL } = require('../constants/blueticket');
const baseResource = require('./base');

const _public = {};

_public.get = params => baseResource.get(`${BASE_URL}/events/list`, params, {
  headers: {
    pdv: '100'
  }
});

module.exports = _public;
