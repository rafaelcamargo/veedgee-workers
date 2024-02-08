const baseResource = require('./base');

const _public = {};

_public.get = () => {
  return baseResource.get('https://www.eventim.com.br/city/curitiba-1796/');
};

module.exports = _public;
