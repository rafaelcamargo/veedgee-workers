const ENV = require('../services/environment').get();
const { BASE_URL } = require('../constants/rapid-api');
const baseResource = require('./base');

const _public = {};

_public.getInstagramPosts = ({ username }) => {
  return baseResource.post(
    `${BASE_URL}/instagram/posts`,
    { username },
    { headers: buildRapidApiHeaders() }
  );
};

function buildRapidApiHeaders(){
  return {
    'x-rapidapi-host': 'instagram120.p.rapidapi.com',
    'x-rapidapi-key': ENV.RAPID_API_TOKEN
  };
}

module.exports = _public;
