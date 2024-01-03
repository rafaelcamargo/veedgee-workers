const fs = require('fs');

const _public = {};

_public.getMockedFile = filename => {
  const filepath = `${__dirname}/../mocks/${filename}`;
  return fs.readFileSync(filepath, 'utf-8');
};

module.exports = _public;
