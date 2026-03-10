const pensaNoEventoResource = require('../resources/pensa-no-evento');

const _public = {};

_public.crawl = () => {
  return pensaNoEventoResource.get().then(({ data }) => {
    return data?.data ? buildEvents(data.data) : [];
  });
};

function buildEvents(data){
  return data.map(item => {
    const { evento, data, cidade, estado, url } = item;
    const [date, time] = parseDateTime(data);
    return {
      title: evento,
      date,
      time,
      city: cidade,
      state: estado,
      country: 'BR',
      url
    };
  });
}

function parseDateTime(dateTimeString){
  const [date, time] = dateTimeString.split(' ');
  return [date, parseTime(time)];
}

function parseTime(timeString){
  return timeString && timeString.substring(0,5);
}

module.exports = _public;
