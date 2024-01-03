const testingService = require('./testing');
const baseResource = require('../resources/base');
const eventimService = require('./eventim');

describe('Eventim Service', () => {
  beforeEach(() => {
    baseResource.get = jest.fn(url => {
      const curitibaEventsMock = testingService.getMockedFile('eventim-curitiba.html');
      const data = {
        'https://www.eventim.com.br/city/curitiba-1796/': curitibaEventsMock
      }[url];
      return Promise.resolve({ data });
    })
  })

  it('should get a list of events in Curitiba', async () => {
    const events = await eventimService.get();
    expect(events).toEqual([
      {
        title: 'I Wanna Be Tour',
        date: '2024-03-03',
        time: '10:00',
        city: 'Curitiba',
        state: 'PR',
        country: 'BR',
        url: 'https://www.eventim.com.br/event/simple-plan-i-wanna-be-tour-estadio-couto-pereira-17708346/'
      },
      {
        title: 'Sepultura',
        date: '2024-03-22',
        time: '21:00',
        city: 'Curitiba',
        state: 'PR',
        country: 'BR',
        url: 'https://www.eventim.com.br/event/sepultura-live-curitiba-18018603/'
      },
      {
        title: 'Jão Super',
        date: '2024-02-24',
        time: '21:00',
        city: 'Curitiba',
        state: 'PR',
        country: 'BR',
        url: 'https://www.eventim.com.br/event/jao-super-pedreira-paulo-leminski-17455662/'
      },
    ]);
  });
});
