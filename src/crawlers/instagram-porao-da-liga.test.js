const { VLM_INFERENCE_PARSE_ERROR } = require('../constants/eventNames');
const huggingFacePoraoDaLigaMock = require('../mocks/hugging-face-porao-da-liga');
const eventFetcherService = require('../services/event-fetcher');
const dateService = require('../services/date');
const loggerService = require('../services/logger');
const huggingFaceResource = require('../resources/hugging-face');
const rapidApiResource = require('../resources/rapid-api');
const instagramPoraoDaLigaCrawler = require('./instagram-porao-da-liga');

describe('Instagram Porao Da Liga Crawler', () => {
  function buildDefaultPost(){
    return {
      postId: 'DQKoU0bjYlV',
      imageUrl: 'https://example.com/img.jpg'
    };
  }

  function buildInstagramPostsMock(edges){
    return {
      result: {
        edges: edges.map(({ id, url }) => ({
          node: {
            code: id,
            image_versions2: {
              candidates: [{ url, width: 800 }]
            }
          }
        }))
      }
    };
  }

  function buildVlmInferenceData(content){
    return {
      choices: [{
        message: { content }
      }]
    };
  }

  function setupCrawlMocks({ instagramData, vlmResponses }){
    rapidApiResource.getInstagramPosts = jest.fn(() => Promise.resolve({ data: instagramData }));
    eventFetcherService.cachedFetch = jest.fn(() => Promise.resolve({ data: [] }));
    const vlmQueue = [...vlmResponses];
    huggingFaceResource.inferImageData = jest.fn(() => {
      const data = vlmQueue.shift();
      return Promise.resolve({ data });
    });
  }

  beforeEach(() => {
    loggerService.track = jest.fn();
    eventFetcherService.flushCache();
    dateService.getNow = jest.fn(() => new Date(2025, 1, 15));
  });

  it('should return formatted events when VLM returns markdown wrapped JSON array', async () => {
    const { postId, imageUrl } = buildDefaultPost();
    setupCrawlMocks({
      instagramData: buildInstagramPostsMock([{ id: postId, url: imageUrl }]),
      vlmResponses: [huggingFacePoraoDaLigaMock[0]]
    });
    const events = await instagramPoraoDaLigaCrawler.crawl();
    expect(events).toEqual([{
      title: 'Porão da Liga - Em Pé na Rede',
      date: '2025-11-06',
      time: '20:00',
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: `https://www.instagram.com/poraodaliga/p/${postId}/`
    }]);
    expect(loggerService.track).not.toHaveBeenCalled();
  });

  it('should return formatted events when VLM returns plain JSON array', async () => {
    const { postId, imageUrl } = buildDefaultPost();
    setupCrawlMocks({
      instagramData: buildInstagramPostsMock([{ id: postId, url: imageUrl }]),
      vlmResponses: [buildVlmInferenceData('[{"title":"Show","date":"2025-10-24","time":null}]')]
    });
    const events = await instagramPoraoDaLigaCrawler.crawl();
    expect(events).toEqual([{
      title: 'Porão da Liga - Show',
      date: '2025-10-24',
      time: null,
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: `https://www.instagram.com/poraodaliga/p/${postId}/`
    }]);
    expect(loggerService.track).not.toHaveBeenCalled();
  });

  it('should return empty array when VLM returns valid empty JSON array', async () => {
    const { postId, imageUrl } = buildDefaultPost();
    setupCrawlMocks({
      instagramData: buildInstagramPostsMock([{ id: postId, url: imageUrl }]),
      vlmResponses: [buildVlmInferenceData('[]')]
    });
    const events = await instagramPoraoDaLigaCrawler.crawl();
    expect(events).toEqual([]);
    expect(loggerService.track).not.toHaveBeenCalled();
  });

  it('should return empty array and track error when VLM returns invalid JSON', async () => {
    const { postId, imageUrl } = buildDefaultPost();
    setupCrawlMocks({
      instagramData: buildInstagramPostsMock([{ id: postId, url: imageUrl }]),
      vlmResponses: [buildVlmInferenceData('not json')]
    });
    const events = await instagramPoraoDaLigaCrawler.crawl();
    expect(events).toEqual([]);
    expect(loggerService.track).toHaveBeenCalledWith(
      VLM_INFERENCE_PARSE_ERROR,
      expect.any(SyntaxError),
      expect.objectContaining({
        instagram_post_id: postId,
        image_url: imageUrl,
        vlm_raw_content: 'not json'
      })
    );
    expect(loggerService.track).toHaveBeenCalledTimes(1);
  });

  it('should return empty array and track error when VLM response has no choices', async () => {
    const { postId, imageUrl } = buildDefaultPost();
    setupCrawlMocks({
      instagramData: buildInstagramPostsMock([{ id: postId, url: imageUrl }]),
      vlmResponses: [{}]
    });
    const events = await instagramPoraoDaLigaCrawler.crawl();
    expect(events).toEqual([]);
    expect(loggerService.track).toHaveBeenCalledWith(
      VLM_INFERENCE_PARSE_ERROR,
      expect.any(Error),
      expect.objectContaining({ instagram_post_id: postId, image_url: imageUrl })
    );
    expect(loggerService.track).toHaveBeenCalledTimes(1);
  });

  it('should return empty array and track error when VLM choices is empty', async () => {
    const { postId, imageUrl } = buildDefaultPost();
    setupCrawlMocks({
      instagramData: buildInstagramPostsMock([{ id: postId, url: imageUrl }]),
      vlmResponses: [{ choices: [] }]
    });
    const events = await instagramPoraoDaLigaCrawler.crawl();
    expect(events).toEqual([]);
    expect(loggerService.track).toHaveBeenCalledWith(
      VLM_INFERENCE_PARSE_ERROR,
      expect.any(Error),
      expect.objectContaining({ instagram_post_id: postId, image_url: imageUrl })
    );
    expect(loggerService.track).toHaveBeenCalledTimes(1);
  });

  it('should return empty array and track error when VLM message content is missing', async () => {
    const { postId, imageUrl } = buildDefaultPost();
    setupCrawlMocks({
      instagramData: buildInstagramPostsMock([{ id: postId, url: imageUrl }]),
      vlmResponses: [{ choices: [{ message: {} }] }]
    });
    const events = await instagramPoraoDaLigaCrawler.crawl();
    expect(events).toEqual([]);
    expect(loggerService.track).toHaveBeenCalledWith(
      VLM_INFERENCE_PARSE_ERROR,
      expect.any(Error),
      expect.objectContaining({ instagram_post_id: postId, image_url: imageUrl })
    );
    expect(loggerService.track).toHaveBeenCalledTimes(1);
  });

  it('should return empty array and track error when VLM returns JSON object instead of array', async () => {
    const { postId, imageUrl } = buildDefaultPost();
    setupCrawlMocks({
      instagramData: buildInstagramPostsMock([{ id: postId, url: imageUrl }]),
      vlmResponses: [buildVlmInferenceData('{"title":"x"}')]
    });
    const events = await instagramPoraoDaLigaCrawler.crawl();
    expect(events).toEqual([]);
    expect(loggerService.track).toHaveBeenCalledWith(
      VLM_INFERENCE_PARSE_ERROR,
      expect.objectContaining({ message: 'VLM inference response is not an array' }),
      expect.objectContaining({
        instagram_post_id: postId,
        image_url: imageUrl,
        vlm_raw_content: '{"title":"x"}'
      })
    );
    expect(loggerService.track).toHaveBeenCalledTimes(1);
  });

  it('should return events from valid posts when another post has invalid VLM response', async () => {
    const { postId, imageUrl } = buildDefaultPost();
    const secondPostId = 'DQG-U0DDQLr';
    const secondImageUrl = 'https://example.com/img2.jpg';
    setupCrawlMocks({
      instagramData: buildInstagramPostsMock([
        { id: postId, url: imageUrl },
        { id: secondPostId, url: secondImageUrl }
      ]),
      vlmResponses: [
        huggingFacePoraoDaLigaMock[0],
        buildVlmInferenceData('not json')
      ]
    });
    const events = await instagramPoraoDaLigaCrawler.crawl();
    expect(events).toEqual([{
      title: 'Porão da Liga - Em Pé na Rede',
      date: '2025-11-06',
      time: '20:00',
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      url: `https://www.instagram.com/poraodaliga/p/${postId}/`
    }]);
    expect(loggerService.track).toHaveBeenCalledWith(
      VLM_INFERENCE_PARSE_ERROR,
      expect.any(SyntaxError),
      expect.objectContaining({
        instagram_post_id: secondPostId,
        image_url: secondImageUrl,
        vlm_raw_content: 'not json'
      })
    );
    expect(loggerService.track).toHaveBeenCalledTimes(1);
  });
});
