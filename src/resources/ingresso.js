const { BASE_URL } = require('../constants/ingresso');
const baseResource = require('./base');

const _public = {};

_public.getNowPlaying = cityId => baseResource.get(`${BASE_URL}/carousels/${cityId}`, {
  partnership: 'home',
  carousels: 'em-cartaz',
  limit: 15
});

module.exports = _public;
