const ENV = require('../services/environment').get();
const baseResource = require('./base');
const rapidApiResource = require('./rapid-api');

describe('Rapid API Resource', () => {
  beforeEach(() => {
    baseResource.post = jest.fn();
  });

  it('should get instagram posts', () => {
    const username = 'poraodaliga';
    rapidApiResource.getInstagramPosts({ username });
    expect(baseResource.post).toHaveBeenCalledWith(
      'https://instagram120.p.rapidapi.com/api/instagram/posts',
      { username },
      {
        headers: {
          'x-rapidapi-host': 'instagram120.p.rapidapi.com',
          'x-rapidapi-key': ENV.RAPID_API_TOKEN
        }
      }
    );
  });
});
