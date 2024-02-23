const PRODUCTION = require('../../environments/production');
const TEST = require('../../environments/test');
const DEV = require('../../environments/development');

const _public = {};

_public.get = () => {
  return {
    'test': TEST,
    'production': PRODUCTION
  }[process.env.NODE_ENV] || DEV;
};

module.exports = _public;
