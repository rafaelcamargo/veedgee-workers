const { BASE_URL } = require('../constants/eticket-center');
const baseResource = require('./base');

const _public = {};

_public.get = params => baseResource.get(`${BASE_URL}/eventos`, params);

_public.getEventDetailsPage = url => baseResource.get(url);

module.exports = _public;
