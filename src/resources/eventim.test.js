const baseResource = require('./base');
const eventimResource = require('./eventim');

describe('Eventim Resource', () => {
  beforeEach(() => {
    baseResource.get = jest.fn();
  });

  it('should get eventim events', () => {
    eventimResource.get();
    expect(baseResource.get).toHaveBeenCalledWith('https://www.eventim.com.br/city/curitiba-1796/');
  });
});
