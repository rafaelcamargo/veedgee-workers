const { serve, getMockedFile } = require('../services/testing');
const dateService = require('../services/date');
const loggerService = require('../services/logger');
const blueticketResource = require('../resources/blueticket');
const diskIngressosResource = require('../resources/disk-ingressos');
const eticketCenterResource = require('../resources/eticket-center');
const eventsResource = require('../resources/events');
const songkickResource = require('../resources/songkick');
const symplaResource = require('../resources/sympla');
const eventFetcherService = require('../services/event-fetcher');
const blueticketMock = require('../mocks/blueticket');
const diskIngressosMock = require('../mocks/disk-ingressos');
const symplaMock = require('../mocks/sympla');
const eventsMock = require('../mocks/events');

describe('Crawlers Routes', () => {
  async function start(){
    return await serve().post('/crawlers').set({ vwtoken: 'vee456' }).send();
  }

  beforeEach(() => {
    dateService.getNow = jest.fn(() => new Date(2024, 1, 15));
    blueticketResource.get = jest.fn(() => Promise.resolve({}));
    eticketCenterResource.get = jest.fn(() => Promise.resolve({ data: getMockedFile('eticket-center-empty.html') }));
    diskIngressosResource.get = jest.fn(() => Promise.resolve({ data: {} }));
    eventsResource.get = jest.fn(({ minDate }) => {
      const data = eventsMock.filter(event => event.date >= minDate);
      return Promise.resolve({ data });
    });
    eventsResource.save = jest.fn(event => Promise.resolve(event));
    loggerService.track = jest.fn();
    songkickResource.get = jest.fn(() => Promise.resolve({ data: getMockedFile('songkick-empty.html') }));
    symplaResource.get = jest.fn(() => Promise.resolve({ data: {} }));
  });

  afterEach(() => {
    eventFetcherService.flushCache();
  });

  it('should not allow cralwer execution by default', async () => {
    const response = await serve().post('/crawlers');
    expect(response.status).toEqual(401);
  });

  it('should save Disk Ingressos events', async () => {
    diskIngressosResource.get = jest.fn(() => Promise.resolve({ data: diskIngressosMock }));
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
      successes: 5,
      failures: 0
    });
  });

  it('should save ETicket Center events', async () => {
    eticketCenterResource.get = jest.fn(({ pagina }) => {
      return Promise.resolve({ data: getMockedFile(`eticket-center-${pagina}.html`) });
    });
    const response = await start();
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Elvis Experience Com Dean Z Em Joinville',
      slug: 'elvis-experience-com-dean-z-em-joinville-joinville-sc-20240229',
      date: '2024-02-29',
      time: '21:00',
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: 'https://www.eticketcenter.com.br/eventos/show/elvis-experience-com-dean-z-em-joinville/29-02/21-00/'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Elvis Experience Com Dean Z Em Blumenau',
      slug: 'elvis-experience-com-dean-z-em-blumenau-blumenau-sc-20240302',
      date: '2024-03-02',
      time: '21:00',
      city: 'Blumenau',
      state: 'SC',
      country: 'BR',
      url: 'https://www.eticketcenter.com.br/eventos/show/elvis-experience-com-dean-z-em-blumenau/02-03/21-00/'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Gratiluz Com Dra. Rosângela',
      slug: 'gratiluz-com-dra-rosangela-joinville-sc-20240315',
      date: '2024-03-15',
      time: '20:30',
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: 'https://www.eticketcenter.com.br/eventos/stand-up/gratiluz-com-dra-rosangela/15-03/20-30/'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Rei Leão | O Musical',
      slug: 'rei-leao-o-musical-joinville-sc-20240316',
      date: '2024-03-16',
      time: '16:00',
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: 'https://www.eticketcenter.com.br/eventos/musical/rei-leao-o-musical/16-03/16-00/'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Ultimate Queen & Orquestra',
      slug: 'ultimate-queen-orquestra-blumenau-sc-20240615',
      date: '2024-06-15',
      time: '21:00',
      city: 'Blumenau',
      state: 'SC',
      country: 'BR',
      url: 'https://www.eticketcenter.com.br/eventos/show/ultimate-queen-orquestra/15-06/21-00/'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Bruna Louise - Joi',
      slug: 'bruna-louise-joi-joinville-sc-20240622',
      date: '2024-06-22',
      time: '19:00',
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: 'https://www.eticketcenter.com.br/eventos/stand-up/bruna-louise-joi/22-06/19-00/'
    });
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.save).toHaveBeenCalledTimes(6);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      duration: expect.any(Number),
      successes: 5,
      failures: 0
    });
  });

  it('should save Bluetickets events', async () => {
    blueticketResource.get = jest.fn(params => {
      const data = params.categoria === 11 && blueticketMock;
      return Promise.resolve({ data });
    });
    const response = await start();
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Samba Jurerê',
      slug: 'samba-jurere-florianopolis-sc-20240309',
      date: '2024-03-09',
      time: '18:00',
      city: 'Florianópolis',
      state: 'SC',
      country: 'BR',
      url: 'https://www.blueticket.com.br/evento/33937/samba-jurere'
    });
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.save).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      duration: expect.any(Number),
      successes: 5,
      failures: 0
    });
  });

  it('should save Sympla events', async () => {
    symplaResource.get = jest.fn(() => Promise.resolve({ data: symplaMock }));
    const response = await start();
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Especial Guns N Roses - Com A Banda Guns N Roses Cover Curitiba',
      slug: 'especial-guns-n-roses-com-a-banda-guns-n-roses-cover-curitiba-itajai-sc-20240322',
      date: '2024-03-22',
      time: '17:00',
      city: 'Itajaí',
      state: 'SC',
      country: 'BR',
      url: 'https://www.sympla.com.br/evento/especial-guns-n-roses-com-a-banda-guns-n-roses-cover-curitiba/2379165'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Black Or White - A Festa',
      slug: 'black-or-white-a-festa-joinville-sc-20240614',
      date: '2024-06-14',
      time: '21:00',
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: 'https://www.sympla.com.br/evento/black-or-white-a-festa/2339727'
    });
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.save).toHaveBeenCalledTimes(2);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      duration: expect.any(Number),
      successes: 5,
      failures: 0
    });
  });

  it('should save Songkick events', async () => {
    songkickResource.get = jest.fn(({ city, page }) => {
      return Promise.resolve({ data: getMockedFile(`songkick-${city}-page-${page}.html`) });
    });
    const response = await start();
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Di Ferrero',
      slug: 'di-ferrero-blumenau-sc-20240407',
      date: '2024-04-07',
      time: '20:30',
      city: 'Blumenau',
      state: 'SC',
      country: 'BR',
      url: 'https://www.songkick.com/pt/concerts/41724580-di-ferrero-at-teatro-carlos-gomes'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Dead Fish',
      slug: 'dead-fish-blumenau-sc-20240419',
      date: '2024-04-19',
      time: '19:00',
      city: 'Blumenau',
      state: 'SC',
      country: 'BR',
      url: 'https://www.songkick.com/pt/concerts/41804717-dead-fish-at-ahoy-tavern-club'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Tba Festival 2024',
      slug: 'tba-festival-2024-blumenau-sc-20240518',
      date: '2024-05-18',
      city: 'Blumenau',
      state: 'SC',
      country: 'BR',
      url: 'https://www.songkick.com/pt/festivals/176531-tba/id/41792900-tba-festival-2024'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Espetáculo Teatral "Bita E Os Animais" Em Curitiba (pr) 2024',
      slug: 'espetaculo-teatral-bita-e-os-animais-em-curitiba-pr-2024-curitiba-pr-20240302',
      date: '2024-03-02',
      city: 'Curitiba',
      state: 'PR',
      country: 'BR',
      url: 'https://www.songkick.com/pt/festivals/3647009-espetaculo-teatral-bita-e-os-animais-em-curitiba-pr/id/41761308-espetculo-teatral-bita-e-os-animais-em-curitiba-pr-2024'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Overdriver Duo',
      slug: 'overdriver-duo-curitiba-pr-20240316',
      date: '2024-03-16',
      time: '21:00',
      city: 'Curitiba',
      state: 'PR',
      country: 'BR',
      url: 'https://www.songkick.com/pt/concerts/41714611-overdriver-duo-at-teatro-fernanda-montenegro'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Terraplana',
      slug: 'terraplana-curitiba-pr-20240316',
      date: '2024-03-16',
      time: '21:00',
      city: 'Curitiba',
      state: 'PR',
      country: 'BR',
      url: 'https://www.songkick.com/pt/concerts/41728574-terraplana-at-basement-cultural'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Ana Cañas',
      slug: 'ana-canas-florianopolis-sc-20240316',
      date: '2024-03-16',
      time: '20:00',
      city: 'Florianópolis',
      state: 'SC',
      country: 'BR',
      url: 'https://www.songkick.com/pt/concerts/41696929-ana-canas-at-teatro-ademir-rosa'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Mdc',
      slug: 'mdc-florianopolis-sc-20240316',
      date: '2024-03-16',
      time: '22:00',
      city: 'Florianópolis',
      state: 'SC',
      country: 'BR',
      url: 'https://www.songkick.com/pt/concerts/41794649-mdc-at-hangar-t6-listening-bar'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Dj Brinquinho Sc',
      slug: 'dj-brinquinho-sc-florianopolis-sc-20240322',
      date: '2024-03-22',
      time: '20:00',
      city: 'Florianópolis',
      state: 'SC',
      country: 'BR',
      url: 'https://www.songkick.com/pt/concerts/41792887-dj-brinquinho-sc-at-bierteca-bar'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Vintage Culture',
      slug: 'vintage-culture-itajai-sc-20240329',
      date: '2024-03-29',
      time: '22:00',
      city: 'Itajaí',
      state: 'SC',
      country: 'BR',
      url: 'https://www.songkick.com/pt/concerts/41804579-vintage-culture-at-warung-beach-club'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Lagum',
      slug: 'lagum-itajai-sc-20240530',
      date: '2024-05-30',
      time: '21:00',
      city: 'Itajaí',
      state: 'SC',
      country: 'BR',
      url: 'https://www.songkick.com/pt/concerts/41629431-lagum-at-belvedere-beach-club'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Di Ferrero',
      slug: 'di-ferrero-joinville-sc-20240405',
      date: '2024-04-05',
      time: '20:00',
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: 'https://www.songkick.com/pt/concerts/41724578-di-ferrero-at-teatro-da-liga'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Mordor Truckers',
      slug: 'mordor-truckers-joinville-sc-20240406',
      date: '2024-04-06',
      time: '19:00',
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: 'https://www.songkick.com/pt/concerts/41804725-mordor-truckers-at-zeit-cervejaria'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Rogério Skylab',
      slug: 'rogerio-skylab-porto-alegre-rs-20240316',
      date: '2024-03-16',
      time: '21:00',
      city: 'Porto Alegre',
      state: 'RS',
      country: 'BR',
      url: 'https://www.songkick.com/pt/concerts/41683692-rogerio-skylab-at-bar-opiniao'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Lucas Morato',
      slug: 'lucas-morato-porto-alegre-rs-20240317',
      date: '2024-03-17',
      time: '17:00',
      city: 'Porto Alegre',
      state: 'RS',
      country: 'BR',
      url: 'https://www.songkick.com/pt/concerts/41817222-lucas-morato-at-samba-da-galera'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Ivete Sangalo',
      slug: 'ivete-sangalo-porto-alegre-rs-20241116',
      date: '2024-11-16',
      city: 'Porto Alegre',
      state: 'RS',
      country: 'BR',
      url: 'https://www.songkick.com/pt/concerts/41806309-ivete-sangalo-at-estadio-beirario'
    });
    expect(eventsResource.save).toHaveBeenCalledWith({
      title: 'Jinjer',
      slug: 'jinjer-porto-alegre-rs-20241130',
      date: '2024-11-30',
      time: '19:00',
      city: 'Porto Alegre',
      state: 'RS',
      country: 'BR',
      url: 'https://www.songkick.com/pt/concerts/41801925-jinjer-at-opiniao'
    });
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.save).toHaveBeenCalledTimes(17);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      duration: expect.any(Number),
      successes: 5,
      failures: 0
    });
  });

  it('should track error on crawl error', async () => {
    const err = 'some err';
    console.error = jest.fn();
    diskIngressosResource.get = jest.fn(() => Promise.reject(err));
    const response = await start();
    expect(loggerService.track).toHaveBeenCalledWith(err);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      duration: expect.any(Number),
      successes: 4,
      failures: 1
    });
  });
});
