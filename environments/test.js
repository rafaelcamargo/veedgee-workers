const developement = require('./development');

module.exports = {
  ...developement,
  VEEDGEE: {
    ...developement.VEEDGEE,
    API_BASE_URL: ''
  }
};
