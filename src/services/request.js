const { BULK_REQUEST_ERROR } = require('../constants/eventNames');
const loggerService = require('./logger');

const _public = {};

_public.bulkRequest = ({ method, params, batchSize }) => {
  const batches = chunk(params, batchSize);
  return batches.reduce(async (resultsPromise, batch) => {
    const results = await resultsPromise;
    const batchResults = await executeBatch(method, batch);
    return [...results, ...batchResults];
  }, Promise.resolve([]));
};

function executeBatch(method, batch) {
  return Promise.all(batch.map(param => executeRequest(method, param)));
}

function executeRequest(method, param) {
  return method(param).catch(err => {
    trackRequestError(err, param);
    return param;
  });
}

function trackRequestError(err, param) {
  loggerService.track(BULK_REQUEST_ERROR, err, {
    request_param: param,
    error_message: err.message,
    error_status: err.status,
    error_data: err.data
  });
}

function chunk(items, size) {
  return Array.from(
    { length: Math.ceil(items.length / size) },
    (_, index) => items.slice(index * size, index * size + size)
  );
}

module.exports = _public;
