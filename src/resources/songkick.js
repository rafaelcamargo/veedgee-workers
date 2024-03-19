const { BASE_URL } = require('../constants/songkick');
const baseResource = require('./base');

const _public = {};

_public.get = ({ city, page }) => {
  return baseResource.get(buildUrl(city, page));
};

function buildUrl(city, page){
  return [appendCitySlug, appendPageQueryParam].reduce((url, execute) => {
    return execute(url, { city, page });
  }, `${BASE_URL}/metro-areas`);
}

function appendCitySlug(url, { city }){
  return `${url}/${getCityIdByCityName(city)}-brazil-${city}`;
}

function getCityIdByCityName(city){
  return {
    'blumenau': '26976',
    'curitiba': '27043',
    'florianopolis': '27059',
    'itajai': '27099',
    'joinville': '27129',
    'porto-alegre': '27218'
  }[city];
}

function appendPageQueryParam(url, { page }){
  return page > 1 ? `${url}?page=${page}` : url;
}

module.exports = _public;
