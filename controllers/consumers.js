const _ = require('lodash');
const db = require('../lib/db');

const TYPE = 'consumers';

module.exports = {
  '/': {
    get: (req, res, next) =>
      db.find({ type: TYPE }).then(docs =>
        res.json({
          total: docs.length,
          data: docs.map(doc => {
            delete doc.type;
            return doc;
          })
        })
      ),
     post: (req, res, next) => {
       
     }
  }
}
