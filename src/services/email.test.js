const { Resend } = require('resend');
const { ResendMock, resendInstanceMock } = require('../mocks/resend');
const emailService = require('./email');

jest.mock('resend');
Resend.mockImplementation(ResendMock);

describe('Email Service', () => {
  beforeEach(() => {
    resendInstanceMock.emails.send = jest.fn();
  });

  it('should send an email', () => {
    const to = 'john@gmail.com';
    const subject = 'Hello!';
    const message = 'Enjoy your life.';
    emailService.send({ to, subject, message });
    expect(ResendMock).toHaveBeenCalledWith('f1a2k3');
    expect(resendInstanceMock.emails.send).toHaveBeenCalledWith({
      from: 'Veedgee <veedgeeapp@gmail.com>',
      to,
      subject,
      text: message
    });
  });
});
