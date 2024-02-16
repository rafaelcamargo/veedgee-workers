const dateService = require('./date');

describe('Date Service', () => {
  it('should get now date', () => {
    const now = new Date();
    expect(dateService.getNow().getTime()).toEqual(now.getTime());
  });
});
