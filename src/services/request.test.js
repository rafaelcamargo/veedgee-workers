const { BULK_REQUEST_ERROR } = require('../constants/eventNames');
const loggerService = require('./logger');
const requestService = require('./request');

describe('Request Service', () => {
  beforeEach(() => {
    loggerService.track = jest.fn();
  });

  it('should return all results when every request succeeds', async () => {
    const method = jest.fn(param => Promise.resolve(`result-${param}`));
    const result = await requestService.bulkRequest({
      method,
      params: ['a', 'b', 'c'],
      batchSize: 2
    });
    expect(method).toHaveBeenCalledTimes(3);
    expect(result).toEqual(['result-a', 'result-b', 'result-c']);
    expect(loggerService.track).not.toHaveBeenCalled();
  });

  it('should keep remaining requests when one request fails', async () => {
    const err = new Error('HTTP Error 400');
    err.status = 400;
    err.data = { message: 'bad request' };
    const method = jest.fn(param => {
      if (param === 'b') return Promise.reject(err);
      return Promise.resolve(`result-${param}`);
    });
    const result = await requestService.bulkRequest({
      method,
      params: ['a', 'b', 'c'],
      batchSize: 2
    });
    expect(method).toHaveBeenCalledTimes(3);
    expect(result).toEqual(['result-a', 'b', 'result-c']);
    expect(loggerService.track).toHaveBeenCalledWith(BULK_REQUEST_ERROR, err, {
      request_param: 'b',
      error_message: 'HTTP Error 400',
      error_status: 400,
      error_data: { message: 'bad request' }
    });
    expect(loggerService.track).toHaveBeenCalledTimes(1);
  });
});
