const _ = require('lodash');
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
      obj.type = 'apis';
      if (obj.hosts && _.isString(obj.hosts)) obj.hosts = obj.hosts.split(',');

      return db.insert(obj).then(newDoc => res.status(201).json(newDoc));
    }
  },
  '/:id': {
    patch: (req, res, next) => {
      const id = req.params.id;
      let obj = _.pick(req.body, FIELDS);
      if (obj.hosts && _.isString(obj.hosts)) obj.hosts = obj.hosts.split(',');
      return db
        .update({ id, type: TYPE }, { $set: req.body })
        .then(numReplaced => {
          if (numReplaced > 0) return res.sendStatus(200);
          else return res.sendStatus(400);
        });
    },
    delete: (req, res, next) => {
      const id = req.params.id;
      return db.remove({ id }).then(numRemoved => {
        if (numRemoved > 0) return res.sendStatus(200);
        else return res.sendStatus(400);
      });
    }
  }
};
