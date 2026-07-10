const cheerio = require('cheerio');

const _public = {};

_public.createHTMLFromString = htmlString => {
  const $ = cheerio.load(htmlString);
  return {
    textContent: $.root().text()
  };
};

module.exports = _public;
