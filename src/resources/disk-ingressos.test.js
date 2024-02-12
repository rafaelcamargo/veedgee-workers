const baseResource = require('./base');
const diskIngressosResource = require('./disk-ingressos');

describe('Disk Ingressos Resource', () => {
  function getDiskIngressosBaseUrl(){
    return 'https://www.diskingressos.com.br/home/_search';
  }

  beforeEach(() => {
    baseResource.get = jest.fn();
  });

  it('should get events', () => {
    diskIngressosResource.get();
    expect(baseResource.get).toHaveBeenCalledWith(getDiskIngressosBaseUrl(), undefined);
  });

  it('should optionally filter events by passing query params', () => {
    const params = { slug: 'my-event-20240107-2100' };
    diskIngressosResource.get(params);
    expect(baseResource.get).toHaveBeenCalledWith(getDiskIngressosBaseUrl(), params);
  });
});
