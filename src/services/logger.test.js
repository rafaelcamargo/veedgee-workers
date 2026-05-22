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
    loggerService.track(err);
    expect(console.error).toHaveBeenCalledWith(err);
    expect(Bugsnag.notify).toHaveBeenCalledWith(err, expect.any(Function));
  });

  it('should optionally track info on Bugsnag', async () => {
    const event = {};
    Bugsnag.notify = jest.fn((err, cb) => cb(event));
    const msg = 'some msg';
    loggerService.init();
    loggerService.track(msg, { type: 'info' });
    expect(console.log).toHaveBeenCalledWith(msg);
    expect(Bugsnag.notify).toHaveBeenCalledWith(msg, expect.any(Function));
    expect(event).toEqual({ severity: 'info' });
  });

  it('should optionally attach metadata on Bugsnag notifications', async () => {
    const event = {};
    Bugsnag.notify = jest.fn((err, cb) => cb(event));
    const err = new Error('some error');
    const metadata = { crawler: { name: 'songkick' } };
    loggerService.init();
    loggerService.track(err, { metadata });
    expect(Bugsnag.notify).toHaveBeenCalledWith(err, expect.any(Function));
    expect(event).toEqual({ metadata });
  });
});
