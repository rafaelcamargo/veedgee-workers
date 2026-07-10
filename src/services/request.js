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
  return Promise.all(batch.map(method));
}

function chunk(items, size) {
  return Array.from(
    { length: Math.ceil(items.length / size) },
    (_, index) => items.slice(index * size, index * size + size)
  );
}

module.exports = _public;
