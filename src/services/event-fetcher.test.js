const eventsResource = require('../resources/events');
const eventsMock = require('../mocks/events');
const eventFetcherService = require('./event-fetcher');

describe('Event Fetcher Service', () => {
  beforeEach(() => {
    eventsResource.get = jest.fn(({ minDate }) => {
      const data = minDate == '2024-02-21' ? eventsMock : [];
      return Promise.resolve({ data });
    });
  });

  it('should not fetch events more than once', async () => {
    const params = { minDate: '2024-02-21' };
    const [response1, response2] = await Promise.all([
      eventFetcherService.cachedFetch(params),
      eventFetcherService.cachedFetch(params)
    ]);
    const response3 = await eventFetcherService.cachedFetch(params);
    const expectedResult = { data: eventsMock };
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(response1).toEqual(expectedResult);
    expect(response2).toEqual(expectedResult);
    expect(response3).toEqual(expectedResult);
  });
});
