const delayService = require('../services/delay');
const eventService = require('../services/event');
const loggerService = require('../services/logger');
const vlmService = require('../services/vlm');
const blueticketCrawler = require('../crawlers/blueticket');
const diskIngressosCrawler = require('../crawlers/disk-ingressos');
const eticketCenterCrawler = require('../crawlers/eticket-center');
const instagramPoraoDaLigaCrawler = require('../crawlers/instagram-porao-da-liga');
const songkickCrawler = require('../crawlers/songkick');
const symplaCrawler = require('../crawlers/sympla');
const tockifyCrawler = require('../crawlers/tockify');

const _public = {};

_public.start = async (req, res) => {
  const { mode } = req.body;
  if(mode == await 'vlm-warm-up') {
    return await handleVlmWarmUp(res);
  }
  return new Promise(resolve => {
    const crawlers = getCrawlers(mode);
    const { onCrawlSuccess, onCrawlError } = useCompleter(crawlers, { startTime: Date.now(), resolve });
    crawlers.forEach(({ crawl }) => crawl().then(onCrawlSuccess).catch(onCrawlError));
  }).then(stats => res.status(200).send(stats));
};

async function handleVlmWarmUp(res){
  vlmService.warmUp();
  await delayService.pause(5000);
  res.status(204).send();
}

function getCrawlers(mode){
  const regular = [
    diskIngressosCrawler,
    eticketCenterCrawler,
    blueticketCrawler,
    songkickCrawler,
    symplaCrawler,
    tockifyCrawler
  ];
  const vlms = [
    instagramPoraoDaLigaCrawler
  ];
  return mode == 'vlm' ? vlms : regular;
}

function useCompleter(crawlers, { startTime, resolve }){
  const completed = [];
  const onComplete = (response, { isError } = {}) => {
    completed.push({ ...response, isError });
    if(isError) loggerService.track(response);
    completed.length === crawlers.length && resolve(buildStats(completed, startTime));
  };
  const onCrawlSuccess = events => eventService.multiSave(events).then(onComplete).catch(err => onComplete(err, { isError: true }));
  const onCrawlError = err => onComplete(err, { isError: true });
  return { onCrawlSuccess, onCrawlError };
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
