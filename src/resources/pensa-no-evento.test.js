const baseResource = require('./base');
const pensaNoEventoResource = require('./pensa-no-evento');

describe('Pensa No Evento Resource', () => {
  beforeEach(() => {
    baseResource.get = jest.fn();
  });

  it('should get events', () => {
    pensaNoEventoResource.get({ cityCode: '19' });
    expect(baseResource.get).toHaveBeenCalledWith(
      'https://www.pensanoevento.com.br/sitev2/api/eventos/busca',
      { cidades: ['19'] },
      { headers: { 'x-public-token': 'pne-site-api' } }
    );
  });

  it('should get event details page by url', () => {
    const url = 'https://www.pensanoevento.com.br/sitev2/eventos/96401/sextou-na-casinha';
    pensaNoEventoResource.getEventDetailsPage(url);
    expect(baseResource.get).toHaveBeenCalledWith(url);
  });
});
