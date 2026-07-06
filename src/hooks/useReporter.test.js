const reportService = require('../services/report');
const loggerService = require('../services/logger');
const { useReporter } = require('./useReporter');

describe('Reporter Hook', () => {
  const reportId = 'test-report-id';

  beforeEach(() => {
    loggerService.track = jest.fn();
    reportService.delete(reportId);
  });

  it('should report error if task execution fails', async () => {
    const { monitor } = useReporter(reportId);
    const task = 'Testing';
    const err = new Error('Task execution failure');
    const execute = () => Promise.reject(err);
    await monitor(task, execute);
    expect(reportService.get(reportId)).toEqual([
      { task, result: 'error', time: expect.any(Number) }
    ]);
    expect(loggerService.track).toHaveBeenCalledWith(`Task Failed - ${task}`, err, {
      task_duration: expect.any(Number)
    });
  });
});
