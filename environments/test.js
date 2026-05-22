const development = require('./development');

module.exports = {
  ...development,
  TYPE: 'test',
  VEEDGEE: {
    ...development.VEEDGEE,
    API_BASE_URL: ''
  }
};
