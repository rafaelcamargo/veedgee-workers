const eventService = require('../services/event');
const blueticketResource = require('../resources/blueticket');

const _public = {};

_public.crawl = () => {
  return blueticketResource.get({ categoria: 11 }).then(({ data }) => {
    return data ? buildEvents(data) : [];
  });
};

function buildEvents(data){
  return data.filter(item => {
    const { data_indefinida, nome_cidade, uf_cidade } = item;
    return data_indefinida === 0 && eventService.isWantedCity(nome_cidade, uf_cidade);
  }).map(item => {
    const [date, time] = parseDateTime(item.data);
    return {
      title: item.nome,
      date,
      time,
      city: item.nome_cidade,
      state: item.uf_cidade,
      country: 'BR',
      url: `https://www.blueticket.com.br/evento/${item.codigo}/${item.slug}`
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
