const httpService = require('./http');

describe('Http Service', () => {
  it('should expoted fetch function point to Node\' native fetch function ', () => {
    expect(httpService.fetch).toEqual(fetch);
  });
});
