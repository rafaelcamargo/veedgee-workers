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
        json: parse,
        arrayBuffer: () => Promise.resolve(encodeText(data))
      });
    });
  }

  function encodeText(text){
    const encoder = new TextEncoder();
    return encoder.encode(text);
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

  it('should make a get request handling response as iso-8859-1 text', async () => {
    const url = 'https://some.url.com/';
    const data = '<!DOCTYPE html><html><head><title>Document</title></head><body><p>Espaço Santo Fole</p></body></html>';
    mockRequestResponse(url, { headers: { 'content-type': 'text/html; charset=ISO-8859-1'}, status: 200, data});
    const response = await baseResource.get(url);
    expect(response.status).toEqual(200);
    expect(response.data).toEqual(
      '<!DOCTYPE html><html><head><title>Document</title></head><body><p>EspaÃ§o Santo Fole</p></body></html>'
    );
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

  it('should optionally make a get request passing headers', async () => {
    const url = 'https://some.url.com/';
    const headers = { some: 'header' };
    mockRequestResponse(url, { headers: { 'content-type': 'application/json'}, status: 200, data: {}});
    await baseResource.get(url, {}, { headers });
    expect(httpService.fetch).toHaveBeenCalledWith(url, { headers });
  });

  it('should make a post request', async () => {
    const url = 'https://some.url.com/';
    const body = { some: 'json' };
    const data = { id: '123', ...body };
    mockRequestResponse(url, { headers: { 'Content-Type': 'application/json'}, status: 201, data});
    const response = await baseResource.post(url, body, { headers: { vtoken: 'evc123' } });
    expect(httpService.fetch).toHaveBeenCalledWith(
      url,
      {
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json', vtoken: 'evc123' },
        method: 'POST'
      }
    );
    expect(response.status).toEqual(201);
    expect(response.data).toEqual(data);
  });
});
