const baseResource = require('./base');
const ingressoResource = require('./ingresso');

describe('Ingresso Resource', () => {
  beforeEach(() => {
    baseResource.get = jest.fn();
  });

  it('should get now playing movies', () => {
    ingressoResource.getNowPlaying();
    expect(baseResource.get).toHaveBeenCalledWith('https://api-content.ingresso.com/v1/carousels/16', {
      partnership: 'home',
      carousels: 'em-cartaz',
      limit: 15
    });
  });
});
