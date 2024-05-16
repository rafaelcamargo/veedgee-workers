const dateService = require('./date');

describe('Date Service', () => {
  it('should get now date', () => {
    const [now] = new Date().toISOString().split('.');
    const [serviceNow] = dateService.getNow().toISOString().split('.');
    expect(serviceNow).toEqual(now);
  });

  it('should convert month previx to number', () => {
    expect(dateService.convertMonthPrefixToNumber('Jan')).toEqual('01');
    expect(dateService.convertMonthPrefixToNumber('Fev')).toEqual('02');
    expect(dateService.convertMonthPrefixToNumber('Mar')).toEqual('03');
    expect(dateService.convertMonthPrefixToNumber('Apr')).toEqual('04');
    expect(dateService.convertMonthPrefixToNumber('May')).toEqual('05');
    expect(dateService.convertMonthPrefixToNumber('Jun')).toEqual('06');
    expect(dateService.convertMonthPrefixToNumber('Jul')).toEqual('07');
    expect(dateService.convertMonthPrefixToNumber('Aug')).toEqual('08');
    expect(dateService.convertMonthPrefixToNumber('Sep')).toEqual('09');
    expect(dateService.convertMonthPrefixToNumber('Oct')).toEqual('10');
    expect(dateService.convertMonthPrefixToNumber('Nov')).toEqual('11');
    expect(dateService.convertMonthPrefixToNumber('Dec')).toEqual('12');
  });

  it('should build date time string from timestamp', () => {
    expect(dateService.buildDateTimeStringFromUTCTimestamp(1715871600000)).toEqual('2024-05-16 15:00');
  });

  it('should return empty string if no timestamp is given for building date time string', () => {
    expect(dateService.buildDateTimeStringFromUTCTimestamp()).toEqual('');
  });
});
