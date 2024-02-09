const testingService = require('../services/testing');
const eventsResource = require('../resources/events');
const eventimResource = require('../resources/eventim');
const crawlersWorker = require('./crawlers');

describe('Crawlers Worker', () => {
  beforeEach(() => {
    eventimResource.get = jest.fn(() => {
      const curitibaEventsMock = testingService.getMockedFile('eventim-curitiba.html');
      return Promise.resolve({ data: curitibaEventsMock });
    });
    eventsResource.get = jest.fn(({ slug }) => {
      const eventMock = { id: 'abc' };
      const data = slug == 'sepultura-20240322-2100' ? [eventMock] : [];
      return Promise.resolve({ data });
    });
    eventsResource.save = jest.fn(() => Promise.resolve());
  });

  it('should save events for Eventim', async () => {
    await crawlersWorker.init();
    expect(eventsResource.save).toHaveBeenCalledTimes(2);
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'I Wanna Be Tour',
      date: '2024-03-03',
      time: '10:00',
      city: 'Curitiba',
      state: 'PR',
      country: 'BR',
      url: 'https://www.eventim.com.br/event/simple-plan-i-wanna-be-tour-estadio-couto-pereira-17708346/'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Jão Super',
      date: '2024-02-24',
      time: '21:00',
      city: 'Curitiba',
      state: 'PR',
      country: 'BR',
      url: 'https://www.eventim.com.br/event/jao-super-pedreira-paulo-leminski-17455662/'
    });
  });
});