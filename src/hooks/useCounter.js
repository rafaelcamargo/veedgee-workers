const _public = {};

_public.useCounter = () => {
  const start = Date.now();
  const check = () => Date.now() - start;
  return { check };
};

module.exports = _public;
