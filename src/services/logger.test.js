const Bugsnag = require('@bugsnag/js');
const projectPkg = require('../../package');
const loggerService = require('./logger');

describe('Logger Service', () => {
  function createEventMock(){
    return {
      context: undefined,
      addMetadata: jest.fn()
    };
  }

  beforeEach(() => {
    console.error = jest.fn();
    Bugsnag.start = jest.fn();
    Bugsnag.notify = jest.fn();
  });

  it('should track error on Bugsnag if Bugsnag token env var has been found', async () => {
    const err = new Error('some error');
    const event = createEventMock();
    Bugsnag.notify = jest.fn((error, cb) => cb(event));
    loggerService.init();
    expect(Bugsnag.start).toHaveBeenCalledWith({
      apiKey: expect.any(String),
      appVersion: projectPkg.version,
      releaseStage: expect.any(String),
      metadata: {
        app: {
          name: projectPkg.name,
          version: projectPkg.version
        },
        worker: {
          type: 'crawler'
        }
      }
    });
    loggerService.track('Crawl Error', err);
    expect(console.error).toHaveBeenCalledWith('Crawl Error', err);
    expect(Bugsnag.notify).toHaveBeenCalledWith(err, expect.any(Function));
    expect(event.context).toBe('Crawl Error');
    expect(event.addMetadata).not.toHaveBeenCalled();
  });

  it('should optionally attach metadata on Bugsnag notifications', async () => {
    const event = createEventMock();
    Bugsnag.notify = jest.fn((err, cb) => cb(event));
    const err = new Error('some error');
    loggerService.init();
    loggerService.track('Crawl Error', err, { crawler_name: 'songkick' });
    expect(console.error).toHaveBeenCalledWith('Crawl Error', err);
    expect(Bugsnag.notify).toHaveBeenCalledWith(err, expect.any(Function));
    expect(event.context).toBe('Crawl Error');
    expect(event.addMetadata).toHaveBeenCalledWith('custom details', { crawler_name: 'songkick' });
  });

  it('should attach http metadata on HTTP request errors', async () => {
    const event = createEventMock();
    Bugsnag.notify = jest.fn((err, cb) => cb(event));
    const err = new Error('HTTP Error 500');
    const url = 'https://some.url.com/';
    loggerService.init();
    loggerService.track('HTTP Request Error', err, { http_url: url, http_method: 'POST', http_status: 500 });
    expect(console.error).toHaveBeenCalledWith('HTTP Request Error', err);
    expect(Bugsnag.notify).toHaveBeenCalledWith(err, expect.any(Function));
    expect(event.context).toBe('HTTP Request Error');
    expect(event.addMetadata).toHaveBeenCalledWith('custom details', { http_url: url, http_method: 'POST', http_status: 500 });
  });

  it('should not set metadata when event metadata section is absent', async () => {
    const event = createEventMock();
    Bugsnag.notify = jest.fn((err, cb) => cb(event));
    const err = new Error('some error');
    const eventName = 'HTTP Error';
    loggerService.init();
    loggerService.track(eventName, err);
    expect(console.error).toHaveBeenCalledWith(eventName, err);
    expect(Bugsnag.notify).toHaveBeenCalledWith(err, expect.any(Function));
    expect(event.context).toEqual(eventName);
    expect(event.addMetadata).not.toHaveBeenCalled();
  });
});
