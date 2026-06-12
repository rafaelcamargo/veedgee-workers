const _public = {};

_public.spanMock = {
  setAttribute: jest.fn(),
  end: jest.fn()
};

_public.startActiveSpanMock = jest.fn();

module.exports = _public;
