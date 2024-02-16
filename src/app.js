const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const { appendRoutes } = require('./routes');

app.use(cors());
app.use(bodyParser.json());

module.exports = appendRoutes(app);
