const _public = {};

_public.fixMultiSpaces = text => {
  return text.replace(/\s{2,}/, ' ');
};

_public.capitalize = text => {
  return text.toLowerCase().split(' ').map(word => {
    const [firstLetter, ...rest] = word;
    return `${firstLetter.toUpperCase()}${rest.join('')}`;
  }).join(' ');
};

module.exports = _public;
