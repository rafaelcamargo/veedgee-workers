const { GoogleGenAI } = require('@google/genai');
const ENV = require('../services/environment').get();
const httpService = require('../services/http');

const GEMINI_MODEL = 'gemini-3.1-flash-lite';

const _public = {};

_public.inferImageData = ({ prompt, imageUrl }) => {
  return buildImagePart(imageUrl).then(imagePart => {
    const ai = new GoogleGenAI({ apiKey: ENV.GOOGLE_AI_API_TOKEN });
    return ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [imagePart, prompt]
    }).then(response => ({ data: response }));
  });
};

function buildImagePart(imageUrl){
  return httpService.fetch(imageUrl).then(async response => {
    if (!response.ok) {
      const error = new Error(`HTTP Error ${response.status}`);
      error.status = response.status;
      throw error;
    }
    const mimeType = response.headers.get('content-type');
    const buffer = await response.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');
    return {
      inlineData: {
        data: base64Data,
        mimeType
      }
    };
  });
}

module.exports = _public;
