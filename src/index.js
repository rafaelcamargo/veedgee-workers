const app = require('./app');
const PORT = 7007;

app.listen(PORT, () => {
  console.log(`Running application on http://localhost:${PORT}`);
});
