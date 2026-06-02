const fs = require('fs');
const request = require('supertest');
const loggerService = require('./logger');

const _public = {};

_public.serve = () => {
  loggerService.init = jest.fn();
  loggerService.track = jest.fn();
  const app = require('../app');
  return request(app);
};

_public.getMockedFile = filename => {
  const filepath = `${__dirname}/../mocks/${filename}`;
  return fs.readFileSync(filepath, 'utf-8');
};

module.exports = _public;
