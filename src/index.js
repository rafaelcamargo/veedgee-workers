const app = require('./app');
const loggerService = require('./services/logger');
const PORT = process.env.PORT || 3000;

loggerService.init();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Running application on port ${PORT}`);
});
