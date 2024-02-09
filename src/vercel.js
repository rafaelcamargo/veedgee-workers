const app = require('./app');
const { appendRoutes } = require('./routes');

module.exports = appendRoutes(app);
