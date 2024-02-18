const { serve } = require('../services/testing');
const dateService = require('../services/date');
const diskIngressosResource = require('../resources/disk-ingressos');
const eventsResource = require('../resources/events');
const diskIngressosMock = require('../mocks/disk-ingressos');
const eventsMock = require('../mocks/events');

describe('Crawlers Routes', () => {
  async function start(){
    return await serve().post('/crawlers').set({ vwtoken: 'vee456' }).send();
  }

  beforeEach(() => {
    dateService.getNow = jest.fn(() => new Date(2024, 1, 15));
    diskIngressosResource.get = jest.fn(() => Promise.resolve({ data: diskIngressosMock }));
    eventsResource.get = jest.fn(({ minDate }) => {
      const data = eventsMock.filter(event => event.date >= minDate);
      return Promise.resolve({ data });
    });
    eventsResource.save = jest.fn(event => Promise.resolve(event));
  });

  it('should not allow cralwer execution by default', async () => {
    const response = await serve().post('/crawlers');
    expect(response.status).toEqual(401);
  });

  it('should save Disk Ingressos events', async () => {
    const response = await start();
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Dhouse Apresenta - Stand Up Comedy Com Danilo Gentili - Sessão Extra',
      slug: 'dhouse-apresenta-stand-up-comedy-com-danilo-gentili-sessao-extra-curitiba-pr-20240229',
      date: '2024-02-29',
      city: 'Curitiba',
      state: 'PR',
      country: 'BR',
      url: 'https://www.diskingressos.com.br/evento/6359/29-02-2024/pr/curitiba/dhouse-apresenta-stand-up-comedy-com-danilo-gentili-sessao-extra'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Dhouse Apresenta: Stand Up Comedy Com Criss Paiva',
      slug: 'dhouse-apresenta-stand-up-comedy-com-criss-paiva-curitiba-pr-20240301',
      date: '2024-03-01',
      city: 'Curitiba',
      state: 'PR',
      country: 'BR',
      url: 'https://www.diskingressos.com.br/evento/6277/01-03-2024/pr/curitiba/dhouse-apresenta-stand-up-comedy-com-criss-paiva'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Tributo Secos E Molhados - Especial 50 Anos',
      slug: 'tributo-secos-e-molhados-especial-50-anos-curitiba-pr-20240301',
      date: '2024-03-01',
      city: 'Curitiba',
      state: 'PR',
      country: 'BR',
      url: 'https://www.diskingressos.com.br/evento/6371/01-03-2024/pr/curitiba/tributo-secos-e-molhados-especial-50-anos'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Dhouse Apresenta – \"Orgulho Do Papai\" Com Giovana Fagundes',
      slug: 'dhouse-apresenta-orgulho-do-papai-com-giovana-fagundes-curitiba-pr-20240306',
      date: '2024-03-06',
      city: 'Curitiba',
      state: 'PR',
      country: 'BR',
      url: 'https://www.diskingressos.com.br/evento/6380/06-03-2024/pr/curitiba/dhouse-apresenta-orgulho-do-papai-com-giovana-fagundes'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Chico César & Zeca Baleiro',
      slug: 'chico-cesar-zeca-baleiro-florianopolis-sc-20240309',
      date: '2024-03-09',
      city: 'Florianópolis',
      state: 'SC',
      country: 'BR',
      url: 'https://www.diskingressos.com.br/evento/6212/09-03-2024/sc/florianopolis/chico-cesar-zeca-baleiro'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Dhouse Apresenta – 40 + Com Eduardo Jericó',
      slug: 'dhouse-apresenta-40-com-eduardo-jerico-curitiba-pr-20240309',
      date: '2024-03-09',
      city: 'Curitiba',
      state: 'PR',
      country: 'BR',
      url: 'https://www.diskingressos.com.br/evento/6410/09-03-2024/pr/curitiba/dhouse-apresenta-40-com-eduardo-jerico'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: '1º Encontro Aaonça',
      slug: '1-encontro-aaonca-curitiba-pr-20240311',
      date: '2024-03-11',
      city: 'Curitiba',
      state: 'PR',
      country: 'BR',
      url: 'https://www.diskingressos.com.br/evento/6468/11-03-2024/pr/curitiba/1-encontro-aaonca'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'The Beast Experience',
      slug: 'the-beast-experience-joinville-sc-20240301',
      date: '2024-03-01',
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: 'https://www.diskingressos.com.br/evento/6155/01-03-2024/sc/joinville/the-beast-experience'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Palestra Com Zico',
      slug: 'palestra-com-zico-porto-alegre-rs-20240409',
      date: '2024-04-09',
      city: 'Porto Alegre',
      state: 'RS',
      country: 'BR',
      url: 'https://www.diskingressos.com.br/evento/6211/09-04-2024/rs/porto-alegre/palestra-com-zico'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Yamandu Costa',
      slug: 'yamandu-costa-curitiba-pr-20240502',
      date: '2024-05-02',
      city: 'Curitiba',
      state: 'PR',
      country: 'BR',
      url: 'https://www.diskingressos.com.br/evento/6013/02-05-2024/pr/curitiba/yamandu-costa'
    });
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.save).toHaveBeenCalledTimes(10);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      duration: expect.any(Number),
      successes: 1,
      failures: 0
    });
  });

  it('should log error on crawl error', async () => {
    const err = 'some err';
    console.error = jest.fn();
    diskIngressosResource.get = jest.fn(() => Promise.reject(err));
    const response = await start();
    expect(console.error).toHaveBeenCalledWith(err);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      duration: expect.any(Number),
      successes: 0,
      failures: 1
    });
  });
});
