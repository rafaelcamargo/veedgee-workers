const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const loggerService = require('./services/logger');
const app = express();
const { appendRoutes } = require('./routes');

loggerService.init();

app.use(cors());
app.use(bodyParser.json());

module.exports = appendRoutes(app);
