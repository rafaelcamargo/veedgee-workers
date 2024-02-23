const Bugsnag = require('@bugsnag/js');
const projectPkg = require('../../package');
const environmentService = require('./environment');
const loggerService = require('./logger');

describe('Logger Service', () => {
  beforeEach(() => {
    console.error = jest.fn();
    console.log = jest.fn();
    Bugsnag.start = jest.fn();
    Bugsnag.notify = jest.fn();
    environmentService.get = jest.fn(() => ({ BUGSNAG_API_TOKEN: '123' }));
  });

  it('should not track errors by default', async () => {
    environmentService.get = jest.fn(() => ({}));
    loggerService.init();
    loggerService.track(new Error('some error'));
    expect(Bugsnag.start).not.toHaveBeenCalled();
    expect(Bugsnag.notify).not.toHaveBeenCalled();
  });

  it('should track error on Bugsnag if Bugsnag token env var has been found', async () => {
    const err = new Error('some error');
    loggerService.init();
    expect(Bugsnag.start).toHaveBeenCalledWith({
      apiKey: expect.any(String),
      metadata: {
        app: `${projectPkg.name}@${projectPkg.version}`
      }
    });
    loggerService.track(err);
    expect(console.error).toHaveBeenCalledWith(err);
    expect(Bugsnag.notify).toHaveBeenCalledWith(err);
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
});
