const path = require('path');
const express = require('express');
const routes = require('express-mount-routes');

const app = express();
routes(app, path.join(__dirname, 'controllers'), { autoPlural: false });

if (module.parent) {
  module.exports = app;
} else {
  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(
      `Mock Server of Kong Admin APIs has been started and listening on port ${PORT}`
    );
  });
}
