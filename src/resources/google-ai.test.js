const { GoogleGenAI } = require('@google/genai');
const { GoogleGenAIMock, googleAiInstanceMock } = require('../mocks/google-genai');
const ENV = require('../services/environment').get();
const httpService = require('../services/http');
const googleAiResource = require('./google-ai');

jest.mock('@google/genai');
GoogleGenAI.mockImplementation(GoogleGenAIMock);

describe('Google AI Resource', () => {
  function buildImageFixtures(){
    const imageBody = 'img';
    const imageBase64 = Buffer.from(imageBody).toString('base64');
    return { imageBody, imageBase64 };
  }

  function mapHeaders(headers = {}){
    const result = new Map();
    Object.entries(headers).forEach(([key, value]) => result.set(key, value));
    return result;
  }

  function mockImageFetch(imageUrl, { status, ok, mimeType, body }){
    const buffer = Buffer.from(body);
    httpService.fetch = jest.fn((url) => {
      return url === imageUrl && Promise.resolve({
        status,
        ok,
        headers: mapHeaders({ 'content-type': mimeType }),
        arrayBuffer: () => Promise.resolve(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))
      });
    });
  }

  beforeEach(() => {
    const { imageBody } = buildImageFixtures();
    const geminiResponse = { text: '[]' };
    googleAiInstanceMock.models.generateContent = jest.fn(() => Promise.resolve(geminiResponse));
    mockImageFetch('https://some.image.url', {
      status: 200,
      ok: true,
      mimeType: 'image/jpeg',
      body: imageBody
    });
  });

  it('should infer image data via Gemini', async () => {
    const { imageBase64 } = buildImageFixtures();
    const params = {
      prompt: 'some prompt',
      imageUrl: 'https://some.image.url'
    };
    const geminiResponse = { text: '[]' };
    googleAiInstanceMock.models.generateContent = jest.fn(() => Promise.resolve(geminiResponse));
    const result = await googleAiResource.inferImageData(params);
    expect(httpService.fetch).toHaveBeenCalledWith(params.imageUrl);
    expect(GoogleGenAIMock).toHaveBeenCalledWith({ apiKey: ENV.GOOGLE_AI_API_TOKEN });
    expect(googleAiInstanceMock.models.generateContent).toHaveBeenCalledWith({
      model: 'gemini-2.5-flash-lite',
      contents: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg'
          }
        },
        params.prompt
      ]
    });
    expect(result).toEqual({ data: geminiResponse });
  });

  it('should throw HTTP error when image download fails', async () => {
    const { imageBody } = buildImageFixtures();
    const params = {
      prompt: 'some prompt',
      imageUrl: 'https://some.image.url'
    };
    mockImageFetch(params.imageUrl, { status: 404, ok: false, mimeType: 'image/jpeg', body: imageBody });
    await expect(googleAiResource.inferImageData(params)).rejects.toMatchObject({
      message: 'HTTP Error 404',
      status: 404
    });
    expect(googleAiInstanceMock.models.generateContent).not.toHaveBeenCalled();
  });
});
