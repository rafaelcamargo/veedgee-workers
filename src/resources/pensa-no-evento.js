const { BASE_URL } = require('../constants/pensa-no-evento');
const baseResource = require('./base');

const _public = {};

_public.get = () => {
  return baseResource.get(`${BASE_URL}/sitev2/api/eventos/busca`, buildParams(), {
    headers: {
      'x-public-token': 'pne-site-api'
    }
  });
};

function buildParams(){
  return {
    cidades: ['19']
  };
}

module.exports = _public;
