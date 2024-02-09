const _public = {};

_public.init = app => {
  app.get('/', (req, res) => res.status(200).send({ status: 'ok' }));
};

module.exports = _public;

