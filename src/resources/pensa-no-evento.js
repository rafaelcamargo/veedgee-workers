const { BASE_URL } = require('../constants/pensa-no-evento');
const baseResource = require('./base');

const _public = {};

_public.get = ({ cityCode }) => {
  return baseResource.get(`${BASE_URL}/sitev2/api/eventos/busca`, buildParams(cityCode), {
    headers: {
      'x-public-token': 'pne-site-api'
    }
  });
};

_public.getEventDetailsPage = url => baseResource.get(url);

function buildParams(cityCode){
  return {
    cidades: [cityCode]
  };
}

module.exports = _public;
