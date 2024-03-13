const httpService = require('../services/http');

const _public = {};

_public.get = (url, params, options) => {
  return request(buildFullUrl(url, params), options);
};

_public.post = (url, body, options) => {
  return request(url, {
    ...options,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    method: 'POST'
  });
};

function request(url, options) {
  return httpService.fetch(url, options).then(async response => {
    const data = await parseResponseData(response);
    return {
      headers: response.headers,
      status: response.status,
      data
    };
  });
}

function buildFullUrl(baseUrl, queryParams){
  const fullUrl = new URL(baseUrl);
  if(queryParams) fullUrl.search = new URLSearchParams(queryParams);
  return fullUrl.toString();
}

async function parseResponseData(response){
  if(getContentType(response).includes('application/json')) return await response.json();
  return await response.text();
}

function getContentType({ headers }){
  const attr = 'Content-Type';
  return headers.get(attr) || headers.get(attr.toLowerCase()) || '';
}

module.exports = _public;
