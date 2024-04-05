const Bugsnag = require('@bugsnag/js');
const projectPkg = require('../../package');
const environmentService = require('./environment');

const _public = {};

let started;

_public.init = () => {
  const { BUGSNAG_API_TOKEN } = environmentService.get();
  if(BUGSNAG_API_TOKEN) {
    Bugsnag.start({
      apiKey: BUGSNAG_API_TOKEN,
      metadata: {
        app: `${projectPkg.name}@${projectPkg.version}`
      }
    });
    started = true;
  }
};

_public.track = (message, { type } = {}) => {
  return type == 'info' ? trackInfo(message) : trackError(message);
};

function trackInfo(info){
  console.log(info);
  notify(info, buildBugsnagCallback({ severity: 'info' }));
}

function trackError(err){
  console.error(err);
  notify(err);
}

function notify(message, callback){
  started && Bugsnag.notify(message, callback);
}

function buildBugsnagCallback(options){
  return event => {
    Object.entries(options).forEach(([key, value]) => {
      event[key] = value;
    });
  };
}

module.exports = _public;
