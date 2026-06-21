const baseResource = require('./base');
const ingressoResource = require('./ingresso');

describe('Ingresso Resource', () => {
  beforeEach(() => {
    baseResource.get = jest.fn();
  });

  it('should get now playing movies', () => {
    const cityId = 16;
    ingressoResource.getNowPlaying(cityId);
    expect(baseResource.get).toHaveBeenCalledWith(`https://api-content.ingresso.com/v1/carousels/${cityId}`, {
      partnership: 'home',
      carousels: 'em-cartaz',
      limit: 15
    });
  });
});
