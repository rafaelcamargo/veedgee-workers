const baseResource = require('./base');
const eticketCenterResource = require('./eticket-center');

describe('ETicket Center Resource', () => {
  function getETicketCenterBaseUrl(){
    return 'https://www.eticketcenter.com.br/eventos';
  }

  beforeEach(() => {
    baseResource.get = jest.fn();
  });

  it('should get events', () => {
    eticketCenterResource.get();
    expect(baseResource.get).toHaveBeenCalledWith(getETicketCenterBaseUrl(), undefined);
  });

  it('should optionally filter events by passing query params', () => {
    const params = { page: '2' };
    eticketCenterResource.get(params);
    expect(baseResource.get).toHaveBeenCalledWith(getETicketCenterBaseUrl(), params);
  });
});
