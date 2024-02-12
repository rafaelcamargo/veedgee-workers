const {
  removeUnnecessarySpaces,
  removeAccents,
  replaceSpacesForDashes,
  fixInvalidSpaceChars
} = require('../services/text');

const _public = {};

_public.buildSlug = text => {
  return [
    fixInvalidSpaceChars,
    removeDashAsDivider,
    removeUnnecessarySpaces,
    removeAccents,
    replaceSpacesForDashes,
    removeInvalidChars
  ].reduce((result, format) => format(result), text.trim()).toLowerCase();
};

function removeDashAsDivider(text){
  return text.replace(/ - /g, ' ').replace(/ – /g, ' ');
}

function removeInvalidChars(text){
  return text.replace(/[^a-z0-9-]+/gi, '').replace(/-{2,}/g, '-');
}

module.exports = _public;
