const { Resend } = require('resend');
const ENV = require('./environment')();

const _public = {};

_public.send = ({ to, subject, message }) => {
  const resend = new Resend(ENV.RESEND_API_TOKEN);
  return resend.emails.send({
    from: 'Veedgee <veedgeeapp@gmail.com>',
    to,
    subject,
    text: message
  });
};

module.exports = _public;
