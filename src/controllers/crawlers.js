const { CRAWL_ERROR, EVENTS_MULTI_SAVE_ERROR } = require('../constants/eventNames');
const eventService = require('../services/event');
const loggerService = require('../services/logger');
const blueticketCrawler = require('../crawlers/blueticket');
const diskIngressosCrawler = require('../crawlers/disk-ingressos');
const eticketCenterCrawler = require('../crawlers/eticket-center');
const instagramPoraoDaLigaCrawler = require('../crawlers/instagram-porao-da-liga');
const pensaNoEventoCrawler = require('../crawlers/pensa-no-evento');
const songkickCrawler = require('../crawlers/songkick');
const symplaCrawler = require('../crawlers/sympla');
const tockifyCrawler = require('../crawlers/tockify');
const ingressoCrawler = require('../crawlers/ingresso');

const _public = {};

_public.start = async (req, res) => {
  const { mode } = req.body;
  return new Promise(resolve => {
    const crawlers = getCrawlers(mode);
    const { onCrawlSuccess, onCrawlError } = useCompleter(crawlers, { startTime: Date.now(), resolve });
    crawlers.forEach(({ name, crawl }) => {
      const crawlerStartTime = Date.now();
      crawl().then(events => {
        onCrawlSuccess(events, { crawlerName: name, mode, crawlerStartTime });
      }).catch(err => {
        onCrawlError(err, { crawlerName: name, mode, crawlerStartTime });
      });
    });
  }).then(stats => res.status(200).send(stats));
};

function getCrawlers(mode){
  return {
    'vlm': [
      { name: 'instagram-porao-da-liga', crawl: instagramPoraoDaLigaCrawler.crawl }
    ],
    'sympla': [
      { name: 'sympla', crawl: symplaCrawler.crawl }
    ]
  }[mode] || getDefaultCrawlers();
}

function getDefaultCrawlers(){
  return [
    { name: 'blueticket', crawl: blueticketCrawler.crawl },
    { name: 'disk-ingressos', crawl: diskIngressosCrawler.crawl },
    { name: 'eticket-center', crawl: eticketCenterCrawler.crawl },
    { name: 'pensa-no-evento', crawl: pensaNoEventoCrawler.crawl },
    { name: 'songkick', crawl: songkickCrawler.crawl },
    { name: 'tockify', crawl: tockifyCrawler.crawl },
    { name: 'ingresso', crawl: ingressoCrawler.crawl }
  ];
}

function useCompleter(crawlers, { startTime, resolve }){
  const completed = [];
  const onComplete = ({ response, isError }) => {
    completed.push({ response, isError });
    completed.length === crawlers.length && resolve(buildStats(completed, startTime));
  };
  const onCrawlSuccess = (events, context) => {
    eventService.multiSave(events).then(response => {
      onComplete({ response, isError: false });
    }).catch(err => {
      loggerService.track(EVENTS_MULTI_SAVE_ERROR, err, buildTrackingMetadata({ ...context, stage: 'save', totalEvents: events.length }));
      onComplete({ response: err, isError: true });
    });
  };
  const onCrawlError = (err, context) => {
    loggerService.track(CRAWL_ERROR, err, buildTrackingMetadata({ ...context, stage: 'crawl' }));
    onComplete({ response: err, isError: true });
  };
  return { onCrawlSuccess, onCrawlError };
}

function buildTrackingMetadata({ crawlerName, mode, stage, crawlerStartTime, totalEvents }){
  return {
    crawler_name: crawlerName,
    crawler_mode: mode || 'regular',
    crawler_stage: stage,
    crawler_processing_time: Date.now() - crawlerStartTime,
    crawler_total_events: totalEvents
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
