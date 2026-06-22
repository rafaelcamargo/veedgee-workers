const _public = {};

_public.getNow = () => new Date();

_public.buildTodayDateString = () => {
  const now = _public.getNow();
  return formatISODateString(now);
};

_public.buildYesterdayDateString = referenceDateString => {
  const [year, month, day] = referenceDateString.split('-').map(value => parseInt(value));
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return formatISODateString(date);
};

_public.buildDateTimeStringFromUTCTimestamp = timestamp => {
  if(!timestamp) return '';
  const dateObj = new Date(timestamp);
  const [date, time] = dateObj.toISOString().split('T');
  return [date, time.substring(0,5)].join(' ');
};

_public.convertMonthPrefixToNumber = monthPrefix => {
  return {
    'jan': '01',
    'fev': '02',
    'mar': '03',
    'apr': '04',
    'may': '05',
    'jun': '06',
    'jul': '07',
    'aug': '08',
    'sep': '09',
    'oct': '10',
    'nov': '11',
    'dec': '12'
  }[monthPrefix.toLowerCase()];
};

_public.isValidISODateString = isoDateString => {
  const regex = new RegExp(/\d{4}-\d{2}-\d{2}/);
  return regex.test(isoDateString);
};

function formatISODateString(date){
  return `${date.getFullYear()}-${padTwoDigit(date.getMonth() + 1)}-${padTwoDigit(date.getDate())}`;
}

function padTwoDigit(number){
  return number.toString().padStart(2, '0');
}

module.exports = _public;
