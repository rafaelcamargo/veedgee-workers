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
        service: '/v4/search/term',
        params: {
          collections: 17,
          range: '',
          need_pay: '',
          include_organizers: '1',
          only: 'name,start_date,end_date,images,event_type,duration_type,location,id,global_score,start_date_formats,end_date_formats,url,company,type,organizer',
          limit: '1000',
          page: '1',
          q: 'a',
          sort: 'global-score-norm',
          start_date: '',
          end_date: '',
          state: '',
          city: ''
        }
      }
    );
  });
});
