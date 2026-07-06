const loggerService = require('./logger');

const _public = {};

const reports = new Map();

_public.addItem = (reportId, item, err) => {
  const reportItems = reports.get(reportId) || [];
  reports.set(reportId, [...reportItems, item]);
  item.result === 'error' && trackTaskError(item, err);
};

_public.get = reportId => reports.get(reportId);

_public.delete = reportId => reports.delete(reportId);

_public.buildTextReport = reportItems => {
  const headers = ['Task', 'Result', 'Time (ms)'];
  const rows = reportItems.map(({ task, result, time }) => [task, result, String(time)]);
  const columnWidths = getColumnWidths(headers, rows);
  const headerRow = buildTableRow(headers, columnWidths);
  const separatorRow = buildTableSeparator(columnWidths);
  const dataRows = rows.map(row => buildTableRow(row, columnWidths));
  return [headerRow, separatorRow, ...dataRows].join('\n');
};

function getColumnWidths(headers, rows){
  return headers.map((header, columnIndex) => Math.max(
    header.length,
    ...rows.map(row => row[columnIndex].length)
  ));
}

function buildTableRow(cells, columnWidths){
  return `| ${cells.map((cell, columnIndex) => cell.padEnd(columnWidths[columnIndex])).join(' | ')} |`;
}

function buildTableSeparator(columnWidths){
  return `| ${columnWidths.map(width => '-'.repeat(width)).join(' | ')} |`;
}

function trackTaskError({ task, time }, err){
  loggerService.track(`Task Failed - ${task}`, err, { task_duration: time });
}

module.exports = _public;
