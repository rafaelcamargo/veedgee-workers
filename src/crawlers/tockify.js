const dateService = require('../services/date');
const tockifyResource = require('../resources/tockify');

const _public = {};

_public.crawl = () => {
  return tockifyResource.get(buildQueryParams()).then(({ data }) => {
    return data?.events ? buildEvents(data.events) : [];
  });
};

function buildQueryParams(){
  const startDate = dateService.getNow();
  startDate.setHours(0, 0, 0, 0);
  return {
    calname: 'eventosemjoinville',
    max: '999',
    startms: startDate.getTime()
  };
}

function buildEvents(data){
  return data.map(item => {
    const [date, time] = buildDateTime(item.when.start.millis);
    const result = {
      title: item.content.summary.text,
      date,
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: `https://tockify.com/eventosemjoinville/detail/${item.eid.uid}/${item.eid.tid}`
    };
    return time ? { ...result, time } : result;
  });
}

function buildDateTime(timestamp){
  const [date, time] = dateService
    .buildDateTimeStringFromUTCTimestamp(timestamp)
    .split(' ');
  return time != '00:00' ? [date, time] : [date];
}

module.exports = _public;
