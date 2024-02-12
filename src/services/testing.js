const request = require('supertest');
const app = require('../web');

const _public = {};

_public.serve = () => request(app);

module.exports = _public;
