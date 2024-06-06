const eventsResource = require('../resources/events');
const eventService = require('./event');

describe('Event Service', () => {
  beforeEach(() => {
    eventsResource.save = jest.fn();
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
    expect(eventsResource.save).toHaveBeenCalledWith({
      ...event,
      slug: 'some-title-joinville-sc',
      date: ''
    });
  });
});
