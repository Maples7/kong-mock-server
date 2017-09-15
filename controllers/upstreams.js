'use strict';

const _ = require('lodash');
const uuidv4 = require('uuid/v4');
const db = require('../lib/db');

const TYPE = 'upstreams';
const FIELDS = ['name', 'slots', 'orderlist'];

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
      if (!req.body.name) {
        return res.status(400).json({
          message: 'Missing some param(s)'
        });
      }
      const obj = _.pick(req.body, FIELDS);
      obj.slots = obj.slots || 1000;
      obj.created_at = Date.now();
      obj.type = TYPE;
      obj.id = uuidv4();
      if (obj.orderlist && _.isString(obj.orderlist)) {
        obj.orderlist = obj.orderlist.split(',');
      }

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
      if (obj.orderlist && _.isString(obj.orderlist)) {
        obj.orderlist = obj.orderlist.split(',');
      }
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
  },
  '/:upstream_id/targets': {
    get: (req, res, next) => {
      let upstreamId = req.params.upstream_id;
      return db
        .findAsync({
          type: TYPE,
          $or: [{ id: upstreamId }, { name: upstreamId }]
        })
        .then(docs => {
          if (docs.length > 0) {
            upstreamId = docs[0].id;
            return db
              .findAsync({ type: 'targets', upstream_id: upstreamId })
              .then(docs =>
                res.json({
                  total: docs.length,
                  data: docs.map(doc => {
                    delete doc._id;
                    delete doc.type;
                    return doc;
                  })
                })
              );
          } else {
            return res.status(404).json({
              message: 'Not found'
            });
          }
        });
    },
    post: (req, res, next) => {
      const upstreamId = req.params.upstream_id;
      if (!req.body.target) {
        return res.status(400).json({
          message: 'Missing some param(s)'
        });
      }
      return db
        .findAsync({
          type: TYPE,
          $or: [{ id: upstreamId }, { name: upstreamId }]
        })
        .then(docs => {
          if (docs.length > 0) {
            const obj = _.pick(req.body, ['target', 'weight']);
            obj.weight = obj.weight || 100;
            obj.created_at = Date.now();
            obj.type = 'targets';
            obj.id = uuidv4();
            obj.upstream_id = upstreamId;
            return db.insertAsync(obj).then(newDoc => {
              delete newDoc._id;
              res.status(201).json(newDoc);
            });
          } else {
            return res.status(404).json({
              message: 'Not found'
            });
          }
        });
    }
  },
  '/:upstream_id/targets/:target_id': {
    delete: (req, res, next) => {
      let upstreamId = req.params.upstream_id;
      const targetId = req.params.target_id;
      return db
        .findAsync({
          type: TYPE,
          $or: [{ id: upstreamId }, { name: upstreamId }]
        })
        .then(docs => {
          if (docs.length > 0) {
            upstreamId = docs[0].id;
            return db
              .removeAsync({
                id: targetId,
                upstream_id: upstreamId,
                type: 'targets'
              })
              .then(numRemoved => {
                if (numRemoved > 0) return res.sendStatus(204);
                else return res.sendStatus(400);
              });
          } else {
            return res.status(404).json({
              message: 'Not found'
            });
          }
        });
    }
  }
};
