const { BASE_URL } = require('../constants/sympla');
const baseResource = require('./base');

const _public = {};

_public.get = () => baseResource.post(`${BASE_URL}/search`, getSearchParams());

function getSearchParams(){
  return {
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
  };
}

module.exports = _public;
