const ENV = require('../services/environment').get();
const { BASE_URL } = require('../constants/hugging-face');
const baseResource = require('./base');

const _public = {};

_public.inferImageData = ({ prompt, imageUrl }) => {
  return baseResource.post(
    `${BASE_URL}/chat/completions`,
    buildImageinferenceRequestBody({ prompt, imageUrl }),
    { headers: buildHuggingFaceRequestApiHeaders() }
  );
};

function buildImageinferenceRequestBody({ prompt, imageUrl }){
  return {
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    model: 'Qwen/Qwen3-VL-8B-Instruct:novita'
  };
}

function buildHuggingFaceRequestApiHeaders(){
  return { Authorization: `Bearer ${ENV.HUGGING_FACE_API_TOKEN}` };
}

module.exports = _public;
