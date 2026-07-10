const { serve, getMockedFile } = require('../services/testing');
const dateService = require('../services/date');
const delayService = require('../services/delay');
const loggerService = require('../services/logger');
const blueticketResource = require('../resources/blueticket');
const diskIngressosResource = require('../resources/disk-ingressos');
const eticketCenterResource = require('../resources/eticket-center');
const eventsResource = require('../resources/events');
const googleAiResource = require('../resources/google-ai');
const pensaNoEventoResource = require('../resources/pensa-no-evento');
const songkickResource = require('../resources/songkick');
const rapidApiResource = require('../resources/rapid-api');
const symplaResource = require('../resources/sympla');
const tockifyResource = require('../resources/tockify');
const ingressoResource = require('../resources/ingresso');
const eventFetcherService = require('../services/event-fetcher');
const eventService = require('../services/event');
const blueticketMock = require('../mocks/blueticket');
const diskIngressosMock = require('../mocks/disk-ingressos');
const eventsMock = require('../mocks/events');
const ingressoJoinvilleMock = require('../mocks/ingresso-joinville');
const ingressoSaoJoseMock = require('../mocks/ingresso-sao-jose');
const instagramPoraoDaLigaMock = require('../mocks/instagram-porao-da-liga');
const googleAiPoraoDaLigaMock = require('../mocks/google-ai-porao-da-liga');
const pensaNoEventoCuritibaMock = require('../mocks/pensa-no-evento-curitiba');
const pensaNoEventoJoinvilleMock = require('../mocks/pensa-no-evento-joinville');
const tockifyMock = require('../mocks/tockify');

const DEFAULT_CRAWLERS = [
  'blueticket',
  'disk-ingressos',
  'tockify',
  'eticket-center',
  'songkick',
  'pensa-no-evento',
  'ingresso'
];

describe('Crawlers Routes', () => {
  function buildExpectedPerformanceReport(crawlerNames, { errors = [] } = {}){
    return {
      reportJson: [
        ...crawlerNames.map(name => ({
          task: `Crawling: ${name}`,
          result: errors.includes(name) ? 'error' : 'success',
          time: expect.any(Number)
        })),
        { task: 'Crawling: Total', result: 'success', time: expect.any(Number) }
      ],
      reportTxt: expect.any(String)
    };
  }

  async function start(payload){
    return await serve().post('/crawlers').set({ vwtoken: 'vee456' }).send(payload);
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
    eventsResource.bulkSave = jest.fn(events => Promise.resolve({ data: { count: events.length } }));
    loggerService.track = jest.fn();
    pensaNoEventoResource.get = jest.fn(() => Promise.resolve({ data: {} }));
    songkickResource.get = jest.fn(() => Promise.resolve({ data: getMockedFile('songkick-empty.html') }));
    symplaResource.get = jest.fn(() => Promise.resolve({ data: {} }));
    tockifyResource.get = jest.fn(() => Promise.resolve({ data: {} }));
    ingressoResource.getNowPlaying = jest.fn(() => Promise.resolve({ data: {} }));
    delayService.pause = jest.fn();
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
    expect(eventsResource.bulkSave).toHaveBeenCalledWith([
      {
        title: 'Dhouse Apresenta - Stand Up Comedy Com Danilo Gentili - Sessão Extra',
        slug: 'dhouse-apresenta-stand-up-comedy-com-danilo-gentili-sessao-extra-curitiba-pr-20240229',
        date: '2024-02-29',
        time: undefined,
        city: 'Curitiba',
        state: 'PR',
        country: 'BR',
        url: 'https://www.diskingressos.com.br/evento/6359/29-02-2024/pr/curitiba/dhouse-apresenta-stand-up-comedy-com-danilo-gentili-sessao-extra',
        image: 'https://genesisapi.diskingressos.com.br/images/cache/events/6359.webp',
        category: 'comedy'
      },
      {
        title: 'Dhouse Apresenta: Stand Up Comedy Com Criss Paiva',
        slug: 'dhouse-apresenta-stand-up-comedy-com-criss-paiva-curitiba-pr-20240301',
        date: '2024-03-01',
        time: undefined,
        city: 'Curitiba',
        state: 'PR',
        country: 'BR',
        url: 'https://www.diskingressos.com.br/evento/6277/01-03-2024/pr/curitiba/dhouse-apresenta-stand-up-comedy-com-criss-paiva',
        image: 'https://genesisapi.diskingressos.com.br/images/cache/events/6277.webp',
        category: 'comedy'
      },
      {
        title: 'Tributo Secos E Molhados - Especial 50 Anos',
        slug: 'tributo-secos-e-molhados-especial-50-anos-curitiba-pr-20240301',
        date: '2024-03-01',
        time: undefined,
        city: 'Curitiba',
        state: 'PR',
        country: 'BR',
        url: 'https://www.diskingressos.com.br/evento/6371/01-03-2024/pr/curitiba/tributo-secos-e-molhados-especial-50-anos',
        image: 'https://genesisapi.diskingressos.com.br/images/cache/events/6371.webp',
        category: 'music'
      },
      {
        title: 'The Beast Experience',
        slug: 'the-beast-experience-joinville-sc-20240301',
        date: '2024-03-01',
        time: undefined,
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.diskingressos.com.br/evento/6155/01-03-2024/sc/joinville/the-beast-experience',
        image: 'https://genesisapi.diskingressos.com.br/images/cache/events/6155.webp',
        category: 'music'
      },
      {
        title: 'Dhouse Apresenta – \"Orgulho Do Papai\" Com Giovana Fagundes',
        slug: 'dhouse-apresenta-orgulho-do-papai-com-giovana-fagundes-curitiba-pr-20240306',
        date: '2024-03-06',
        time: undefined,
        city: 'Curitiba',
        state: 'PR',
        country: 'BR',
        url: 'https://www.diskingressos.com.br/evento/6380/06-03-2024/pr/curitiba/dhouse-apresenta-orgulho-do-papai-com-giovana-fagundes',
        image: 'https://genesisapi.diskingressos.com.br/images/cache/events/6380.webp',
        category: 'comedy'
      },
      {
        title: 'Chico César & Zeca Baleiro',
        slug: 'chico-cesar-zeca-baleiro-florianopolis-sc-20240309',
        date: '2024-03-09',
        time: undefined,
        city: 'Florianópolis',
        state: 'SC',
        country: 'BR',
        url: 'https://www.diskingressos.com.br/evento/6212/09-03-2024/sc/florianopolis/chico-cesar-zeca-baleiro',
        image: 'https://genesisapi.diskingressos.com.br/images/cache/events/6212.webp',
        category: 'music'
      },
      {
        title: 'Dhouse Apresenta – 40 + Com Eduardo Jericó',
        slug: 'dhouse-apresenta-40-com-eduardo-jerico-curitiba-pr-20240309',
        date: '2024-03-09',
        time: undefined,
        city: 'Curitiba',
        state: 'PR',
        country: 'BR',
        url: 'https://www.diskingressos.com.br/evento/6410/09-03-2024/pr/curitiba/dhouse-apresenta-40-com-eduardo-jerico',
        image: 'https://genesisapi.diskingressos.com.br/images/cache/events/6410.webp',
        category: 'comedy'
      },
      {
        title: '1º Encontro Aaonça',
        slug: '1-encontro-aaonca-curitiba-pr-20240311',
        date: '2024-03-11',
        time: undefined,
        city: 'Curitiba',
        state: 'PR',
        country: 'BR',
        url: 'https://www.diskingressos.com.br/evento/6468/11-03-2024/pr/curitiba/1-encontro-aaonca',
        image: 'https://genesisapi.diskingressos.com.br/images/cache/events/6468.webp',
        category: 'festivals'
      },
      {
        title: 'Palestra Com Zico',
        slug: 'palestra-com-zico-porto-alegre-rs-20240409',
        date: '2024-04-09',
        time: undefined,
        city: 'Porto Alegre',
        state: 'RS',
        country: 'BR',
        url: 'https://www.diskingressos.com.br/evento/6211/09-04-2024/rs/porto-alegre/palestra-com-zico',
        image: 'https://genesisapi.diskingressos.com.br/images/cache/events/6211.webp',
        category: 'education'
      },
      {
        title: 'Yamandu Costa',
        slug: 'yamandu-costa-curitiba-pr-20240502',
        date: '2024-05-02',
        time: undefined,
        city: 'Curitiba',
        state: 'PR',
        country: 'BR',
        url: 'https://www.diskingressos.com.br/evento/6013/02-05-2024/pr/curitiba/yamandu-costa',
        image: 'https://genesisapi.diskingressos.com.br/images/cache/events/6013.webp',
        category: 'music'
      }
    ]);
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.bulkSave).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(buildExpectedPerformanceReport(DEFAULT_CRAWLERS));
    expect(loggerService.track).not.toHaveBeenCalled();
  });

  it('should save ETicket Center events', async () => {
    eticketCenterResource.get = jest.fn(({ Pagina }) => {
      return Promise.resolve({ data: getMockedFile(`eticket-center-${Pagina}.html`) });
    });
    const response = await start();
    expect(eventsResource.bulkSave).toHaveBeenCalledWith([
      {
        title: 'Elvis Experience Com Dean Z Em Joinville',
        slug: 'elvis-experience-com-dean-z-em-joinville-joinville-sc-20240229',
        date: '2024-02-29',
        time: '21:00',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.eticketcenter.com.br/eventos/show/elvis-experience-com-dean-z-em-joinville/29-02/21-00/',
        image: 'https://www.eticketcenter.com.br/Assets/Imagens/2023/09/06//512b809896-elvis-experience-com-dean-z-em-joinville_2.webp',
        category: 'music'
      },
      {
        title: 'Elvis Experience Com Dean Z Em Blumenau',
        slug: 'elvis-experience-com-dean-z-em-blumenau-blumenau-sc-20240302',
        date: '2024-03-02',
        time: '21:00',
        city: 'Blumenau',
        state: 'SC',
        country: 'BR',
        url: 'https://www.eticketcenter.com.br/eventos/show/elvis-experience-com-dean-z-em-blumenau/02-03/21-00/',
        image: 'https://www.eticketcenter.com.br/Assets/Imagens/2023/09/13//fa311ad974-elvis-experience-com-dean-z-em-blumenau_2.webp',
        category: 'music'
      },
      {
        title: 'Gratiluz Com Dra. Rosângela',
        slug: 'gratiluz-com-dra-rosangela-joinville-sc-20240315',
        date: '2024-03-15',
        time: '20:30',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.eticketcenter.com.br/eventos/stand-up/gratiluz-com-dra-rosangela/15-03/20-30/',
        image: 'https://www.eticketcenter.com.br/Assets/Imagens/2024/01/17//3bb07b7d32-gratiluz-com-dra-rosangela_2.webp',
        category: 'comedy'
      },
      {
        title: 'Rei Leão | O Musical',
        slug: 'rei-leao-o-musical-joinville-sc-20240316',
        date: '2024-03-16',
        time: '16:00',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.eticketcenter.com.br/eventos/musical/rei-leao-o-musical/16-03/16-00/',
        image: 'https://www.eticketcenter.com.br/Assets/Imagens/2024/01/17//eb8eaacfc1-rei-leao-o-musical_2.webp',
        category: 'musicals'
      },
      {
        title: 'Ultimate Queen & Orquestra',
        slug: 'ultimate-queen-orquestra-blumenau-sc-20240615',
        date: '2024-06-15',
        time: '21:00',
        city: 'Blumenau',
        state: 'SC',
        country: 'BR',
        url: 'https://www.eticketcenter.com.br/eventos/show/ultimate-queen-orquestra/15-06/21-00/',
        image: 'https://www.eticketcenter.com.br/Assets/Imagens/2024/01/17//fd5cc002c9-ultimate-queen-orquestra_2.webp',
        category: 'music'
      },
      {
        title: 'Bruna Louise - Joi',
        slug: 'bruna-louise-joi-joinville-sc-20240622',
        date: '2024-06-22',
        time: '19:00',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.eticketcenter.com.br/eventos/stand-up/bruna-louise-joi/22-06/19-00/',
        image: 'https://www.eticketcenter.com.br/Assets/Imagens/2024/02/19//d0693447a5-bruna-louise-joi_2.webp',
        category: 'comedy'
      },
      {
        title: 'Se É Que Você Me Entende Com Raphael Ghanem - Joinville',
        slug: 'se-e-que-voce-me-entende-com-raphael-ghanem-joinville-joinville-sc-20240521',
        date: '2024-05-21',
        time: '20:30',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.eticketcenter.com.br/eventos/stand-up/se-e-que-voce-me-entende-com-raphael-ghanem-joinville/',
        image: 'https://www.eticketcenter.com.br/Assets/Imagens/2024/05/09//a6d458423a-se-e-que-voce-me-entende-com-raphael-ghanem-joinvi_2.webp',
        category: 'comedy'
      }
    ]);
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.bulkSave).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(buildExpectedPerformanceReport(DEFAULT_CRAWLERS));
    expect(loggerService.track).not.toHaveBeenCalled();
  });

  it('should save Bluetickets events', async () => {
    blueticketResource.get = jest.fn(params => {
      const data = params.categoria === 11 && blueticketMock;
      return Promise.resolve({ data });
    });
    const response = await start();
    expect(eventsResource.bulkSave).toHaveBeenCalledWith([{
      title: 'Samba Jurerê',
      slug: 'samba-jurere-florianopolis-sc-20240309',
      date: '2024-03-09',
      time: '18:00',
      city: 'Florianópolis',
      state: 'SC',
      country: 'BR',
      url: 'https://www.blueticket.com.br/evento/33937/samba-jurere',
      image: 'https://d2hnilqqbw3vnf.cloudfront.net/images/imagens/full/vQHiYmhjLdXXQtFWFmTVfJ6dv2JLBMEdMILf64kF.jpeg',
      category: 'music'
    }]);
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.bulkSave).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(buildExpectedPerformanceReport(DEFAULT_CRAWLERS));
    expect(loggerService.track).not.toHaveBeenCalled();
  });

  it('should handle Blueticket events with unknown category term', async () => {
    blueticketResource.get = jest.fn(params => {
      const data = params.categoria === 11 && [{
        codigo: 99999,
        data_indefinida: 0,
        data: '2024-03-10 20:00:00',
        nome: 'Evento Sem Categoria',
        nome_cidade: 'Joinville',
        uf_cidade: 'SC',
        categoria: 'Categoria Desconhecida',
        categoria_alt: 'Outra Desconhecida',
        slug: 'evento-sem-categoria'
      }];
      return Promise.resolve({ data });
    });
    const response = await start();
    expect(eventsResource.bulkSave).toHaveBeenCalledWith([{
      title: 'Evento Sem Categoria',
      slug: 'evento-sem-categoria-joinville-sc-20240310',
      date: '2024-03-10',
      time: '20:00',
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: 'https://www.blueticket.com.br/evento/99999/evento-sem-categoria'
    }]);
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.bulkSave).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(buildExpectedPerformanceReport(DEFAULT_CRAWLERS));
    expect(loggerService.track).not.toHaveBeenCalled();
  });

  it('should save Sympla events', async () => {
    symplaResource.get = jest.fn(({ city, state }) => {
      const fileSuffix = `${city.replace(/ /g, '-')}-${state.toLowerCase()}`;
      return Promise.resolve({
        data: JSON.parse(getMockedFile(`sympla-${fileSuffix}.json`))
      });
    });
    const response = await start({ mode: 'sympla' });
    expect(eventsResource.bulkSave).toHaveBeenCalledWith([
      {
        title: 'Before Night',
        slug: 'before-night-balneario-camboriu-sc-20240406',
        date: '2024-04-06',
        time: '15:00',
        city: 'Balneário Camboriú',
        state: 'SC',
        country: 'BR',
        url: 'https://www.sympla.com.br/evento/before-night/2360484'
      },
      {
        title: 'Balbúrdia Groove',
        slug: 'balburdia-groove-blumenau-sc-20240414',
        date: '2024-04-14',
        time: '17:00',
        city: 'Blumenau',
        state: 'SC',
        country: 'BR',
        url: 'https://www.sympla.com.br/evento/balburdia-groove/2409984'
      },
      {
        title: 'Acústico Navaranda - Curitiba',
        slug: 'acustico-navaranda-curitiba-curitiba-pr-20240503',
        date: '2024-05-03',
        time: '19:30',
        city: 'Curitiba',
        state: 'PR',
        country: 'BR',
        url: 'https://www.sympla.com.br/evento/acustico-navaranda-curitiba/2368782',
        category: 'music'
      },
      {
        title: 'Porter Summit 2024',
        slug: 'porter-summit-2024-florianopolis-sc-20241109',
        date: '2024-11-09',
        time: '08:00',
        city: 'Florianópolis',
        state: 'SC',
        country: 'BR',
        url: 'https://www.sympla.com.br/evento/porter-summit-2024/2222757',
        category: 'business'
      },
      {
        title: 'Antecipados Pg Abril I',
        slug: 'antecipados-pg-abril-i-itajai-sc-20240404',
        date: '2024-04-04',
        time: '20:00',
        city: 'Itajaí',
        state: 'SC',
        country: 'BR',
        url: 'https://www.sympla.com.br/evento/antecipados-pg-abril-i/2407133'
      },
      {
        title: 'Show Vera Loca',
        slug: 'show-vera-loca-joinville-sc-20240420',
        date: '2024-04-20',
        time: '21:00',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.sympla.com.br/evento/show-vera-loca/2384437',
        category: 'music',
        image: 'https://images.sympla.com.br/6a399b55b2597.jpg'
      },
      {
        title: 'Funduncinho Do Tabu',
        slug: 'funduncinho-do-tabu-porto-alegre-rs-20240419',
        date: '2024-04-19',
        time: '23:00',
        city: 'Porto Alegre',
        state: 'RS',
        country: 'BR',
        url: 'https://www.sympla.com.br/evento/funduncinho-do-tabu/2410478'
      }
    ]);
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.bulkSave).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(buildExpectedPerformanceReport(['sympla']));
    expect(loggerService.track).not.toHaveBeenCalled();
  });

  it('should notsave sympla events if no sympla events were found', async () => {
    symplaResource.get = jest.fn(() => Promise.resolve({}));
    const response = await start({ mode: 'sympla' });
    expect(eventsResource.bulkSave).not.toHaveBeenCalled();
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(buildExpectedPerformanceReport(['sympla']));
    expect(loggerService.track).not.toHaveBeenCalled();
  });

  it('should save Songkick events', async () => {
    songkickResource.get = jest.fn(({ city, page }) => {
      return Promise.resolve({ data: getMockedFile(`songkick-${city}-page-${page}.html`) });
    });
    const response = await start();
    expect(eventsResource.bulkSave).toHaveBeenCalledWith([
      {
        title: 'Di Ferrero',
        slug: 'di-ferrero-blumenau-sc-20240407',
        date: '2024-04-07',
        time: '20:30',
        city: 'Blumenau',
        state: 'SC',
        country: 'BR',
        url: 'https://www.songkick.com/pt/concerts/41724580-di-ferrero-at-teatro-carlos-gomes',
        image: 'https://images.sk-static.com/images/media/profile_images/artists/5604398/huge_avatar',
        category: 'music'
      },
      {
        title: 'Dead Fish',
        slug: 'dead-fish-blumenau-sc-20240419',
        date: '2024-04-19',
        time: '19:00',
        city: 'Blumenau',
        state: 'SC',
        country: 'BR',
        url: 'https://www.songkick.com/pt/concerts/41804717-dead-fish-at-ahoy-tavern-club',
        image: 'https://images.sk-static.com/images/media/profile_images/artists/483130/huge_avatar',
        category: 'music'
      },
      {
        title: 'Tba Festival 2024',
        slug: 'tba-festival-2024-blumenau-sc-20240518',
        date: '2024-05-18',
        city: 'Blumenau',
        state: 'SC',
        country: 'BR',
        url: 'https://www.songkick.com/pt/festivals/176531-tba/id/41792900-tba-festival-2024',
        image: 'https://images.sk-static.com/images/media/profile_images/events/41792900/huge_avatar?series_id=176531',
        category: 'music'
      },
      {
        title: 'Espetáculo Teatral "Bita E Os Animais" Em Curitiba (pr) 2024',
        slug: 'espetaculo-teatral-bita-e-os-animais-em-curitiba-pr-2024-curitiba-pr-20240302',
        date: '2024-03-02',
        city: 'Curitiba',
        state: 'PR',
        country: 'BR',
        url: 'https://www.songkick.com/pt/festivals/3647009-espetaculo-teatral-bita-e-os-animais-em-curitiba-pr/id/41761308-espetculo-teatral-bita-e-os-animais-em-curitiba-pr-2024',
        image: 'https://images.sk-static.com/images/media/profile_images/events/41761308/huge_avatar?series_id=3647009',
        category: 'music'
      },
      {
        title: 'Overdriver Duo',
        slug: 'overdriver-duo-curitiba-pr-20240316',
        date: '2024-03-16',
        time: '21:00',
        city: 'Curitiba',
        state: 'PR',
        country: 'BR',
        url: 'https://www.songkick.com/pt/concerts/41714611-overdriver-duo-at-teatro-fernanda-montenegro',
        image: 'https://images.sk-static.com/images/media/profile_images/artists/10157597/huge_avatar',
        category: 'music'
      },
      {
        title: 'Terraplana',
        slug: 'terraplana-curitiba-pr-20240316',
        date: '2024-03-16',
        time: '21:00',
        city: 'Curitiba',
        state: 'PR',
        country: 'BR',
        url: 'https://www.songkick.com/pt/concerts/41728574-terraplana-at-basement-cultural',
        image: 'https://images.sk-static.com/images/media/profile_images/artists/9318084/huge_avatar',
        category: 'music'
      },
      {
        title: 'Ana Cañas',
        slug: 'ana-canas-florianopolis-sc-20240316',
        date: '2024-03-16',
        time: '20:00',
        city: 'Florianópolis',
        state: 'SC',
        country: 'BR',
        url: 'https://www.songkick.com/pt/concerts/41696929-ana-canas-at-teatro-ademir-rosa',
        image: 'https://images.sk-static.com/images/media/profile_images/artists/835759/huge_avatar',
        category: 'music'
      },
      {
        title: 'Mdc',
        slug: 'mdc-florianopolis-sc-20240316',
        date: '2024-03-16',
        time: '22:00',
        city: 'Florianópolis',
        state: 'SC',
        country: 'BR',
        url: 'https://www.songkick.com/pt/concerts/41794649-mdc-at-hangar-t6-listening-bar',
        image: 'https://images.sk-static.com/images/media/profile_images/artists/42472/huge_avatar',
        category: 'music'
      },
      {
        title: 'Dj Brinquinho Sc',
        slug: 'dj-brinquinho-sc-florianopolis-sc-20240322',
        date: '2024-03-22',
        time: '20:00',
        city: 'Florianópolis',
        state: 'SC',
        country: 'BR',
        url: 'https://www.songkick.com/pt/concerts/41792887-dj-brinquinho-sc-at-bierteca-bar',
        image: 'https://images.sk-static.com/images/media/profile_images/artists/10244481/huge_avatar',
        category: 'music'
      },
      {
        title: 'Vintage Culture',
        slug: 'vintage-culture-itajai-sc-20240329',
        date: '2024-03-29',
        time: '22:00',
        city: 'Itajaí',
        state: 'SC',
        country: 'BR',
        url: 'https://www.songkick.com/pt/concerts/41804579-vintage-culture-at-warung-beach-club',
        image: 'https://images.sk-static.com/images/media/profile_images/artists/7295284/huge_avatar',
        category: 'music'
      },
      {
        title: 'Lagum',
        slug: 'lagum-itajai-sc-20240530',
        date: '2024-05-30',
        time: '21:00',
        city: 'Itajaí',
        state: 'SC',
        country: 'BR',
        url: 'https://www.songkick.com/pt/concerts/41629431-lagum-at-belvedere-beach-club',
        image: 'https://images.sk-static.com/images/media/profile_images/artists/8920664/huge_avatar',
        category: 'music'
      },
      {
        title: 'Di Ferrero',
        slug: 'di-ferrero-joinville-sc-20240405',
        date: '2024-04-05',
        time: '20:00',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.songkick.com/pt/concerts/41724578-di-ferrero-at-teatro-da-liga',
        image: 'https://images.sk-static.com/images/media/profile_images/artists/5604398/huge_avatar',
        category: 'music'
      },
      {
        title: 'Mordor Truckers',
        slug: 'mordor-truckers-joinville-sc-20240406',
        date: '2024-04-06',
        time: '19:00',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.songkick.com/pt/concerts/41804725-mordor-truckers-at-zeit-cervejaria',
        image: 'https://images.sk-static.com/images/media/profile_images/artists/10097828/huge_avatar',
        category: 'music'
      },
      {
        title: 'Rogério Skylab',
        slug: 'rogerio-skylab-porto-alegre-rs-20240316',
        date: '2024-03-16',
        time: '21:00',
        city: 'Porto Alegre',
        state: 'RS',
        country: 'BR',
        url: 'https://www.songkick.com/pt/concerts/41683692-rogerio-skylab-at-bar-opiniao',
        image: 'https://images.sk-static.com/images/media/profile_images/artists/2056134/huge_avatar',
        category: 'music'
      },
      {
        title: 'Lucas Morato',
        slug: 'lucas-morato-porto-alegre-rs-20240317',
        date: '2024-03-17',
        time: '17:00',
        city: 'Porto Alegre',
        state: 'RS',
        country: 'BR',
        url: 'https://www.songkick.com/pt/concerts/41817222-lucas-morato-at-samba-da-galera',
        image: 'https://images.sk-static.com/images/media/profile_images/artists/10293013/huge_avatar',
        category: 'music'
      },
      {
        title: 'Ivete Sangalo',
        slug: 'ivete-sangalo-porto-alegre-rs-20241116',
        date: '2024-11-16',
        city: 'Porto Alegre',
        state: 'RS',
        country: 'BR',
        url: 'https://www.songkick.com/pt/concerts/41806309-ivete-sangalo-at-estadio-beirario',
        image: 'https://images.sk-static.com/images/media/profile_images/artists/134839/huge_avatar',
        category: 'music'
      },
      {
        title: 'Jinjer',
        slug: 'jinjer-porto-alegre-rs-20241130',
        date: '2024-11-30',
        time: '19:00',
        city: 'Porto Alegre',
        state: 'RS',
        country: 'BR',
        url: 'https://www.songkick.com/pt/concerts/41801925-jinjer-at-opiniao',
        image: 'https://images.sk-static.com/images/media/profile_images/artists/1038996/huge_avatar',
        category: 'music'
      }
    ]);
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.bulkSave).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(buildExpectedPerformanceReport(DEFAULT_CRAWLERS));
    expect(loggerService.track).not.toHaveBeenCalled();
  });

  it('should save Tockify events', async () => {
    dateService.getNow = jest.fn(() => new Date(2026, 6, 9));
    tockifyResource.get = jest.fn(({ max, calname, startms }) => {
      expect(startms).toEqual(expect.any(Number));
      const data = {
        'eventosemjoinville-999': tockifyMock
      }[`${calname}-${max}`];
      return Promise.resolve({ data });
    });
    const response = await start();
    expect(eventsResource.bulkSave).toHaveBeenCalledWith([
      {
        title: 'Feira Ecosol Dona Francisca - Artesanatos E Similares',
        slug: 'feira-ecosol-dona-francisca-artesanatos-e-similares-joinville-sc-20260709',
        category: 'fair',
        date: '2026-07-09',
        time: '09:30',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://tockify.com/eventosemjoinville/detail/4169/1783589400000',
        image: 'https://d3flpus5evl89n.cloudfront.net/635fddd3c287a829555e8da5/6a455588892b27f8db966a91/scaled_1024.jpg'
      },
      {
        title: 'Artista Denise Schlickmann Faz Oficina Gratuita No Garten Shopping',
        slug: 'artista-denise-schlickmann-faz-oficina-gratuita-no-garten-shopping-joinville-sc-20260709',
        date: '2026-07-09',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://tockify.com/eventosemjoinville/detail/4224/1783612800000',
        image: 'https://d3flpus5evl89n.cloudfront.net/635fddd3c287a829555e8da5/6a4fc91f892b27f8db313eb8/scaled_896.jpg'
      },
      {
        title: 'Espetáculo Infantil O Pequeno Príncipe',
        slug: 'espetaculo-infantil-o-pequeno-principe-joinville-sc-20260710',
        category: 'theater',
        date: '2026-07-10',
        time: '19:30',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://tockify.com/eventosemjoinville/detail/4301/1783711800000'
      }
    ]);
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.bulkSave).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(buildExpectedPerformanceReport(DEFAULT_CRAWLERS));
    expect(loggerService.track).not.toHaveBeenCalled();
  });

  it('should save Pensa No Evento events', async () => {
    dateService.getNow = jest.fn(() => new Date(2026, 2, 12));
    pensaNoEventoResource.get = jest.fn(({ cityCode }) => {
      const data = { 19: pensaNoEventoJoinvilleMock, 32: pensaNoEventoCuritibaMock }[cityCode];
      return Promise.resolve({ data });
    });
    const response = await start();
    expect(eventsResource.bulkSave).toHaveBeenCalledWith([
      {
        title: 'Sextou Na Casinha',
        slug: 'sextou-na-casinha-curitiba-pr-20260313',
        date: '2026-03-13',
        time: '18:00',
        city: 'Curitiba',
        state: 'PR',
        country: 'BR',
        url: 'https://www.pensanoevento.com.br/sitev2/eventos/96401/sextou-na-casinha',
        image: 'https://files.pensanoevento.com.br/images/eventos/69aed1ac1bb6c_capa.webp'
      },
      {
        title: 'Dazaranha - Acústico',
        slug: 'dazaranha-acustico-joinville-sc-20260312',
        date: '2026-03-12',
        time: '18:00',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.pensanoevento.com.br/sitev2/eventos/95881/dazaranha-acustico',
        image: 'https://files.pensanoevento.com.br/images/eventos/697be1269dc98_capa.webp',
        category: 'music'
      }
    ]);
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.bulkSave).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(buildExpectedPerformanceReport(DEFAULT_CRAWLERS));
    expect(loggerService.track).not.toHaveBeenCalled();
  });

  it('should save now-playing movies from ingresso.com', async () => {
    dateService.getNow = jest.fn(() => new Date(2026, 5, 20));
    ingressoResource.getNowPlaying = jest.fn(cityId => {
      const data = {
        16: ingressoJoinvilleMock,
        153: ingressoSaoJoseMock
      }[cityId] || {};
      return Promise.resolve({ data });
    });
    const response = await start();
    expect(eventsResource.bulkSave).toHaveBeenCalledWith([
      {
        title: 'Homem-aranha: Um Novo Dia',
        slug: 'cinema-homem-aranha-um-novo-dia-joinville-sc-20260729',
        date: '2026-07-29',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.ingresso.com/filme/homem-aranha-um-novo-dia?city=joinville&partnership=home',
        image: 'https://ingresso-a.akamaihd.net/prd/img/movie/homem-aranha-um-novo-dia/9d6a5a94-700f-4b42-8c0d-85123b524aca.webp',
        category: 'movies'
      },
      {
        title: 'Toy Story 5',
        slug: 'cinema-toy-story-5-joinville-sc-20260620',
        date: '2026-06-20',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.ingresso.com/filme/toy-story-5?city=joinville&partnership=home',
        image: 'https://ingresso-a.akamaihd.net/prd/img/movie/toy-story-5/2a9f7d1e-400c-4caa-b989-c1fb513dd416.webp',
        category: 'movies'
      },
      {
        title: 'Dia D',
        slug: 'cinema-dia-d-sao-jose-sc-20260620',
        date: '2026-06-20',
        city: 'São José',
        state: 'SC',
        country: 'BR',
        url: 'https://www.ingresso.com/filme/dia-d?city=sao-jose&partnership=home',
        image: 'https://ingresso-a.akamaihd.net/prd/img/movie/dia-d/1d2f9e4c-665c-4e75-89e1-bf3068f51094.webp',
        category: 'movies'
      }
    ]);
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.bulkSave).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(buildExpectedPerformanceReport(DEFAULT_CRAWLERS));
    expect(loggerService.track).not.toHaveBeenCalled();
  });

  it('should save porão da liga events', async () => {
    dateService.getNow = jest.fn(() => new Date(2025, 1, 15));
    eventsResource.get = jest.fn(({ minDate }) => {
      return minDate == '2025-02-15' && Promise.resolve({
        data: [{
          title: 'Porão da Liga - ELEA8NOR',
          date: '2025-10-25',
          time: null,
          city: 'Joinville',
          state: 'SC',
          country: 'BR',
          url: 'https://www.instagram.com/poraodaliga/p/DQG-U0DDQLr/'
        }]
      });
    });
    rapidApiResource.getInstagramPosts = ({ username }) => {
      return username === 'poraodaliga' && Promise.resolve({ data: instagramPoraoDaLigaMock });
    };
    const imageInferenceMocks = [...googleAiPoraoDaLigaMock];
    googleAiResource.inferImageData = ({ prompt, imageUrl }) => {
      const data = imageInferenceMocks.shift();
      return prompt && imageUrl && Promise.resolve({ data });
    };
    const response = await start({ mode: 'vlm' });
    expect(eventsResource.bulkSave).toHaveBeenCalledWith([
      {
        title: 'Porão Da Liga - Em Pé Na Rede',
        slug: 'porao-da-liga-em-pe-na-rede-joinville-sc-20251106',
        date: '2025-11-06',
        time: '20:00',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.instagram.com/poraodaliga/p/DQKoU0bjYlV/',
        category: 'comedy',
        image: 'https://scontent.cdninstagram.com/v/t51.82787-15/570681184_18383968534181168_4843678019630848986_n.jpg?stp=dst-jpg_e35_p720x720_tt6&_nc_cat=105&ig_cache_key=Mzc0OTk4Njk5MjI4NjE3MzUyNQ%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjEzNTB4MTY4OC5zZHIuQzMifQ%3D%3D&_nc_ohc=VBhucAO3A3UQ7kNvwFY16dE&_nc_oc=AdkeiZQfUnLsHzPEjkthVkkLncIIt_W4DIZupVnVrSgPYbqDTxauSFbEteLHGqjqDi8&_nc_ad=z-m&_nc_cid=3511&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=inn9xxl7WLI4bhSaUP6WYQ&oh=00_AffCmTrPlzFzo91nJUz-4vZ24Txal2RTGWb2PFTUxxgdlA&oe=69019D68'
      },
      {
        title: 'Porão Da Liga - Luna Session',
        slug: 'porao-da-liga-luna-session-joinville-sc-20251205',
        date: '2025-12-05',
        time: '21:30',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.instagram.com/poraodaliga/p/DQKM1JVjcRv/',
        image: 'https://scontent.cdninstagram.com/v/t51.71878-15/568628682_1464491714638994_3360513472882390708_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=110&ig_cache_key=Mzc0OTg2NjA2ODQ1NTA0ODMwMw%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjY0MHgxMTM2LnNkci5DMyJ9&_nc_ohc=ruXvuDHYR0QQ7kNvwFQosww&_nc_oc=Adk9G77kjSy-iC9Hx0igPO8yUF2N1Sbb-AEW5pTMVPAdue-lzj0rLBjC1v91loB4JnU&_nc_ad=z-m&_nc_cid=3511&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=inn9xxl7WLI4bhSaUP6WYQ&oh=00_AfesvSsvErfaCmbWWADH8HdQJWU0bL_zVZQz7j-KasS81A&oe=69018A8E'
      },
      {
        title: 'Porão Da Liga - Billbird',
        slug: 'porao-da-liga-billbird-joinville-sc-20251024',
        date: '2025-10-24',
        time: null,
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.instagram.com/poraodaliga/p/DQG-U0DDQLr/',
        category: 'music',
        image: 'https://scontent.cdninstagram.com/v/t51.82787-15/569919988_18291886258260658_3184029433435846307_n.heic?stp=dst-jpg_e35_p720x720_tt6&_nc_cat=100&ig_cache_key=Mzc0ODk1Nzg0ODk5MTQ5ODk4Nw%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=i0xtAFn0s0QQ7kNvwHlGy3y&_nc_oc=AdlJi_lAMHYESBJj4monv9VUD_Wxf8SnUfA0iNNJp6pVltJNTtX-_q6Qw04oWPBx53Y&_nc_ad=z-m&_nc_cid=3511&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=inn9xxl7WLI4bhSaUP6WYQ&oh=00_AfesowsYX57RfR-pJfGJfNWZDpHLWMP1MIwvD8JNE5ImgA&oe=69018E96'
      },
      {
        title: 'Porão Da Liga - Vinyl Archive',
        slug: 'porao-da-liga-vinyl-archive-joinville-sc-20251115',
        date: '2025-11-15',
        time: '22:00',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.instagram.com/poraodaliga/p/DQCZOAsDkdY/',
        image: 'https://scontent.cdninstagram.com/v/t51.82787-15/565350356_18533401627056688_671384966620171138_n.heic?stp=dst-jpg_e35_p720x720_tt6&_nc_cat=108&ig_cache_key=Mzc0NzY2ODc1MzkwMDI1OTE2MA%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTgwMC5zZHIuQzMifQ%3D%3D&_nc_ohc=xE_6x97baxYQ7kNvwFuEIRv&_nc_oc=AdkVOc8KX7JxY9BEnY3zomxJ4vqteD_90ugykvS3eoWgZAnBPBaXAMZREm7WYXCWHdk&_nc_ad=z-m&_nc_cid=3511&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=inn9xxl7WLI4bhSaUP6WYQ&oh=00_AfegBSKe5m4NfRKNfPZ801vnXJ3jSzRmi9O-n0YI3EdwFA&oe=69018826'
      }
    ]);
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.bulkSave).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(buildExpectedPerformanceReport(['instagram-porao-da-liga']));
    expect(loggerService.track).not.toHaveBeenCalled();
  });

  it('should track error on crawl error', async () => {
    const err = 'some err';
    console.error = jest.fn();
    diskIngressosResource.get = jest.fn(() => Promise.reject(err));
    const response = await start();
    expect(loggerService.track).toHaveBeenCalledWith('Task Failed - Crawling: disk-ingressos', err, {
      task_duration: expect.any(Number)
    });
    expect(loggerService.track).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(buildExpectedPerformanceReport([
      'disk-ingressos',
      'blueticket',
      'tockify',
      'eticket-center',
      'songkick',
      'pensa-no-evento',
      'ingresso'
    ], { errors: ['disk-ingressos'] }));
  });

  it('should track error on event multi-save error', async () => {
    let multiSaveCalls = 0;
    const err = 'some err';
    console.error = jest.fn();
    eventService.multiSave = jest.fn(() => {
      ++multiSaveCalls;
      return multiSaveCalls === 1 ? Promise.reject(err) : Promise.resolve({});
    });
    const response = await start();
    expect(loggerService.track).toHaveBeenCalledWith('Task Failed - Crawling: blueticket', err, {
      task_duration: expect.any(Number)
    });
    expect(loggerService.track).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(buildExpectedPerformanceReport(DEFAULT_CRAWLERS, { errors: ['blueticket'] }));
  });
});
