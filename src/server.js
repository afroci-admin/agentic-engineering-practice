const app = require('./app');
const { PORT } = require('./utils/constants');

app.listen(PORT, () => {
  console.log(`Taskr API running on port ${PORT}`);
});
