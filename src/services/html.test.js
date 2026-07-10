const htmlService = require('./html');

describe('HTML Service', () => {
  it('should create an HTML object with plain text content from a string', () => {
    const html = htmlService.createHTMLFromString('<p>Hello <strong>world</strong></p>');
    expect(html.textContent).toEqual('Hello world');
  });

  it('should decode HTML entities in the text content', () => {
    const html = htmlService.createHTMLFromString('<p>prop&oacute;sito</p>');
    expect(html.textContent).toEqual('propósito');
  });

  it('should return plain text when the string is not HTML', () => {
    const html = htmlService.createHTMLFromString('this is a plain text');
    expect(html.textContent).toEqual('this is a plain text');
  });
});
