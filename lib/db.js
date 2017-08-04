const Promise = require('bluebird');
const Datastore = require('nedb');

if (!global.NEDB_INSTANCE) {
  const db = Promise.promisifyAll(
    new Datastore({
      inMemoryOnly: true
    })
  );
  global.NEDB_INSTANCE = db;
}

module.exports = global.NEDB_INSTANCE;
