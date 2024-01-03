const baseResource = require('./base');

const _public = {};

_public.get = () => {
  return baseResource.get('https://www.eventim.com.br/city/curitiba-1796/', {
    headers: {
      'accept-language': 'en-US,en;q=0.6',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
};

module.exports = _public;
