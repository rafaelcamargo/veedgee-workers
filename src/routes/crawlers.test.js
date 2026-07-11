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

describe('Crawlers Routes', () => {
  async function start(payload){
    return await serve().post('/crawlers').set({ vwtoken: 'vee456' }).send(payload);
  }

  function findReportedTaskByName(report, taskName){
    return report.find(({ task }) => task === taskName);
  }

  beforeEach(() => {
    dateService.getNow = jest.fn(() => new Date(2024, 1, 15));
    blueticketResource.get = jest.fn(() => Promise.resolve({}));
    blueticketResource.getEventDetails = jest.fn(eventCode => {
      const data = {
        33937: require('../mocks/blueticket-event-details.json')
      }[eventCode] || {};
      return Promise.resolve({ data });
    });
    eticketCenterResource.get = jest.fn(() => Promise.resolve({ data: getMockedFile('eticket-center-empty.html') }));
    eticketCenterResource.getEventDetailsPage = jest.fn(url => {
      const data = {
        'https://www.eticketcenter.com.br/eventos/show/elvis-experience-com-dean-z-em-joinville/29-02/21-00/':
          getMockedFile('eticket-center-event-detail.html')
      }[url] || '';
      return Promise.resolve({ data });
    });
    diskIngressosResource.get = jest.fn(() => Promise.resolve({ data: {} }));
    eventsResource.get = jest.fn(({ minDate }) => {
      const data = eventsMock.filter(event => event.date >= minDate);
      return Promise.resolve({ data });
    });
    eventsResource.bulkSave = jest.fn(events => Promise.resolve({ data: { count: events.length } }));
    loggerService.track = jest.fn();
    pensaNoEventoResource.get = jest.fn(() => Promise.resolve({ data: {} }));
    pensaNoEventoResource.getEventDetailsPage = jest.fn(url => {
      const data = {
        'https://www.pensanoevento.com.br/sitev2/eventos/96401/sextou-na-casinha':
          getMockedFile('pensa-no-evento-details.html')
      }[url] || '';
      return Promise.resolve({ data });
    });
    songkickResource.get = jest.fn(() => Promise.resolve({ data: getMockedFile('songkick-empty.html') }));
    songkickResource.getEventDetailsPage = jest.fn(url => {
      const data = {
        'https://www.songkick.com/pt/concerts/41724580-di-ferrero-at-teatro-carlos-gomes':
          getMockedFile('songkick-event-details.html')
      }[url] || '';
      return Promise.resolve({ data });
    });
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
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.diskingressos.com.br/evento/6155/01-03-2024/sc/joinville/the-beast-experience',
        image: 'https://genesisapi.diskingressos.com.br/images/cache/events/6155.webp',
        category: 'music',
        description: 'The Beast Experience - Iron Maiden Cover\\r\\nFormada em Maio de 2023 com o propósito de elevar a experiência do público em um show de uma banda cover, a banda formada por Raphael Mendes, Eric Claros, Guilherme Spilack, Pedro Migliacci, Danilo Bellintani e Vinícius Barbosa juntou a experiência de músicos já conhecidos em seus antigos trabalhos tributo ao Iron Maiden para este objetivo.\\r\\nO projeto tem performances teatrais inspiradas na banda original, diferentes cenários e figurinos, e os integrantes apresentam instrumentos iguais aos de seus mestres, executando com ótima musicalidade um repertório bastante abrangente do Iron Maiden com 3 guitarristas!\\r\\nE com essa mistura de experiência, talento e notoriedade no meio digital e musical formou-se o projeto \'The Beast Experience - Ultimate Iron Maiden Tribute\'.'
      },
      {
        title: 'Dhouse Apresenta – \"Orgulho Do Papai\" Com Giovana Fagundes',
        slug: 'dhouse-apresenta-orgulho-do-papai-com-giovana-fagundes-curitiba-pr-20240306',
        date: '2024-03-06',
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
        city: 'Florianópolis',
        state: 'SC',
        country: 'BR',
        url: 'https://www.diskingressos.com.br/evento/6212/09-03-2024/sc/florianopolis/chico-cesar-zeca-baleiro',
        image: 'https://genesisapi.diskingressos.com.br/images/cache/events/6212.webp',
        category: 'music',
        description: '‘Ao Arrepio da Lei’,\nálbum de inéditas de Chico César e Zeca Baleiro\nUma nova safra de mais de 20 canções marcou a retomada da parceria inaugurada há mais de 30 anos por Chico César e Zeca Baleiro. Animados pelo resultado das novas parcerias musicais, anunciaram o lançamento de um álbum, antecipando duas canções, “Respira” e “Lovers”, em maio de 2021. Com tantos trabalhos em paralelo, Chico e Zeca só retomaram as gravações em 2022, quando lançaram novo single duplo com as inéditas “Verão” e “Beije-me Antes”, e finalizaram o álbum no final de 2023.\n“Ao Arrepio da Lei” é o nome do álbum que Chico César e Zeca Baleiro lançam em março de 2024, quando também iniciam uma turnê por algumas das principais cidades e capitais do país. No repertório do show, as novas parcerias, sucessos de ambos e canções que fazem parte da memória afetiva dos dois artistas.\nQuando os shows e gravações pararam por conta da pandemia, Chico César e Zeca Baleiro começaram a compor bastante juntos. Entre maio de 2020'
      },
      {
        title: 'Dhouse Apresenta – 40 + Com Eduardo Jericó',
        slug: 'dhouse-apresenta-40-com-eduardo-jerico-curitiba-pr-20240309',
        date: '2024-03-09',
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
        city: 'Curitiba',
        state: 'PR',
        country: 'BR',
        url: 'https://www.diskingressos.com.br/evento/6468/11-03-2024/pr/curitiba/1-encontro-aaonca',
        image: 'https://genesisapi.diskingressos.com.br/images/cache/events/6468.webp',
        category: 'festivals',
        description: 'Dia 11 de março, segunda feira a partir das 19h, no Bar do Alemão ocorrerá o evento \'Ação entre amigos da onça\'.O objetivo é arrecadar fundos para a Aaonça, Associação dos amigos da  onça com finalidade de ajudar a \'carne de onça\' se tornar indicação Geográfica de Curitiba.\\r\\nO ingresso da direito a um \' submarino \' sendo que a canequinha do Steinhaeger poderá ser levada para casa.\\r\\nServiço:\\r\\nPrimeiro Encontro Aaonça, ação entre amigos11 de março a partir das 19h.Bar do Alemão Rua Dr Claudino dos Santos, 63, São Francisco.'
      },
      {
        title: 'Palestra Com Zico',
        slug: 'palestra-com-zico-porto-alegre-rs-20240409',
        date: '2024-04-09',
        city: 'Porto Alegre',
        state: 'RS',
        country: 'BR',
        url: 'https://www.diskingressos.com.br/evento/6211/09-04-2024/rs/porto-alegre/palestra-com-zico',
        image: 'https://genesisapi.diskingressos.com.br/images/cache/events/6211.webp',
        category: 'education',
        description: '\\r\\nPalestra: LIDERANÇA & FORMAÇÃO DE EQUIPE EM 2024.'
      },
      {
        title: 'Yamandu Costa',
        slug: 'yamandu-costa-curitiba-pr-20240502',
        date: '2024-05-02',
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
    const taskName = 'Crawling: disk-ingressos';
    const reportedTask = findReportedTaskByName(response.body.reportJson, taskName);
    expect(reportedTask).toEqual({
      task: taskName,
      result: 'success',
      time: expect.any(Number)
    });
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
        category: 'music',
        description: 'O espetaculo musical "Aventura Congelante, O Legado", traz ao públicotodo o legado construído pelas irmãs Elsa e Anna durante os anos. Com aajuda de dois contadores de história, conheceremos de perto tudo o queaconteceu com Anna e Elsa desde que elas eram pequenas. Em cerca de 1hora e 10 minutos temos toda a história de Frozen e Frozen II contada ecantada ao vivo! A história, que já envolveu toda uma geração, traz seusprincipais personagens vivenciando novamente toda uma aventura quecomeça em Arendelle, passa pela floresta encantada e promete mudar odestino de todos pra sempre.Além do experiente elenco que atua, dança e canta nesse lindo espetáculo100% cantado ao vivo, o espetáculo conta com direção geral do renomadodiretor Bruno Rizzo, direção executiva de Daniela Schiarreta e direçãoresidente de Ewerton Novaes.Kids, TicketCenter'
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
    const taskName = 'Crawling: eticket-center';
    const reportedTask = findReportedTaskByName(response.body.reportJson, taskName);
    expect(reportedTask).toEqual({
      task: taskName,
      result: 'success',
      time: expect.any(Number)
    });
    const imagesTaskName = 'Crawling: eticket-center (descriptions)';
    const reportedImagesTask = findReportedTaskByName(response.body.reportJson, imagesTaskName);
    expect(reportedImagesTask).toEqual({
      task: imagesTaskName,
      result: 'success',
      time: expect.any(Number)
    });
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
      category: 'music',
      description: 'ESPETÁCULO ELVIS & ABBAPrepare-se para um Espetáculo Histórico!Será uma fantástica viagem aos anos 50, 60 e 70. Um encontro épico, de dois grandes tributos da Argentina, considerados os melhores do gênero, que irão interpretar os sucessos do #Abba e #ElvisPresley. Quem abre a noite é o tributo ABBA da Argentina, que irá interpretar os clássicos marcantes da Agnetha Fältskog, Anni-Frid Lyngstad, Björn Ulvaeus e Benny Andersson. A performance inclui figurinos e coreografias, em perfeita harmonia vocal e instrumental, recriada do original ABBA. Em seguida, quem sobe ao palco é o sensacional cover/tributo ao ELVIS PRESLEY da Argentina, com figurinos marcantes e fiéis, backing vocalsAo vivo e harmonia instrumental, representando em grande estilo os maiores clássicos do ícone Elvis Presley. Um espetáculo de arrepiar e uma emocionante viagem no tempo, através da obra e da genialidade do grupo ABBA e do ícone ELVIS PRESLEY. Você vai cantar e se emocionar com 2 shows épicos, com a banda Los Kal'
    }]);
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.bulkSave).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    const taskName = 'Crawling: blueticket';
    const reportedTask = findReportedTaskByName(response.body.reportJson, taskName);
    expect(reportedTask).toEqual({
      task: taskName,
      result: 'success',
      time: expect.any(Number)
    });
    const descriptionsTaskName = 'Crawling: blueticket (descriptions)';
    const reportedDescriptionsTask = findReportedTaskByName(response.body.reportJson, descriptionsTaskName);
    expect(reportedDescriptionsTask).toEqual({
      task: descriptionsTaskName,
      result: 'success',
      time: expect.any(Number)
    });
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
    const taskName = 'Crawling: sympla';
    const reportedTask = findReportedTaskByName(response.body.reportJson, taskName);
    expect(reportedTask).toEqual({
      task: taskName,
      result: 'success',
      time: expect.any(Number)
    });
    expect(loggerService.track).not.toHaveBeenCalled();
  });

  it('should not save sympla events if no sympla events were found', async () => {
    symplaResource.get = jest.fn(() => Promise.resolve({}));
    const response = await start({ mode: 'sympla' });
    expect(eventsResource.bulkSave).not.toHaveBeenCalled();
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
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
        image: 'http://images.sk-static.com/images/media/img/col6/20190924-232916-534771.jpg',
        description: 'Compre ingressos para ver kamaitachi ao vivo em Florianópolis. Acompanhe seus artistas favoritos no Songkick e nunca perca outro show.',
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
        category: 'music'
      }
    ]);
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.bulkSave).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    const taskName = 'Crawling: songkick';
    const reportedTask = findReportedTaskByName(response.body.reportJson, taskName);
    expect(reportedTask).toEqual({
      task: taskName,
      result: 'success',
      time: expect.any(Number)
    });
    const descriptionsTaskName = 'Crawling: songkick (descriptions)';
    const reportedDescriptionsTask = findReportedTaskByName(response.body.reportJson, descriptionsTaskName);
    expect(reportedDescriptionsTask).toEqual({
      task: descriptionsTaskName,
      result: 'success',
      time: expect.any(Number)
    });
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
        image: 'https://d3flpus5evl89n.cloudfront.net/635fddd3c287a829555e8da5/6a455588892b27f8db966a91/scaled_1024.jpg',
        description: 'Venha prestigiar a Feira EcoSol Dona Francisca! Um espaço onde os visitantes encontram itens de variados segmentos, como artesanato, cultura, manualidades, moda'
      },
      {
        title: 'Artista Denise Schlickmann Faz Oficina Gratuita No Garten Shopping',
        slug: 'artista-denise-schlickmann-faz-oficina-gratuita-no-garten-shopping-joinville-sc-20260709',
        date: '2026-07-09',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://tockify.com/eventosemjoinville/detail/4224/1783612800000',
        image: 'https://d3flpus5evl89n.cloudfront.net/635fddd3c287a829555e8da5/6a4fc91f892b27f8db313eb8/scaled_896.jpg',
        description: 'Artista Denise Schlickmann faz oficina gratuita no Garten Shopping Atividade será realizada neste sábado, na Galeria Garten, com vagas limitadas e material incl'
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
        url: 'https://tockify.com/eventosemjoinville/detail/4301/1783711800000',
        description: 'Apresentação teatral infantil gratuita inspirada na obra de Antoine de Saint-Exupéry, com duração de 50 minutos e entrada liberada mediante retirada de senhas.'
      }
    ]);
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.bulkSave).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    const taskName = 'Crawling: tockify';
    const reportedTask = findReportedTaskByName(response.body.reportJson, taskName);
    expect(reportedTask).toEqual({
      task: taskName,
      result: 'success',
      time: expect.any(Number)
    });
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
        image: 'https://files.pensanoevento.com.br/images/eventos/69aed1ac1bb6c_capa.webp',
        description: 'TOCA DA RAPOSA! No dia 12 de Julho (Domingo) As raposas se encontram aqui no Barzin Rj A partir das 14h, muito pagode, funk, gastronomia e drinks pra...'
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
    const taskName = 'Crawling: pensa-no-evento';
    const reportedTask = findReportedTaskByName(response.body.reportJson, taskName);
    expect(reportedTask).toEqual({
      task: taskName,
      result: 'success',
      time: expect.any(Number)
    });
    const descriptionsTaskName = 'Crawling: pensa-no-evento (descriptions)';
    const reportedDescriptionsTask = findReportedTaskByName(response.body.reportJson, descriptionsTaskName);
    expect(reportedDescriptionsTask).toEqual({
      task: descriptionsTaskName,
      result: 'success',
      time: expect.any(Number)
    });
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
        category: 'movies',
        description: 'Após o fenômeno global de Homem-Aranha: Sem Volta Para Casa, Homem-Aranha: Um Novo Dia marca um capítulo totalmente novo para Peter Parker e o Homem-Aranha. Quatro anos se passaram desde os eventos de Sem Volta Para Casa, e Peter agora é um adulto vivendo completamente sozinho, tendo se apagado voluntariamente da vida e das memórias de quem ama. Combatendo o crime em uma Nova York que já não sabe mais o seu nome, ele se dedica integralmente a proteger a cidade — um Homem-Aranha em tempo integral —, mas, à medida que as exigências aumentam, a pressão desencadeia uma surpreendente evolução física que ameaça sua própria existência, enquanto um estranho padrão de crimes dá origem a uma das ameaças mais poderosas que ele já enfrentou. '
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
        category: 'movies',
        description: 'Buzz, Woody, Jessie e os demais brinquedos tradicionais são desafiados pela nova obsessão das crianças do século XXI: os dispositivos eletrônicos.'
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
        category: 'movies',
        description: 'A trama de DIA D explorará a existência de alienígenas, mostrando como essa descoberta irá afetar as pessoas ao redor do mundo em nossa sociedade atual.'
      }
    ]);
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.bulkSave).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    const taskName = 'Crawling: ingresso';
    const reportedTask = findReportedTaskByName(response.body.reportJson, taskName);
    expect(reportedTask).toEqual({
      task: taskName,
      result: 'success',
      time: expect.any(Number)
    });
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
        image: 'https://scontent.cdninstagram.com/v/t51.82787-15/570681184_18383968534181168_4843678019630848986_n.jpg?stp=dst-jpg_e35_p720x720_tt6&_nc_cat=105&ig_cache_key=Mzc0OTk4Njk5MjI4NjE3MzUyNQ%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjEzNTB4MTY4OC5zZHIuQzMifQ%3D%3D&_nc_ohc=VBhucAO3A3UQ7kNvwFY16dE&_nc_oc=AdkeiZQfUnLsHzPEjkthVkkLncIIt_W4DIZupVnVrSgPYbqDTxauSFbEteLHGqjqDi8&_nc_ad=z-m&_nc_cid=3511&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=inn9xxl7WLI4bhSaUP6WYQ&oh=00_AffCmTrPlzFzo91nJUz-4vZ24Txal2RTGWb2PFTUxxgdlA&oe=69019D68',
        description: '🚨 VENDAS LIBERADAS, JOINVILLE 🚨\n\nO Em Pé na Rede chega pra transformar a cidade em uma noite de risadas sem limites! 🔥\n\nCom quadros como “Fazendo Amizade” e “Comentando Histórias”, interação com a plateia e muito improviso, Victor, Osmar e Rominho prometem gargalhadas do começo ao fim! 😂🎤\n\n🎟️ O riso tá garantido… e o ingresso? Corre pra garantir o seu!\n\nSeguidor da Canesso Produções tem ingresso especial com 50% de desconto! ❤️\n\n🔗 Ingressos e maiores informações diretamente no site da Canesso Produções (link na bio)'
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
        image: 'https://scontent.cdninstagram.com/v/t51.71878-15/568628682_1464491714638994_3360513472882390708_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=110&ig_cache_key=Mzc0OTg2NjA2ODQ1NTA0ODMwMw%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjY0MHgxMTM2LnNkci5DMyJ9&_nc_ohc=ruXvuDHYR0QQ7kNvwFQosww&_nc_oc=Adk9G77kjSy-iC9Hx0igPO8yUF2N1Sbb-AEW5pTMVPAdue-lzj0rLBjC1v91loB4JnU&_nc_ad=z-m&_nc_cid=3511&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=inn9xxl7WLI4bhSaUP6WYQ&oh=00_AfesvSsvErfaCmbWWADH8HdQJWU0bL_zVZQz7j-KasS81A&oe=69018A8E',
        description: 'Prepare sua fantasia para o melhor Halloween de Joinville.\n\n#halloween \n#festa \n#shows \n#poraodaliga \n#rocknroll \n#anos80'
      },
      {
        title: 'Porão Da Liga - Billbird',
        slug: 'porao-da-liga-billbird-joinville-sc-20251024',
        date: '2025-10-24',
        city: 'Joinville',
        state: 'SC',
        country: 'BR',
        url: 'https://www.instagram.com/poraodaliga/p/DQG-U0DDQLr/',
        category: 'music',
        image: 'https://scontent.cdninstagram.com/v/t51.82787-15/569919988_18291886258260658_3184029433435846307_n.heic?stp=dst-jpg_e35_p720x720_tt6&_nc_cat=100&ig_cache_key=Mzc0ODk1Nzg0ODk5MTQ5ODk4Nw%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=i0xtAFn0s0QQ7kNvwHlGy3y&_nc_oc=AdlJi_lAMHYESBJj4monv9VUD_Wxf8SnUfA0iNNJp6pVltJNTtX-_q6Qw04oWPBx53Y&_nc_ad=z-m&_nc_cid=3511&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=inn9xxl7WLI4bhSaUP6WYQ&oh=00_AfesowsYX57RfR-pJfGJfNWZDpHLWMP1MIwvD8JNE5ImgA&oe=69018E96',
        description: 'Fim de semana com 2 super bandas no Porão da Liga.'
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
        image: 'https://scontent.cdninstagram.com/v/t51.82787-15/565350356_18533401627056688_671384966620171138_n.heic?stp=dst-jpg_e35_p720x720_tt6&_nc_cat=108&ig_cache_key=Mzc0NzY2ODc1MzkwMDI1OTE2MA%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTgwMC5zZHIuQzMifQ%3D%3D&_nc_ohc=xE_6x97baxYQ7kNvwFuEIRv&_nc_oc=AdkVOc8KX7JxY9BEnY3zomxJ4vqteD_90ugykvS3eoWgZAnBPBaXAMZREm7WYXCWHdk&_nc_ad=z-m&_nc_cid=3511&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=inn9xxl7WLI4bhSaUP6WYQ&oh=00_AfegBSKe5m4NfRKNfPZ801vnXJ3jSzRmi9O-n0YI3EdwFA&oe=69018826',
        description: '@estebantavares em tour pelo sul do país\n\n23/10 JOINVILLE/SC @poraodaliga \n24/10 BLUMENAU/SC @ahoyblumenau \n25/10 CURITIBA/PR @arnicacultural \n26/10 PONTA GROSSA/PR @capivarasrockbar \n\nIngressos disponíveis online na Sympla, link na Bio.'
      }
    ]);
    expect(eventsResource.get).toHaveBeenCalledTimes(1);
    expect(eventsResource.bulkSave).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    const taskName = 'Crawling: instagram-porao-da-liga';
    const reportedTask = findReportedTaskByName(response.body.reportJson, taskName);
    expect(reportedTask).toEqual({
      task: taskName,
      result: 'success',
      time: expect.any(Number)
    });
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
    const taskName = 'Crawling: disk-ingressos';
    const reportedTask = findReportedTaskByName(response.body.reportJson, taskName);
    expect(reportedTask).toEqual({
      task: taskName,
      result: 'error',
      time: expect.any(Number)
    });
  });

  it('should track error on crawling event descriptions', async () => {
    const err = 'some err';
    console.error = jest.fn();
    blueticketResource.get = jest.fn(params => {
      const data = params.categoria === 11 && blueticketMock;
      return Promise.resolve({ data });
    });
    blueticketResource.getEventDetails = jest.fn(() => Promise.reject(err));
    eticketCenterResource.get = jest.fn(({ Pagina }) => {
      return Promise.resolve({ data: getMockedFile(`eticket-center-${Pagina}.html`) });
    });
    eticketCenterResource.getEventDetailsPage = jest.fn(() => Promise.reject(err));
    pensaNoEventoResource.get = jest.fn(({ cityCode }) => {
      const data = { 19: pensaNoEventoJoinvilleMock, 32: pensaNoEventoCuritibaMock }[cityCode];
      return Promise.resolve({ data });
    });
    pensaNoEventoResource.getEventDetailsPage = jest.fn(() => Promise.reject(err));
    songkickResource.get = jest.fn(({ city, page }) => {
      return Promise.resolve({ data: getMockedFile(`songkick-${city}-page-${page}.html`) });
    });
    songkickResource.getEventDetailsPage = jest.fn(() => Promise.reject(err));
    const response = await start();
    expect(loggerService.track).toHaveBeenCalledWith('Task Failed - Crawling: eticket-center (descriptions)', err, {
      task_duration: expect.any(Number)
    });
    expect(loggerService.track).toHaveBeenCalledWith('Task Failed - Crawling: blueticket (descriptions)', err, {
      task_duration: expect.any(Number)
    });
    expect(loggerService.track).toHaveBeenCalledWith('Task Failed - Crawling: pensa-no-evento (descriptions)', err, {
      task_duration: expect.any(Number)
    });
    expect(loggerService.track).toHaveBeenCalledWith('Task Failed - Crawling: songkick (descriptions)', err, {
      task_duration: expect.any(Number)
    });
    expect(loggerService.track).toHaveBeenCalledTimes(4);
    expect(response.status).toEqual(200);
    const eticketTaskName = 'Crawling: eticket-center (descriptions)';
    const eticketReportedTask = findReportedTaskByName(response.body.reportJson, eticketTaskName);
    expect(eticketReportedTask).toEqual({
      task: eticketTaskName,
      result: 'error',
      time: expect.any(Number)
    });
    const blueticketTaskName = 'Crawling: blueticket (descriptions)';
    const blueticketReportedTask = findReportedTaskByName(response.body.reportJson, blueticketTaskName);
    expect(blueticketReportedTask).toEqual({
      task: blueticketTaskName,
      result: 'error',
      time: expect.any(Number)
    });
    const pensaTaskName = 'Crawling: pensa-no-evento (descriptions)';
    const pensaReportedTask = findReportedTaskByName(response.body.reportJson, pensaTaskName);
    expect(pensaReportedTask).toEqual({
      task: pensaTaskName,
      result: 'error',
      time: expect.any(Number)
    });
    const songkickTaskName = 'Crawling: songkick (descriptions)';
    const songkickReportedTask = findReportedTaskByName(response.body.reportJson, songkickTaskName);
    expect(songkickReportedTask).toEqual({
      task: songkickTaskName,
      result: 'error',
      time: expect.any(Number)
    });
  });

  it('should track error on event multi-save error', async () => {
    const err = 'some err';
    console.error = jest.fn();
    blueticketResource.get = jest.fn(params => {
      const data = params.categoria === 11 && blueticketMock;
      return Promise.resolve({ data });
    });
    eventService.multiSave = jest.fn(events => {
      if (events.some(({ url }) => url.includes('blueticket.com.br'))) {
        return Promise.reject(err);
      }
      return Promise.resolve({});
    });
    const response = await start();
    expect(loggerService.track).toHaveBeenCalledWith('Task Failed - Crawling: blueticket', err, {
      task_duration: expect.any(Number)
    });
    expect(loggerService.track).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    const taskName = 'Crawling: blueticket';
    const reportedTask = findReportedTaskByName(response.body.reportJson, taskName);
    expect(reportedTask).toEqual({
      task: taskName,
      result: 'error',
      time: expect.any(Number)
    });
  });
});
