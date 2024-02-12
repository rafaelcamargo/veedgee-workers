const baseResource = require('./base');
const eventsResource = require('./events');

describe('Eventim Resource', () => {
  beforeEach(() => {
    baseResource.post = jest.fn();
    baseResource.get = jest.fn();
  });

  it('should save an event', () => {
    const event = { some: 'event' };
    eventsResource.save(event);
    expect(baseResource.post).toHaveBeenCalledWith('/events', event);
  });

  it('should get events', () => {
    eventsResource.get();
    expect(baseResource.get).toHaveBeenCalledWith('/events', undefined);
  });

  it('should optionally filter events by passing query params', () => {
    const params = { slug: 'my-event-20240107-2100' };
    eventsResource.get(params);
    expect(baseResource.get).toHaveBeenCalledWith('/events', params);
  });
});
