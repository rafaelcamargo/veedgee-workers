const Bugsnag = require('@bugsnag/js');
const projectPkg = require('../../package');
const environmentService = require('./environment');

const _public = {};

let started;

_public.init = () => {
  const { TYPE, BUGSNAG_API_TOKEN } = environmentService.get();
  Bugsnag.start({
    apiKey: BUGSNAG_API_TOKEN,
    appVersion: projectPkg.version,
    releaseStage: TYPE,
    metadata: {
      app: {
        name: projectPkg.name,
        version: projectPkg.version
      },
      worker: {
        type: 'crawler'
      }
    }
  });
  started = true;
};

_public.track = (message, { type, metadata } = {}) => {
  return type == 'info' ? trackInfo(message, metadata) : trackError(message, metadata);
};

function trackInfo(info, metadata){
  console.log(info);
  notify(info, buildBugsnagCallback({ severity: 'info', metadata }));
}

function trackError(err, metadata){
  console.error(err);
  notify(err, buildBugsnagCallback({ metadata }));
}

function notify(message, callback){
  started && Bugsnag.notify(message, callback);
}

function buildBugsnagCallback(options){
  return event => {
    Object.entries(options).filter(([, value]) => value !== undefined).forEach(([key, value]) => {
      event[key] = value;
    });
  };
}

module.exports = _public;
