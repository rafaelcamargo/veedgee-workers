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
});
