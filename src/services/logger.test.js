const Bugsnag = require('@bugsnag/js');
const projectPkg = require('../../package');
const loggerService = require('./logger');

describe('Logger Service', () => {
  beforeEach(() => {
    console.error = jest.fn();
    console.log = jest.fn();
    Bugsnag.start = jest.fn();
    Bugsnag.notify = jest.fn();
  });

  it('should track error on Bugsnag if Bugsnag token env var has been found', async () => {
    const err = new Error('some error');
    const event = {};
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
    loggerService.track('Crawl Error', { type: 'error', error: err });
    expect(console.error).toHaveBeenCalledWith('Crawl Error', err);
    expect(Bugsnag.notify).toHaveBeenCalledWith(err, expect.any(Function));
    expect(event).toEqual({ context: 'Crawl Error', metadata: { error: err } });
  });

  it('should optionally track info on Bugsnag', async () => {
    const event = {};
    Bugsnag.notify = jest.fn((err, cb) => cb(event));
    const msg = 'some msg';
    loggerService.init();
    loggerService.track(msg, { type: 'info' });
    expect(console.log).toHaveBeenCalledWith(msg, JSON.stringify({ type: 'info' }));
    expect(Bugsnag.notify).toHaveBeenCalledWith(msg, expect.any(Function));
    expect(event).toEqual({ severity: 'info', metadata: {} });
  });

  it('should optionally attach metadata on Bugsnag notifications', async () => {
    const event = {};
    Bugsnag.notify = jest.fn((err, cb) => cb(event));
    const err = new Error('some error');
    const crawler = { name: 'songkick' };
    loggerService.init();
    loggerService.track('Crawl Error', { type: 'error', error: err, crawler });
    expect(console.error).toHaveBeenCalledWith('Crawl Error', err);
    expect(Bugsnag.notify).toHaveBeenCalledWith(err, expect.any(Function));
    expect(event).toEqual({ context: 'Crawl Error', metadata: { crawler, error: err } });
  });
});
