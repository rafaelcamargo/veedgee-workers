const eventsService = require('../services/event');
const diskIngressosCrawler = require('../crawlers/disk-ingressos');

const _public = {};

_public.start = (req, res) => {
  return new Promise(resolve => {
    const crawlers = getCrawlers();
    const { onCrawlSuccess, onCrawlError } = useCompleter(crawlers, { startTime: Date.now(), resolve });
    crawlers.forEach(({ crawl }) => crawl().then(onCrawlSuccess).catch(onCrawlError));
  }).then(stats => res.status(200).send(stats));
};

function getCrawlers(){
  return [diskIngressosCrawler];
}

function useCompleter(crawlers, { startTime, resolve }){
  const completed = [];
  const onComplete = response => {
    completed.push(response);
    if(response.err) console.error(response.err);
    completed.length === crawlers.length && resolve(buildStats(completed, startTime));
  };
  const onCrawlSuccess = events => eventsService.multiSave(events).then(onComplete).catch(onComplete);
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
