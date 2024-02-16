const _public = {};

_public.getNow = () => new Date();

_public.buildTodayDateString = () => {
  const now = _public.getNow();
  const padStart = number => number.toString().padStart(2, '0');
  return `${now.getFullYear()}-${padStart(now.getMonth()+1)}-${padStart(now.getDate())}`;
};

module.exports = _public;
