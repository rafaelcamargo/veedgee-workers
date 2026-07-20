const baseResource = require('./base');
const leecherResource = require('./leecher');

describe('Leecher Resource', () => {
  function getLeecherDocumentsUrl() {
    return 'http://localhost:9009/documents';
  }

  beforeEach(() => {
    baseResource.get = jest.fn();
    baseResource.post = jest.fn();
  });

  it('should crawl a document via get', () => {
    const url = 'https://example.com/event';
    leecherResource.crawlViaGet(url);
    expect(baseResource.get).toHaveBeenCalledWith(getLeecherDocumentsUrl(), { url }, { headers: {} });
  });

  it('should crawl a document via get forwarding custom headers', () => {
    const url = 'https://example.com/event';
    const headers = { 'x-api-key': '123abc' };
    leecherResource.crawlViaGet(url, { headers });
    expect(baseResource.get).toHaveBeenCalledWith(getLeecherDocumentsUrl(), { url }, {
      headers: { 'X-custom-x-api-key': '123abc' }
    });
  });

  it('should crawl a document via post', () => {
    const url = 'https://example.com/event';
    const data = { some: 'data' };
    leecherResource.crawlViaPost(url, data);
    expect(baseResource.post).toHaveBeenCalledWith(getLeecherDocumentsUrl(), { url, body: data });
  });
});
