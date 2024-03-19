const eventService = require('../services/event');
const loggerService = require('../services/logger');
const blueticketCrawler = require('../crawlers/blueticket');
const diskIngressosCrawler = require('../crawlers/disk-ingressos');
const eticketCenterCrawler = require('../crawlers/eticket-center');
const songkickCrawler = require('../crawlers/songkick');
const symplaCrawler = require('../crawlers/sympla');

const _public = {};

_public.start = (req, res) => {
  return new Promise(resolve => {
    const crawlers = getCrawlers();
    const { onCrawlSuccess, onCrawlError } = useCompleter(crawlers, { startTime: Date.now(), resolve });
    crawlers.forEach(({ crawl }) => crawl().then(onCrawlSuccess).catch(onCrawlError));
  }).then(stats => res.status(200).send(stats));
};

function getCrawlers(){
  return [
    diskIngressosCrawler,
    eticketCenterCrawler,
    blueticketCrawler,
    songkickCrawler,
    symplaCrawler
  ];
}

function useCompleter(crawlers, { startTime, resolve }){
  const completed = [];
  const onComplete = response => {
    completed.push(response);
    if(response.err) loggerService.track(response.err);
    completed.length === crawlers.length && resolve(buildStats(completed, startTime));
  };
  const onCrawlSuccess = events => eventService.multiSave(events).then(onComplete).catch(onComplete);
  const onCrawlError = err => onComplete({ err, isError: true });
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
