const baseResource = require('./base');
const songkickResource = require('./songkick');

describe('Songkick Resource', () => {
  beforeEach(() => {
    baseResource.get = jest.fn();
  });

  it('should get events in Blumenau', () => {
    songkickResource.get({ city: 'blumenau', page: 1 });
    songkickResource.get({ city: 'blumenau', page: 2 });
    expect(baseResource.get).toHaveBeenCalledWith('https://www.songkick.com/pt/metro-areas/26976-brazil-blumenau');
    expect(baseResource.get).toHaveBeenCalledWith('https://www.songkick.com/pt/metro-areas/26976-brazil-blumenau?page=2');
    expect(baseResource.get).toHaveBeenCalledTimes(2);
  });

  it('should get events in Curitiba', () => {
    songkickResource.get({ city: 'curitiba', page: 1 });
    songkickResource.get({ city: 'curitiba', page: 2 });
    expect(baseResource.get).toHaveBeenCalledWith('https://www.songkick.com/pt/metro-areas/27043-brazil-curitiba');
    expect(baseResource.get).toHaveBeenCalledWith('https://www.songkick.com/pt/metro-areas/27043-brazil-curitiba?page=2');
    expect(baseResource.get).toHaveBeenCalledTimes(2);
  });

  it('should get events in Florianópolis', () => {
    songkickResource.get({ city: 'florianopolis', page: 1 });
    songkickResource.get({ city: 'florianopolis', page: 2 });
    expect(baseResource.get).toHaveBeenCalledWith('https://www.songkick.com/pt/metro-areas/27059-brazil-florianopolis');
    expect(baseResource.get).toHaveBeenCalledWith('https://www.songkick.com/pt/metro-areas/27059-brazil-florianopolis?page=2');
    expect(baseResource.get).toHaveBeenCalledTimes(2);
  });

  it('should get events in Itajaí', () => {
    songkickResource.get({ city: 'itajai', page: 1 });
    songkickResource.get({ city: 'itajai', page: 2 });
    expect(baseResource.get).toHaveBeenCalledWith('https://www.songkick.com/pt/metro-areas/27099-brazil-itajai');
    expect(baseResource.get).toHaveBeenCalledWith('https://www.songkick.com/pt/metro-areas/27099-brazil-itajai?page=2');
    expect(baseResource.get).toHaveBeenCalledTimes(2);
  });

  it('should get events in Joinville', () => {
    songkickResource.get({ city: 'joinville', page: 1 });
    songkickResource.get({ city: 'joinville', page: 2 });
    expect(baseResource.get).toHaveBeenCalledWith('https://www.songkick.com/pt/metro-areas/27129-brazil-joinville');
    expect(baseResource.get).toHaveBeenCalledWith('https://www.songkick.com/pt/metro-areas/27129-brazil-joinville?page=2');
    expect(baseResource.get).toHaveBeenCalledTimes(2);
  });

  it('should get events in Porto Alegre', () => {
    songkickResource.get({ city: 'porto-alegre', page: 1 });
    songkickResource.get({ city: 'porto-alegre', page: 2 });
    expect(baseResource.get).toHaveBeenCalledWith('https://www.songkick.com/pt/metro-areas/27218-brazil-porto-alegre');
    expect(baseResource.get).toHaveBeenCalledWith('https://www.songkick.com/pt/metro-areas/27218-brazil-porto-alegre?page=2');
    expect(baseResource.get).toHaveBeenCalledTimes(2);
  });
});
