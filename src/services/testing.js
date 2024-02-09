const fs = require('fs');
const request = require('supertest');
const app = require('../web');

const _public = {};

_public.getMockedFile = filename => {
  const filepath = `${__dirname}/../mocks/${filename}`;
  return fs.readFileSync(filepath, 'utf-8');
};

_public.serve = () => request(app);

module.exports = _public;
