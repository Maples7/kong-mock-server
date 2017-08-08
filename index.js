'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('express-mount-routes');
const db = require('./lib/db');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
routes(app, path.join(__dirname, 'controllers'), { autoPlural: false });

if (module.parent) {
  app.nedb = db;
  module.exports = app;
} else {
  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(
      `Mock Server of Kong Admin APIs has been started and listening on port ${PORT}`
    );
    if (process.env.INIT_DATA === 'true') {
      const initData = require('./init-data');
      Object.keys(initData).forEach(obj => db.insertAsync(initData[obj]));
    }
  });
}
