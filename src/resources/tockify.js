const { BASE_URL } = require('../constants/tockify');
const baseResource = require('./base');

const _public = {};

_public.get = params => baseResource.get(`${BASE_URL}/ngevent`, params);

module.exports = _public;
