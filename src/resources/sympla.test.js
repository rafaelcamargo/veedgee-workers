const baseResource = require('./base');
const symplaResource = require('./sympla');

describe('Sympla Resource', () => {
  beforeEach(() => {
    baseResource.post = jest.fn();
  });

  it('should get events', () => {
    symplaResource.get();
    expect(baseResource.post).toHaveBeenCalledWith(
      'https://www.sympla.com.br/api/v1/search',
      {
        service: '/v4/mapsearch',
        params: {
          collections: '17',
          only: 'name,start_date_formats,event_type,location,id,url,type',
          include_organizers: '1',
          city: '',
          formats: '80,87,89',
          page: '1',
          limit: '1000',
          q: 'a',
          start_date: '',
          end_date: '',
          state: ''
        }
      }
    );
  });
});
