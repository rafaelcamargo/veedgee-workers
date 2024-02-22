const { BASE_URL } = require('../constants/eticket-center');
const baseResource = require('./base');

const _public = {};

_public.get = params => baseResource.get(`${BASE_URL}/eventos`, params);

module.exports = _public;
