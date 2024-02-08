const removeAccents = require('remove-accents');
const eventsResource = require('../resources/events');

const _public = {};

_public.multiSave = events => Promise.all(events.map(saveIfNotExists));

function saveIfNotExists(event){
  return eventsResource.get({ slug: buildSlug(event) }).then(({ data }) => {
    return data.length === 0 && eventsResource.save(event);
  });
}

function buildSlug(event){
  const { title, date, time } = event;
  return formatEventSlug(`${title}-${date.replace(/-/g,'')}-${time.replace(':','')}`);
}

function formatEventSlug(text){
  return removeAccents(text.toLowerCase().replace(/ /g, '-'));
}

module.exports = _public;
