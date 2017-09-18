'use strict';

const _ = require('lodash');
const uuidv4 = require('uuid/v4');
const db = require('../lib/db');

const TYPE = 'apis';
const FIELDS = [
  'name',
  'hosts',
  'uris',
  'methods',
  'upstream_url',
  'strip_uri',
  'preserve_host',
  'retries',
  'upstream_connect_timeout',
  'upstream_send_timeout',
  'upstream_read_timeout',
  'https_only',
  'http_if_terminated'
];

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
      if (
        !req.body.name ||
        !req.body.upstream_url ||
        !(req.body.hosts || req.body.uris || req.body.methods)
      ) {
        return res.status(400).json({
          message: 'Missing some param(s)'
        });
      }
      let obj = _.pick(req.body, FIELDS);

      obj = _.defaultsDeep(obj, {
        http_if_terminated: true,
        upstream_read_timeout: 6000,
        preserve_host: false,
        upstream_connect_timeout: 6000,
        strip_uri: true,
        https_only: false,
        retries: 5,
        upstream_send_timeout: 6000
      });
      obj.created_at = Date.now();
      obj.type = TYPE;
      ['hosts', 'uris', 'methods'].forEach(field => {
        if (obj[field] && _.isString(obj[field]))
          obj[field] = obj[field].split(',');
      });
      obj.id = uuidv4();

      return db.insertAsync(obj).then(newDoc => {
        delete newDoc._id;
        delete newDoc.type;
        res.status(201).json(newDoc);
      });
    }
  },
  '/:id': {
    patch: (req, res, next) => {
      const id = req.params.id;
      const obj = _.pick(req.body, FIELDS);
      ['hosts', 'uris', 'methods'].forEach(field => {
        if (obj[field] && _.isString(obj[field]))
          obj[field] = obj[field].split(',');
      });
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
  '/:api_id/plugins/': {
    post: (req, res, next) => {
      const apiId = req.params.api_id;
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
      obj.api_id = apiId;

      return db.insertAsync(obj).then(newDoc => {
        delete newDoc._id;
        delete newDoc.type;
        res.status(201).json(newDoc);
      });
    }
  },
  '/:api_id/plugins/:plugin_id': {
    patch: (req, res, next) => {
      const apiId = req.params.api_id;
      const pluginId = req.params.plugin_id;
      const obj = _.pick(req.body, ['name', 'consumer_id', 'config', 'enable']);
      return db
        .updateAsync(
          {
            $or: [{ id: pluginId }, { name: pluginId }],
            api_id: apiId,
            type: 'plugins'
          },
          { $set: obj }
        )
        .then(numReplaced => {
          if (numReplaced > 0) return res.sendStatus(200);
          else return res.sendStatus(400);
        });
    },
    delete: (req, res, next) => {
      const apiId = req.params.api_id;
      const pluginId = req.params.plugin_id;
      return db
        .removeAsync({
          $or: [{ id: pluginId }, { name: pluginId }],
          api_id: apiId,
          type: 'plugins'
        })
        .then(numRemoved => {
          if (numRemoved > 0) return res.sendStatus(204);
          else return res.sendStatus(400);
        });
    }
  }
};
