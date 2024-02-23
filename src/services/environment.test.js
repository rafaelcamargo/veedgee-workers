const TEST = require('../../environments/test');
const DEV = require('../../environments/development');
const PROD = require('../../environments/production');

describe('Environment', () => {
  it('should export test environment if test env argument is given', () => {
    process.env.NODE_ENV = 'test';
    const ENV = require('./environment').get();
    expect(ENV).toEqual(TEST);
  });

  it('should export development environment if no env argument is given', () => {
    process.env.NODE_ENV = '';
    const ENV = require('./environment').get();
    expect(ENV).toEqual(DEV);
  });

  it('should export production environment if production env argument is given', () => {
    process.env.NODE_ENV = 'production';
    const ENV = require('./environment').get();
    expect(ENV).toEqual(PROD);
  });
});
