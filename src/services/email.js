const { Resend } = require('resend');
const ENV = require('./environment').get();

const _public = {};

_public.send = ({ to, subject, message }) => {
  const resend = new Resend(ENV.RESEND_API_TOKEN);
  return resend.emails.send({
    from: ENV.NOTIFICATION_SENDER,
    to,
    subject,
    text: message
  });
};

module.exports = _public;
