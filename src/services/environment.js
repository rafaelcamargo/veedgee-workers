const TEST = require('../../environments/test');
const DEV = require('../../environments/development');
const PROD = require('../../environments/production');

module.exports = function(){
  return {
    'production': PROD,
    'test': TEST
  }[process.env.NODE_ENV] || DEV;
};
