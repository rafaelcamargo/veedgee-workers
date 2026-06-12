const projectPkg = require('../package');
const environmentService = require('./services/environment');
const tracerService = require('./services/tracer');

if (process.env.NODE_ENV !== 'production') return;

const { TYPE, BUGSNAG_API_TOKEN } = environmentService.get();

process.env.OTEL_EXPORTER_OTLP_PROTOCOL = 'http/protobuf';
process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = `https://${BUGSNAG_API_TOKEN}.otlp.bugsnag.com:4318/v1/traces`;
process.env.OTEL_EXPORTER_METRICS_EXPORTER = 'none';
process.env.OTEL_EXPORTER_TRACES_EXPORTER = 'otlp';
process.env.OTEL_SERVICE_NAME = projectPkg.name;
process.env.OTEL_RESOURCE_ATTRIBUTES = `deployment.environment=${TYPE},service.version=${projectPkg.version}`;
process.env.OTEL_BSP_MAX_EXPORT_BATCH_SIZE = '200';

require('@opentelemetry/auto-instrumentations-node/register');
tracerService.enable();
