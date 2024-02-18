const ENV = require('./environment')();

const _public = {};

_public.isPermitted = (req, res, next) => {
  return hasPermissionToken(req) ? next() : res.status(401).send();
};

function hasPermissionToken({ headers }){
  return ENV.VEEDGEE.WORKER_TOKENS.split(',').includes(headers.vwtoken);
}

module.exports = _public;
