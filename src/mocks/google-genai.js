const _public = {};

_public.googleAiInstanceMock = {
  models: {
    generateContent: jest.fn()
  }
};

_public.GoogleGenAIMock = jest.fn(() => _public.googleAiInstanceMock);

module.exports = _public;
