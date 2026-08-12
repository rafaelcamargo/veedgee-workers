const eventEnrichmentPromptTemplate = require('../constants/event-enrichment-prompt-template');
const eventsResource = require('../resources/events');
const googleAiResource = require('../resources/google-ai');
const dateService = require('../services/date');

const _public = {};

_public.start = (req, res) => {
  const params = {
    minCreationDate: dateService.buildTodayDateString(),
    hasDescription: 'true'
  };
  return eventsResource.get(params).then(({ data: events }) => {
    if(!events.length) return res.status(200).send({ count: 0 });
    const prompt = buildPrompt(events);
    return googleAiResource.infer({ prompt }).then(({ data }) => {
      const enrichedEvents = parseInference(data);
      return eventsResource.bulkPatch(enrichedEvents).then(({ data }) => {
        res.status(200).send(data);
      });
    });
  });
};

function buildPrompt(events){
  const input = events.map(({ id, title, description, category }) => ({
    id,
    title,
    description,
    ...(category && { category })
  }));
  return eventEnrichmentPromptTemplate.replace('{{EVENTS_JSON}}', JSON.stringify(input));
}

function parseInference({ text }){
  const normalized = text.replace(/```/g, '').replace(/^(json|text)/i, '').trim();
  return JSON.parse(normalized);
}

module.exports = _public;
