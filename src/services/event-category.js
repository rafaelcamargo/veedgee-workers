const { CATEGORY_ALIASES } = require('../constants/event-categories');
const { removeAccents } = require('./text');

const _public = {};

const categoryAliasesMap = buildCategoryAliasesMap();

_public.findCategoryByKeywords = keywords => {
  return keywords?.reduce((matchedCategory, keyword) => {
    return matchedCategory || categoryAliasesMap.get(buildNormalizedToken(keyword));
  }, null);
};

_public.extractCategoryKeywordsFromText = text => {
  return text.split(' ').reduce((keywords, term) => {
    return term.length > 3 ? [...keywords, term] : keywords;
  }, []);
};

function buildCategoryAliasesMap(){
  return Object.entries(CATEGORY_ALIASES).reduce((map, [category, aliases]) => {
    aliases.forEach(alias => map.set(buildNormalizedToken(alias), category));
    return map;
  }, new Map());
}

function buildNormalizedToken(text){
  return removeAccents(text).toLowerCase().trim();
}

module.exports = _public;
