const removeAccents = require('remove-accents');

const _public = {};

_public.capitalize = text => text.toLowerCase().split(' ').map(word => {
  const [firstLetter, ...rest] = word;
  if(isQuote(firstLetter) && word.length > 1) return capitilizeQuotedWord(word);
  return `${firstLetter.toUpperCase()}${rest.join('')}`;
}).join(' ');

_public.removeUnnecessarySpaces = text => text.replace(/\s+/g, ' ').trim();

_public.replaceSpacesForDashes = text => text.replace(/ /g, '-');

// eslint-disable-next-line no-irregular-whitespace
_public.fixInvalidSpaceChars = text => text.replace(/ /g, ' ');

_public.removeAccents = removeAccents;

function isQuote(letter){
  return ['\'', '"'].includes(letter);
}

function capitilizeQuotedWord(word){
  const [firstLetter, secondLetter, ...rest] = word;
  return `${firstLetter}${secondLetter.toUpperCase()}${rest.join('')}`;
}

module.exports = _public;
