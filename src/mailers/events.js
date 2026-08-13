const ENV = require('../services/environment').get();
const emailService = require('../services/email');

const _public = {};

_public.send = (events, dateString) => {
  const recipients = ENV.NOTIFICATION_RECIPIENTS.split(',');
  return new Promise(resolve => {
    const completed = [];
    const onComplete = data => {
      completed.push(data);
      completed.length === recipients.length && resolve(buildStats(completed));
    };
    recipients.forEach(recipient => {
      emailService.send({
        to: recipient,
        subject: `[${dateString}] New events found!`,
        message: buildMessage(events)
      }).then(onComplete).catch(err => onComplete({ err, isError: true }));
    });
  });
};

function buildMessage(events){
  return `Cool! ${events.length} new events have just been found.\n\n${formatMessageEvents(events)}`;
}

function formatMessageEvents(events){
  return events.map(event => [
    formatEventTitle(event), formatDateTime(event.date, event.time), event.venue, `${event.city}, ${event.state}`, event.url
  ].filter(Boolean).join('\n')).join('\n\n');
}

function formatEventTitle({ title, category, enhanced_title }){
  const displayTitle = enhanced_title ? extractPtBrContent(enhanced_title) : title;
  return category ? `[${category}] ${displayTitle}` : displayTitle;
}

function extractPtBrContent(localizedString){
  return localizedString.split('[pt-BR]')[1].split('[')[0].trim();
}

function formatDateTime(date, time){
  return `${date} ${time ? time : ''}`.trim();
}

function buildStats(completed){
  return {
    successes: getCompletionTypeCount(completed, 'success'),
    failures: getCompletionTypeCount(completed, 'failure')
  };
}

function getCompletionTypeCount(completed, type){
  return completed.filter(data => type == 'success' ? !data.isError : data.isError).length;
}

module.exports = _public;
