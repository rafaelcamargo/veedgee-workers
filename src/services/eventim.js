const eventimResource = require('../resources/eventim');
const eventimParser = require('../parsers/eventim');

const _public = {};

_public.get = () => {
  return eventimResource.get().then(({ data }) => {
    return eventimParser.parse(data);
  });
};

module.exports = _public;
