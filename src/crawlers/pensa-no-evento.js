const pensaNoEventoResource = require('../resources/pensa-no-evento');

const _public = {};

_public.crawl = () => {
  const requests = Object.values(getCityCodes()).map(crawlEventsByCityCode);
  return Promise.all(requests).then(responses => responses.flat());
};

function getCityCodes(){
  return {
    'curitiba': 32,
    'jonville': 19,
    'barra_velha': 137,
    'picarras': 95,
    'blumenau': 9,
    'itajai': 43,
    'bc': 7,
    'sao_jose': 2,
    'floripa': 1,
    'porto_alegre': 33
  };
}

function crawlEventsByCityCode(code){
  return pensaNoEventoResource.get({ cityCode: code }).then(({ data }) => {
    return data?.data ? buildEvents(data.data) : [];
  });
}

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
