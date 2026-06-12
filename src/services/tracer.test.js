const { spanMock, startActiveSpanMock } = require('../mocks/opentelemetry');
const tracerService = require('./tracer');

jest.mock('@opentelemetry/api', () => {
  const { startActiveSpanMock } = require('../mocks/opentelemetry');
  return {
    trace: {
      getTracer: jest.fn(() => ({
        startActiveSpan: startActiveSpanMock
      }))
    }
  };
});

describe('Tracer Service', () => {
  beforeEach(() => {
    spanMock.setAttribute = jest.fn();
    spanMock.end = jest.fn();
    startActiveSpanMock.mockImplementation((name, fn) => fn(spanMock));
  });

  it('should run fn without span when enable has not been called', async () => {
    const fn = jest.fn(() => Promise.resolve('result'));
    const result = await tracerService.run('crawler.sympla', fn);
    expect(result).toEqual('result');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(startActiveSpanMock).not.toHaveBeenCalled();
  });

  it('should create a first class span when enable has been called', async () => {
    tracerService.enable();
    const fn = jest.fn(() => Promise.resolve('result'));
    const result = await tracerService.run('crawler.sympla', fn);
    expect(result).toEqual('result');
    expect(startActiveSpanMock).toHaveBeenCalledWith('crawler.sympla', expect.any(Function));
    expect(spanMock.setAttribute).toHaveBeenCalledWith('bugsnag.span.first_class', true);
    expect(spanMock.end).toHaveBeenCalledTimes(1);
  });
});
