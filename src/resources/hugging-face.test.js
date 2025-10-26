const baseResource = require('./base');
const huggingFaceResource = require('./hugging-face');

describe('Hugging Face Resource', () => {
  beforeEach(() => {
    baseResource.post = jest.fn();
  });

  it('should infer image data via VLM', () => {
    const params = {
      prompt: 'some prompt',
      imageUrl: 'https://some.image.url'
    };
    huggingFaceResource.inferImageData(params);
    expect(baseResource.post).toHaveBeenCalledWith(
      'https://router.huggingface.co/v1/chat/completions',
      { 
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: params.prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: params.imageUrl,
                },
              },
            ],
          },
        ],
        model: 'Qwen/Qwen2.5-VL-7B-Instruct:hyperbolic',
      },
      {
        headers: {
          Authorization: 'Bearer h3f2k1'
        }
      }
    );
  });
});
