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

  it('should get event details page by url', () => {
    const url = 'https://www.eticketcenter.com.br/eventos/show/elvis-experience-com-dean-z-em-joinville/29-02/21-00/';
    eticketCenterResource.getEventDetailsPage(url);
    expect(baseResource.get).toHaveBeenCalledWith(url);
  });
});
