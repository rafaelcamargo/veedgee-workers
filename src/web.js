const bodyParser = require('body-parser');
const app = require('./app');
const { appendRoutes } = require('./routes');

app.use(bodyParser.json());

module.exports = appendRoutes(app);
