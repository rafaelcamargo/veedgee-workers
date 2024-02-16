const dateService = require('./date');

describe('Date Service', () => {
  it('should get now date', () => {
    const [now] = new Date().toISOString().split('.');
    const [serviceNow] = dateService.getNow().toISOString().split('.');
    expect(serviceNow).toEqual(now);
  });
});
