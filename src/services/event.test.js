const dateService = require('./date');
const eventFetcherService = require('./event-fetcher');
const eventsResource = require('../resources/events');
const eventService = require('./event');

describe('Event Service', () => {
  beforeEach(() => {
    dateService.buildTodayDateString = jest.fn(() => '2026-06-07');
    eventFetcherService.flushCache();
    eventsResource.bulkSave = jest.fn(() => Promise.resolve());
    eventsResource.get = jest.fn(() => Promise.resolve({ data: [] }));
  });

  it('should ignore invalid dates', async () => {
    const event = {
      title: 'Some Title',
      date: 'Any other thing',
      time: '20:00',
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: 'http://some.url.com'
    };
    await eventService.multiSave([event]);
    expect(eventsResource.bulkSave).toHaveBeenCalledWith([{
      ...event,
      slug: 'some-title-joinville-sc',
      date: ''
    }]);
  });

  it('should propagate description when present', async () => {
    const event = {
      title: 'Some Show',
      date: '2026-06-20',
      time: '21:00',
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: 'http://some.url.com',
      description: 'A great show with live music'
    };
    await eventService.multiSave([event]);
    expect(eventsResource.bulkSave).toHaveBeenCalledWith([{
      ...event,
      slug: 'some-show-joinville-sc-20260620'
    }]);
  });

  it('should not save past events', async () => {
    const event = {
      title: 'Some Title',
      date: '2026-06-06',
      time: '20:00',
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: 'http://some.url.com'
    };
    await eventService.multiSave([event]);
    expect(eventsResource.bulkSave).not.toHaveBeenCalled();
  });
});
