const textService = require('./text');

describe('Text Service', () => {
  it('should remove unnecessary spaces', () => {
    const badText = 'here   are  duplicate    spaces';
    expect(textService.removeUnnecessarySpaces(badText)).toEqual('here are duplicate spaces');
  });
});
