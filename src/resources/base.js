const { HTTP_REQUEST_ERROR } = require('../constants/eventNames');
const httpService = require('../services/http');
const loggerService = require('../services/logger');

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
      ...options?.headers
    },
    method: 'POST'
  });
};

function request(url, options) {
  const method = options?.method || 'GET';

  return httpService.fetch(url, options).then(async response => {
    const data = await parseResponseData(response);
    if (!isSuccessStatus(response.status)) {
      const error = buildHttpError(response, data);
      trackHttp({ url, method, status: response.status, error, data });
      throw error;
    }
    return {
      headers: response.headers,
      status: response.status,
      data
    };
  }).catch(error => {
    if (!error.status) trackHttp({ url, method, error });
    throw error;
  });
}

function trackHttp({ url, method, status, error, data }){
  const metadata = { http_url: url, http_method: method };
  if(status) metadata.http_status = status;
  if(data) metadata.http_response = serializeHttpResponse(data);
  loggerService.track(HTTP_REQUEST_ERROR, error, metadata);
}

function serializeHttpResponse(data){
  return typeof data === 'object' ? JSON.stringify(data) : data;
}

function isSuccessStatus(status){
  return status >= 200 && status < 300;
}

function buildHttpError(response, data){
  const error = new Error(`HTTP Error ${response.status}`);
  error.status = response.status;
  error.headers = response.headers;
  error.data = data;
  return error;
}

function buildFullUrl(baseUrl, queryParams){
  const fullUrl = new URL(baseUrl);
  if(queryParams) fullUrl.search = buildSearchParams(queryParams);
  return fullUrl.toString();
}

function buildSearchParams(paramsObj){
  const searchParams = new URLSearchParams();
  Object.entries(paramsObj).forEach(([key, value]) => {
    if(Array.isArray(value)) value.forEach(val => searchParams.append(`${key}[]`, val));
    else searchParams.append(key, value);
  });
  return searchParams;
}

async function parseResponseData(response){
  if(getContentType(response).includes('application/json')) return await response.json();
  if(getContentType(response).includes('text/html; charset=ISO-8859-1')) {
    return await response.arrayBuffer().then(decodeISO88591);
  }
  return await response.text();
}

function getContentType({ headers }){
  const attr = 'Content-Type';
  return headers.get(attr) || headers.get(attr.toLowerCase()) || '';
}

function decodeISO88591(arrayBuffer){
  const decoder = new TextDecoder('iso-8859-1');
  return decoder.decode(arrayBuffer);
}

module.exports = _public;
