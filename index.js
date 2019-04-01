'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('express-mount-routes');
const db = require('./lib/db');
const fs = require('fs');
const https = require('https');
const http = require('http');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
routes(app, path.join(__dirname, 'controllers'), { autoPlural: false });
app.get('/', (req, res, next) =>
  res.json({
    version: '0.11.0'
  })
);

if (module.parent) {
  app.nedb = db;
  module.exports = app;
} else {
  const PORT = 3001;
  var server = http.createServer(options, app).listen(PORT, () => {
    console.log(
      `Mock Server of Kong Admin APIs has been started and listening on port ${PORT}`
    );
    if (process.env.INIT_DATA === 'true') {
      const initData = require('./init-data');
      Object.keys(initData).forEach(obj => db.insertAsync(initData[obj]));
    }
  });
  const SEC_PORT = 3443;
  const options = {
      key: fs.readFileSync('./ssl/server.key'),
      cert: fs.readFileSync('./ssl/server.cert'),
  };
  var secureServer = https.createServer(options, app).listen(SEC_PORT, function(){
    console.log(
      `Mock Server of Kong Admin APIs has been started and listening on port ${SEC_PORT}`
    );
  });
}
