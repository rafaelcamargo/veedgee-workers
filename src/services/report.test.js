const reportService = require('./report');

describe('Report Service', () => {
  it('should build a markdown text report from report items', () => {
    const reportItems = [
      { task: 'DB: Get', result: 'success', time: 2812 },
      { task: 'Crawling: Total', result: 'success', time: 1543 }
    ];
    expect(reportService.buildTextReport(reportItems)).toEqual([
      '| Task            | Result  | Time (ms) |',
      '| --------------- | ------- | --------- |',
      '| DB: Get         | success | 2812      |',
      '| Crawling: Total | success | 1543      |'
    ].join('\n'));
  });
});
