const { BASE_URL } = require('../constants/blueticket');
const baseResource = require('./base');

const _public = {};

_public.get = params => baseResource.get(`${BASE_URL}/events/list`, params, {
  headers: {
    pdv: '100'
  }
});

_public.getEventDetails = eventCode => baseResource.get(
  `https://api-cdn.blueticket.com.br/api/v2/event/detail/${eventCode}`
);

module.exports = _public;
