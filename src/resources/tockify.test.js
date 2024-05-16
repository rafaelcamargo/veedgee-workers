const baseResource = require('./base');
const dateService = require('../services/date');
const tockifyResource = require('./tockify');

describe('Tockify Resource', () => {
  function getTockifyBaseUrl(){
    return 'https://tockify.com/api/ngevent';
  }

  beforeEach(() => {
    baseResource.get = jest.fn();
  });

  it('should get events', () => {
    dateService.getNow = jest.fn(() => new Date(2024, 4, 16));
    tockifyResource.get();
    expect(baseResource.get).toHaveBeenCalledWith(getTockifyBaseUrl(), undefined);
  });

  it('should optionally filter events by passing query params', () => {
    const params = { some: 'param' };
    tockifyResource.get(params);
    expect(baseResource.get).toHaveBeenCalledWith(getTockifyBaseUrl(), params);
  });
});
