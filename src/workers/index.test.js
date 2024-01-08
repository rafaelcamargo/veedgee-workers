const crawlersWorker = require('./crawlers');
const workers = require('.');

describe('Workers', () => {
  beforeEach(() => {
    crawlersWorker.init = jest.fn();
  });

  it('should initialize crawlers worker', () => {
    workers.init();
    expect(crawlersWorker.init).toHaveBeenCalled();
  });
});
