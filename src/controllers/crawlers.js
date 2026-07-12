const eventService = require('../services/event');
const idService = require('../services/id');
const reportService = require('../services/report');
const blueticketCrawler = require('../crawlers/blueticket');
const diskIngressosCrawler = require('../crawlers/disk-ingressos');
const eticketCenterCrawler = require('../crawlers/eticket-center');
const instagramPoraoDaLigaCrawler = require('../crawlers/instagram-porao-da-liga');
const pensaNoEventoCrawler = require('../crawlers/pensa-no-evento');
const songkickCrawler = require('../crawlers/songkick');
const symplaCrawler = require('../crawlers/sympla');
const tockifyCrawler = require('../crawlers/tockify');
const ingressoCrawler = require('../crawlers/ingresso');
const { useCounter } = require('../hooks/useCounter');
const { useReporter } = require('../hooks/useReporter');

const _public = {};

_public.start = async (req, res) => {
  const { mode } = req.body;
  const reportId = idService.generate();
  const { monitor } = useReporter(reportId);
  const crawlers = getCrawlers(mode);
  await monitor('Crawling: Total', () => runCrawlers(crawlers, reportId));
  const reportItems = [...reportService.get(reportId)];
  reportService.delete(reportId);
  res.status(200).send({
    reportJson: reportItems,
    reportTxt: reportService.buildTextReport(reportItems)
  });
};

function getCrawlers(mode){
  return {
    'vlm': [
      { name: 'instagram-porao-da-liga', crawl: instagramPoraoDaLigaCrawler.crawl }
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
    { name: 'sympla', crawl: symplaCrawler.crawl },
    { name: 'tockify', crawl: tockifyCrawler.crawl },
    { name: 'ingresso', crawl: ingressoCrawler.crawl }
  ];
}

async function runCrawlers(crawlers, reportId){
  await Promise.all(crawlers.map(({ name, crawl }) => runCrawler(name, crawl, reportId)));
}

async function runCrawler(name, crawl, reportId){
  const { check } = useCounter();
  const task = `Crawling: ${name}`;
  try {
    const events = await crawl(reportId);
    await eventService.multiSave(events);
    reportService.addItem(reportId, { task, result: 'success', time: check() });
  } catch (err) {
    reportService.addItem(reportId, { task, result: 'error', time: check() }, err);
  }
}

module.exports = _public;
