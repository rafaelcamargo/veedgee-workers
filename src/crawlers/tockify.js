const { IMAGE_CDN_HOST, IMAGE_SIZES } = require('../constants/tockify');
const arrayService = require('../services/array');
const dateService = require('../services/date');
const eventCategoryService = require('../services/event-category');
const objectService = require('../services/object');
const tockifyResource = require('../resources/tockify');

const _public = {};

_public.crawl = () => {
  return tockifyResource.get(buildQueryParams()).then(({ data }) => {
    return data?.events ? buildEvents(data.events) : [];
  });
};

function buildQueryParams(){
  const startDate = dateService.getNow();
  startDate.setHours(0, 0, 0, 0);
  return {
    calname: 'eventosemjoinville',
    max: '999',
    startms: startDate.getTime()
  };
}

function buildEvents(data){
  return data.map(item => {
    const [date, time] = buildDateTime(item.when.start.millis);
    const tags = item.content.tagset.tags.default;
    return objectService.removeFalsyAttrs({
      title: item.content.summary.text,
      date,
      time,
      city: 'Joinville',
      state: 'SC',
      country: 'BR',
      category: eventCategoryService.findCategoryByKeywords(tags),
      image: buildImageURL(item.content),
      url: `https://tockify.com/eventosemjoinville/detail/${item.eid.uid}/${item.eid.tid}`
    });
  });
}

function buildDateTime(timestamp){
  const [date, time] = dateService
    .buildDateTimeStringFromUTCTimestamp(timestamp)
    .split(' ');
  return time != '00:00' ? [date, time] : [date];
}

function buildImageURL(content){
  const [imageSet] = content.imageSets;
  const imageId = arrayService.pickFirstTruthyItem([content.imageIdNg, imageSet?.id]);
  if(!imageId || !imageSet?.ownerId) return null;
  const maxDim = Math.min(imageSet.width, imageSet.height);
  const size = arrayService.pickFirstTruthyItem([
    IMAGE_SIZES.find(scaledSize => scaledSize <= maxDim),
    IMAGE_SIZES.at(-1)
  ]);
  const format = arrayService.pickFirstTruthyItem([imageSet.variantFormat, 'jpg']);
  return `${IMAGE_CDN_HOST}/${imageSet.ownerId}/${imageId}/scaled_${size}.${format}`;
}

module.exports = _public;
