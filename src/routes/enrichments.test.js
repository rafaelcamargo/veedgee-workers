const { serve } = require('../services/testing');
const eventEnrichmentPromptTemplate = require('../constants/event-enrichment-prompt-template');
const eventsResource = require('../resources/events');
const googleAiResource = require('../resources/google-ai');
const dateService = require('../services/date');
const enrichedEventMock = require('../mocks/enriched-events');
const eventsToEnrichMock = require('../mocks/events-to-enrich.json');

describe('Enrichments Routes', () => {
  function start(){
    return serve().post('/enrichments').set({ vwtoken: 'vee456' });
  }

  function parseEnrichedEvents(){
    const normalized = enrichedEventMock.text.replace(/```/g, '').replace(/^text/i, '').trim();
    return JSON.parse(normalized);
  }

  beforeEach(() => {
    dateService.buildTodayDateString = jest.fn(() => '2026-07-25');
    eventsResource.get = jest.fn(() => Promise.resolve({ data: eventsToEnrichMock }));
    googleAiResource.infer = jest.fn(() => Promise.resolve({ data: enrichedEventMock }));
    eventsResource.bulkPatch = jest.fn(() => Promise.resolve({ data: { count: 5 } }));
  });

  it('should not allow enrichment execution by default', async () => {
    const response = await serve().post('/enrichments');
    expect(response.status).toEqual(401);
  });

  it('should enrich events', async () => {
    const response = await start();
    const prompt = eventEnrichmentPromptTemplate.replace('{{EVENTS_JSON}}', JSON.stringify(eventsToEnrichMock));
    expect(eventsResource.get).toHaveBeenCalledWith({
      minCreationDate: '2026-07-25',
      hasDescription: 'true',
      hasCategory: 'false'
    });
    expect(googleAiResource.infer).toHaveBeenCalledWith({ prompt });
    expect(eventsResource.bulkPatch).toHaveBeenCalledWith(parseEnrichedEvents());
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ count: 5 });
  });

  it('should skip inference when there are no events to enrich', async () => {
    eventsResource.get = jest.fn(() => Promise.resolve({ data: [] }));
    const response = await start();
    expect(googleAiResource.infer).not.toHaveBeenCalled();
    expect(eventsResource.bulkPatch).not.toHaveBeenCalled();
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ count: 0 });
  });
});
