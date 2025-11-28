const delayService  = require('./delay');

describe('Delay', () => {
  it('should pause execution', async () => {
    const timeout = 500;
    const start = Date.now();
    await delayService.pause(500);
    const end = Date.now();
    const delay = end - start;
    expect(delay - timeout >= 0).toEqual(true);
  });
});
