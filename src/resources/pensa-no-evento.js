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

function buildParams(cityCode){
  return {
    cidades: [cityCode]
  };
}

module.exports = _public;
