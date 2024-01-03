const axios = require('axios');

const _public = {};

_public.get = (url, options) => {
  return request({
    method: 'get',
    url,
    ...options,
  });
};

function request(config) {
  return axios(config);
}

module.exports = _public;
