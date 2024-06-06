const _public = {};

_public.getNow = () => new Date();

_public.buildTodayDateString = () => {
  const now = _public.getNow();
  const padStart = number => number.toString().padStart(2, '0');
  return `${now.getFullYear()}-${padStart(now.getMonth()+1)}-${padStart(now.getDate())}`;
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

module.exports = _public;
