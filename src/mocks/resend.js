const _public = {};

_public.resendInstanceMock = {
  emails: {
    send: jest.fn()
  }
};

_public.ResendMock = jest.fn(() => _public.resendInstanceMock);

module.exports = _public;
