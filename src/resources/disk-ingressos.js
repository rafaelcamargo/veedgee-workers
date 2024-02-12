const { BASE_URL } = require('../constants/disk-ingressos');
const baseResource = require('./base');

const _public = {};

_public.get = params => baseResource.get(`${BASE_URL}/home/_search`, params);

module.exports = _public;
