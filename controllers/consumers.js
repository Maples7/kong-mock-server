const _ = require('lodash');
const uuidv4 = require('uuid/v4');
const db = require('../lib/db');

const TYPE = 'consumers';
const FIELDS = ['username', 'custom_id'];

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
      if (!(req.body.username || req.body.custom_id)) {
        return res.status(400).json({
          message: 'Missing some param(s)'
        });
      }
      const obj = _.pick(req.body, FIELDS);
      obj.created_at = Date.now();
      obj.type = TYPE;
      obj.id = uuidv4();

      return db.insertAsync(obj).then(newDoc => {
        delete newDoc._id;
        res.status(201).json(newDoc);
      });
    }
  },
  '/:id': {
    patch: (req, res, next) => {
      const id = req.params.id;
      let obj = _.pick(req.body, FIELDS);
      return db.updateAsync({ id, type: TYPE }, { $set: obj }).then(numReplaced => {
        if (numReplaced > 0) return res.sendStatus(200);
        else return res.sendStatus(400);
      });
    },
    delete: (req, res, next) => {
      const id = req.params.id;
      return db.removeAsync({ id, type: TYPE }).then(numRemoved => {
        if (numRemoved > 0) return res.sendStatus(204);
        else return res.sendStatus(400);
      });
    }
  }
};
