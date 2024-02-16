const dateService = require('./date');

describe('Date Service', () => {
  it('should get now date', () => {
    const now = new Date().getTime();
    const serviceNow = dateService.getNow().getTime();
    expect(serviceNow).toEqual(now);
  });
});
