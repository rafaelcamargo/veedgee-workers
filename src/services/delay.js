const _public = {};

_public.pause = timeout => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

module.exports = _public;
