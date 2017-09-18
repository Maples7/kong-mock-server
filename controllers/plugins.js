'use strict';

const _ = require('lodash');
const uuidv4 = require('uuid/v4');
const db = require('../lib/db');

const TYPE = 'plugins';

module.exports = {
  '/': {
    get: (req, res, next) =>
      db.findAsync({ type: TYPE }).then(docs =>
        res.json({
          total: docs.length,
          data: docs.map(doc => {
            delete doc._id;
            delete doc.type;
            return doc;
          })
        })
      ),
    post: (req, res, next) => {
      if (!req.body.name || !req.body.config) {
        return res.status(400).json({
          message: 'Missing some param(s)'
        });
      }
      const obj = _.pick(req.body, ['name', 'consumer_id', 'config']);
      obj.id = uuidv4();
      obj.enable = true;
      obj.created_at = Date.now();
      obj.type = 'plugins';

      return db.insertAsync(obj).then(newDoc => {
        delete newDoc._id;
        delete newDoc.type;
        res.status(201).json(newDoc);
      });
    }
  },
  '/:id': {
    get: (req, res, next) => {
      const id = req.params.id;
      return db
        .findAsync({ $or: [{ id: id }, { name: id }], type: TYPE })
        .then(docs => {
          const ret = docs[0];
          delete ret._id;
          delete ret.type;
          return res.json(ret);
        });
    },
    patch: (req, res, next) => {
      const id = req.params.id;
      const obj = _.pick(req.body, ['name', 'consumer_id', 'config', 'enable']);
      return db
        .updateAsync(
          { $or: [{ id: id }, { name: id }], type: TYPE },
          { $set: obj }
        )
        .then(numReplaced => {
          if (numReplaced > 0) return res.sendStatus(200);
          else return res.sendStatus(400);
        });
    },
    delete: (req, res, next) => {
      const id = req.params.id;
      return db
        .removeAsync({ $or: [{ id: id }, { name: id }], type: TYPE })
        .then(numRemoved => {
          if (numRemoved > 0) return res.sendStatus(204);
          else return res.sendStatus(400);
        });
    }
  }
};
