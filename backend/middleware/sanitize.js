// Strips Mongo operator keys ($gt, $ne, etc.) and dotted keys from request
// input, so a crafted body like { "email": { "$ne": null } } can't be used
// to manipulate a Mongoose query (e.g. User.findOne({ email: req.body.email })).
//
// express-mongo-sanitize@2.x is not used here: it tries to reassign
// req.query, which is a getter-only property in Express 5 and throws
// "Cannot set property query of #<IncomingMessage> which has only a
// getter" on every request that has a query string. req.query is never
// used to build a Mongo filter in this codebase (only req.body/req.params
// are), so only those need sanitizing, and both are safe to mutate in place.
function stripMongoOperators(value) {
  if (Array.isArray(value)) {
    value.forEach(stripMongoOperators);
    return value;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key];
        continue;
      }
      stripMongoOperators(value[key]);
    }
  }
  return value;
}

module.exports = function sanitizeMongoInput(req, res, next) {
  if (req.body) stripMongoOperators(req.body);
  if (req.params) stripMongoOperators(req.params);
  next();
};
