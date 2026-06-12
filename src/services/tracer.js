const opentelemetry = require('@opentelemetry/api');

const _public = {};

let started;

_public.enable = () => {
  started = true;
};

_public.run = (name, fn) => {
  if (!started) return fn();
  const tracer = opentelemetry.trace.getTracer('veedgee-workers');
  return tracer.startActiveSpan(name, span => {
    span.setAttribute('bugsnag.span.first_class', true);
    return Promise.resolve(fn()).finally(() => span.end());
  });
};

module.exports = _public;
