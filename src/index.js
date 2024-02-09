const app = require('./web');
const PORT = 7000;

app.listen(PORT, () => {
  console.log(`Running application on http://localhost:${PORT}`);
});
