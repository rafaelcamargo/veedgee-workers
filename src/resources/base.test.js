const axios = require('axios');
const baseResource = require('./base');

jest.mock('axios');

describe('Base Resource', () => {
  it('should make a get request', () => {
    const url = 'http://some.url.com/users';
    baseResource.get(url);
    expect(axios).toHaveBeenCalledWith({ method: 'get', url });
  });

  it('should make a get request containing params', () => {
    const url = 'http://some.url.com/users';
    const params = { limit: 10 };
    baseResource.get(url, { params });
    expect(axios).toHaveBeenCalledWith({ method: 'get', url, params });
  });

  it('should make a get request containing other options', () => {
    const url = 'http://some.url.com/users';
    const header = { 'Content-Type': 'application/json' };
    baseResource.get(url, { header });
    expect(axios).toHaveBeenCalledWith({ method: 'get', url, header });
  });

  it('should be able to do a post request', () => {
    const url = 'http://some.url.com';
    const data = { email: 'asd@asd.com' };
    baseResource.post(url, data);
    expect(axios).toHaveBeenCalledWith({ method: 'post', url, data });
  });

  it('should be able to do a post request passing options', () => {
    const url = 'http://some.url.com';
    const data = { email: 'asd@asd.com' };
    const options = { headers: { some: 'header' } };
    baseResource.post(url, data, options);
    expect(axios).toHaveBeenCalledWith({ method: 'post', url, data, ...options });
  });
});
