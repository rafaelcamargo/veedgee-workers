const fs = require('fs');
const request = require('supertest');
const app = require('../app');

const _public = {};

_public.serve = () => request(app);

_public.getMockedFile = filename => {
  const filepath = `${__dirname}/../mocks/${filename}`;
  return fs.readFileSync(filepath, 'utf-8');
};

module.exports = _public;
