const delayService = require('../services/delay');
const eventService = require('../services/event');
const loggerService = require('../services/logger');
const vlmService = require('../services/vlm');
const blueticketCrawler = require('../crawlers/blueticket');
const diskIngressosCrawler = require('../crawlers/disk-ingressos');
const eticketCenterCrawler = require('../crawlers/eticket-center');
const instagramPoraoDaLigaCrawler = require('../crawlers/instagram-porao-da-liga');
const pensaNoEventoCrawler = require('../crawlers/pensa-no-evento');
const songkickCrawler = require('../crawlers/songkick');
const symplaCrawler = require('../crawlers/sympla');
const tockifyCrawler = require('../crawlers/tockify');

const _public = {};

_public.start = async (req, res) => {
  const { mode } = req.body;
  if(mode == 'vlm-warm-up') {
    return await handleVlmWarmUp(res);
  }
  return new Promise(resolve => {
    const crawlers = getCrawlers(mode);
    const { onCrawlSuccess, onCrawlError } = useCompleter(crawlers, { startTime: Date.now(), resolve });
    crawlers.forEach(({ name, crawl }) => {
      const crawlerStartTime = Date.now();
      crawl().then(events => {
        loggerService.track('Crawler completed', {
          type: 'info',
          ...buildTrackingMetadata({ crawlerName: name, mode, stage: 'crawl', crawlerStartTime, eventsCount: events.length })
        });
        onCrawlSuccess(events, { crawlerName: name, mode, crawlerStartTime });
      }).catch(err => {
        onCrawlError(err, { crawlerName: name, mode, crawlerStartTime });
      });
    });
  }).then(stats => res.status(200).send(stats));
};

async function handleVlmWarmUp(res){
  vlmService.warmUp();
  await delayService.pause(1500);
  res.status(204).send();
}

function getCrawlers(mode){
  const regular = [
    { name: 'blueticket', crawl: blueticketCrawler.crawl },
    { name: 'disk-ingressos', crawl: diskIngressosCrawler.crawl },
    { name: 'eticket-center', crawl: eticketCenterCrawler.crawl },
    { name: 'pensa-no-evento', crawl: pensaNoEventoCrawler.crawl },
    { name: 'songkick', crawl: songkickCrawler.crawl },
    { name: 'sympla', crawl: symplaCrawler.crawl },
    { name: 'tockify', crawl: tockifyCrawler.crawl }
  ];
  const vlms = [
    { name: 'instagram-porao-da-liga', crawl: instagramPoraoDaLigaCrawler.crawl }
  ];
  return mode == 'vlm' ? vlms : regular;
}

function useCompleter(crawlers, { startTime, resolve }){
  const completed = [];
  const onComplete = ({ response, isError }) => {
    completed.push({ response, isError });
    completed.length === crawlers.length && resolve(buildStats(completed, startTime));
  };
  const onCrawlSuccess = (events, context) => {
    const metadata = buildTrackingMetadata({ ...context, stage: 'save', eventsCount: events.length });
    eventService.multiSave(events).then(response => {
      loggerService.track('Events Multi Save Success', { type: 'info', ...metadata });
      onComplete({ response, isError: false });
    }).catch(err => {
      loggerService.track('Events Multi Save Error', { type: 'error', error: err, ...metadata });
      onComplete({ response: err, isError: true });
    });
  };
  const onCrawlError = (err, context) => {
    loggerService.track('Crawl Error', {
      type: 'error',
      error: err,
      ...buildTrackingMetadata({ ...context, stage: 'crawl' })
    });
    onComplete({ response: err, isError: true });
  };
  return { onCrawlSuccess, onCrawlError };
}

function buildTrackingMetadata({ crawlerName, mode, stage, crawlerStartTime, eventsCount }){
  return {
    crawler: {
      name: crawlerName,
      mode: mode || 'regular',
      stage,
      durationMs: Date.now() - crawlerStartTime,
      eventsCount
    }
  };
}

function buildStats(completed, startTime){
  return {
    duration: Date.now() - startTime,
    successes: getCompletionTypeCount(completed, 'success'),
    failures: getCompletionTypeCount(completed, 'failure')
  };
}

function getCompletionTypeCount(completed, type){
  return completed.filter(data => type == 'success' ? !data.isError : data.isError).length;
}

module.exports = _public;
