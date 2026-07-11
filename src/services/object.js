const _public = {};

_public.removeFalsyAttrs = object => {
  return Object.entries(object).reduce((result, [key, value]) => {
    return value ? { ...result, [key]: value } : result;
  }, {});
};

_public.removeAttrs = (object, attrs) => {
  return Object.entries(object).reduce((result, [key, value]) => {
    return !attrs.includes(key) ? { ...result, [key]: value } : result;
  }, {});
};

module.exports = _public;
