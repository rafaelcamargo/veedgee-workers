const reportService = require('../services/report');
const { useCounter } = require('./useCounter');

const _public = {};

_public.useReporter = (reportId) => {
  const monitor = async (task, execute) => {
    const { check } = useCounter();
    try {
      const result = await execute();
      report(reportId, 'success', task, check());
      return result;
    } catch(err) {
      report(reportId, 'error', task, check(), err);
    }
  };
  return { monitor };
};

function report(reportId, result, task, time, err){
  reportService.addItem(reportId, { task, result, time }, err);
}

module.exports = _public;
