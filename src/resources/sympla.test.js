const baseResource = require('./base');
const symplaResource = require('./sympla');

describe('Sympla Resource', () => {
  beforeEach(() => {
    baseResource.post = jest.fn();
    baseResource.get = jest.fn();
  });

  it('should get events', () => {
    symplaResource.get();
    expect(baseResource.post).toHaveBeenCalledWith(
      'https://www.sympla.com.br/api/v1/search',
      {
        service: '/v4/search',
        params: {
          collections: 17,
          range: '',
          need_pay: '',
          include_organizers: '1',
          only: 'name,start_date,end_date,images,event_type,duration_type,location,id,global_score,start_date_formats,end_date_formats,url,company,type,organizer',
          limit: '1000',
          page: 1,
          sort: 'global-score-norm',
          start_date: '',
          end_date: '',
          state: '',
          city: ''
        }
      }
    );
  });

  it('should get events optionally filtering by location', () => {
    const city = 'joinville';
    const state = 'SC';
    symplaResource.get({ city, state });
    expect(baseResource.post).toHaveBeenCalledWith(
      'https://www.sympla.com.br/api/v1/search',
      {
        service: '/v4/search',
        params: {
          collections: 17,
          range: '',
          need_pay: '',
          include_organizers: '1',
          only: 'name,start_date,end_date,images,event_type,duration_type,location,id,global_score,start_date_formats,end_date_formats,url,company,type,organizer',
          limit: '1000',
          page: 1,
          sort: 'global-score-norm',
          start_date: '',
          end_date: '',
          state,
          city
        }
      }
    );
  });

  it('should get event details page', () => {
    const url = 'https://www.sympla.com.br/evento/show-vera-loca/2384437';
    symplaResource.getEventDetailsPage(url);
    expect(baseResource.get).toHaveBeenCalledWith(url);
  });
});
