const { serve } = require('../services/testing');

describe('Root Routes', () => {
  it('should get status', async () => {
    const response = await serve().get('/');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
