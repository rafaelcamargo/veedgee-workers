const eventsResource = require('../resources/events');

const _public = {};

let fetchPromise;
let cachedResult;

_public.cachedFetch = params => {
  if(fetchPromise) return fetchPromise;
  if(cachedResult) return Promise.resolve(cachedResult);
  fetchPromise = eventsResource.get(params).then(response => {
    fetchPromise = null;
    cachedResult = response;
    return cachedResult;
  });
  return fetchPromise;
};

_public.flushCache = () => {
  cachedResult = null;
  fetchPromise = null;
};

module.exports = _public;
