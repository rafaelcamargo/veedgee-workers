const httpService = require('../services/http');
const baseResource = require('./base');

describe('Base Resource', () => {
  function mockRequestResponse(expectedUrl, { headers, status, data }){
    const parse =() => Promise.resolve(data);
    httpService.fetch = jest.fn((url) => {
      return url === expectedUrl && Promise.resolve({
        status,
        headers: mapHeaders(headers),
        text: parse,
        json: parse
      });
    });
  }

  function mapHeaders(headers = {}){
    const result = new Map();
    Object.entries(headers).map(([key, value]) => result.set(key, value));
    return result;
  }
  
  it('should make a get request handling response as text by default', async () => {
    const url = 'https://some.url.com/';
    const data = '<!DOCTYPE html><html><head><title>Document</title></head><body><p>Hello</p></body></html>';
    mockRequestResponse(url, { headers: {}, status: 200, data});
    const response = await baseResource.get(url);
    expect(response.status).toEqual(200);
    expect(response.data).toEqual(data);
  });

  it('should make a get request handling JSON as response type', async () => {
    const url = 'https://some.url.com/';
    const data = { some: 'json' };
    mockRequestResponse(url, { headers: { 'content-type': 'application/json'}, status: 200, data});
    const response = await baseResource.get(url);
    expect(response.status).toEqual(200);
    expect(response.data).toEqual(data);
  });

  it('should optionally make a get request using query params', async () => {
    const url = 'https://some.url.com/';
    const params = { slug: 'my-event-123' };
    mockRequestResponse(`${url}?slug=${params.slug}`, { headers: { 'content-type': 'application/json'}, status: 200, data: {}});
    await baseResource.get(url, params);
    expect(httpService.fetch).toHaveBeenCalledWith(`${url}?slug=${params.slug}`, undefined);
  });

  it('should make a post request', async () => {
    const url = 'https://some.url.com/';
    const body = { some: 'json' };
    const data = { id: '123', ...body };
    mockRequestResponse(url, { headers: { 'Content-Type': 'application/json'}, status: 201, data});
    const response = await baseResource.post(url, body);
    expect(httpService.fetch).toHaveBeenCalledWith(
      url,
      { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, method: 'POST' }
    );
    expect(response.status).toEqual(201);
    expect(response.data).toEqual(data);
  });
});
