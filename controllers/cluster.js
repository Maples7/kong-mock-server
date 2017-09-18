'use strict';

const uuidv4 = require('uuid/v4');
const db = require('../lib/db');

const TYPE = 'cluster';

module.exports = {
  '/': {
    get: (req, res, next) =>
      db.findAsync({ type: TYPE }).then(docs =>
        res.json({
          total: docs.length,
          data: docs.map(doc => {
            delete doc.type;
            delete doc._id;
            return doc;
          })
        })
      ),
    post: (req, res, next) => {
      if (!req.body.address) {
        return res.status(400).json({
          message: 'Missing some param(s)'
        });
      }
      const obj = {
        address: req.body.address,
        name: 'AFakeName_' + uuidv4(),
        status: 'alive'
      };
      obj.type = TYPE;

      return db.insertAsync(obj).then(newDoc => {
        delete newDoc._id;
        delete newDoc.type;
        res.status(201).json(newDoc);
      });
    },
    delete: (req, res, next) => {
      if (!req.body.name) {
        return res.status(400).json({
          message: 'Missing some param(s)'
        });
      }
      const name = req.body.name;
      return db.removeAsync({ name: name, type: TYPE }).then(numRemoved => {
        if (numRemoved > 0) return res.sendStatus(204);
        else return res.sendStatus(400);
      });
    }
  }
};
