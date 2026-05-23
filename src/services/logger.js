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

_public.track = (eventName, metadata) => {
  return metadata.type == 'info' ? trackInfo(eventName, metadata) : trackError(eventName, metadata);
};

function trackInfo(eventName, metadata){
  console.log(eventName, JSON.stringify(metadata));
  const bugsnagMetadata = removeObjectAttribute(metadata, 'type');
  notify(eventName, buildBugsnagCallback({ severity: 'info', metadata: bugsnagMetadata }));
}

function trackError(eventName, metadata){
  const { error, ...bugsnagMetadata } = removeObjectAttribute(metadata, 'type');
  console.error(eventName, error);
  notify(error, buildBugsnagCallback({
    context: eventName,
    metadata: { ...bugsnagMetadata, error }
  }));
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

function removeObjectAttribute(obj, attr){
  return Object.entries(obj).reduce((result, [key, value]) => {
    return key !== attr ? { ...result, [key]: value } : result;
  }, {});
}

module.exports = _public;
