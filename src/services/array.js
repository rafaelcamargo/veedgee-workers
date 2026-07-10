const _public = {};

_public.pickFirstTruthyItem = items => items.find(Boolean);

module.exports = _public;
