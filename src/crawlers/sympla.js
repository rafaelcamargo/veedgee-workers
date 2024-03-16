const dateService = require('../services/date');
const eventService = require('../services/event');
const symplaResource = require('../resources/sympla');

const _public = {};

_public.crawl = () => {
  return symplaResource.get().then(({ data }) => {
    return data?.data ? buildEvents(data.data) : [];
  });
};

function buildEvents(data){
  return data.filter(item => {
    const { location } = item;
    return eventService.isWantedCity(location.city, location.state);
  }).map(item => {
    const [date, time] = parseDateTime(item.start_date_formats.en);
    return {
      title: item.name,
      date,
      time,
      city: item.location.city,
      state: item.location.state,
      country: 'BR',
      url: item.url
    };
  });
}

function parseDateTime(dateTimeString){
  const [date, time] = dateTimeString.split(' · ');
  return [parseDate(date), time];
}

function parseDate(dateString){
  const [day, monthName, year] = dateString.split(', ')[1].replace(' - ', ' ').split(' ');
  const month = dateService.convertMonthPrefixToNumber(monthName);
  return `${year}-${month}-${day.padStart(2, '0')}`;
}

module.exports = _public;
