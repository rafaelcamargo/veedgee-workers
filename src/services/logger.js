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

const CUSTOM_DETAILS_SECTION = 'custom details';

_public.track = (errorName, err, metadata = {}) => {
  err && console.error(errorName, err);
  notify(err, buildBugsnagCallback({
    context: errorName,
    metadata
  }));
};

function notify(message, callback){
  started && message && Bugsnag.notify(message, callback);
}

function buildBugsnagCallback({ context, metadata }){
  return event => {
    event.context = context;
    Object.keys(metadata).length && event.addMetadata(CUSTOM_DETAILS_SECTION, metadata);
  };
}

module.exports = _public;
