const baseResource = require('./base');
const blueticketResource = require('./blueticket');

describe('Disk Ingressos Resource', () => {
  function getBlueticketBaseUrl(){
    return 'https://soulapi.blueticket.com.br/api/v2/events/list';
  }

  function buildBlueticketHeaders(){
    return {
      pdv: '100'
    };
  }

  beforeEach(() => {
    baseResource.get = jest.fn();
  });

  it('should get events', () => {
    blueticketResource.get();
    expect(baseResource.get).toHaveBeenCalledWith(getBlueticketBaseUrl(), undefined, {
      headers: buildBlueticketHeaders()
    });
  });

  it('should optionally filter events by passing query params', () => {
    const params = { some: 'param' };
    blueticketResource.get(params);
    expect(baseResource.get).toHaveBeenCalledWith(getBlueticketBaseUrl(), params, {
      headers: buildBlueticketHeaders()
    });
  });
});
