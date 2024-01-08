const removeAccents = require('remove-accents');
const eventsResource = require('../resources/events');

const _public = {};

_public.multiSave = multiSave;

function multiSave(events){
  const [event, ...rest] = events;
  return event && eventsResource.get({ slug: buildSlug(event) }).then(({ data }) => {
    if(data.length === 0) {
      return eventsResource.save(event).then(() => {
        return rest.length && multiSave(rest);
      });
    }
    return multiSave(rest);
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
