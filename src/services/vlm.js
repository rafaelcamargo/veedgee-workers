const huggingFaceResource = require('../resources/hugging-face');
const rapidApiResource = require('../resources/rapid-api');

const _public = {};

_public.warmUp = () => {
  rapidApiResource.getInstagramPosts({ username: 'poraodaliga' });
  huggingFaceResource.inferImageData({ prompt: 'Describe this image', imageUrl: 'https://scontent.cdninstagram.com/v/t51.82787-15/572196102_18293225305260658_7969771910618201699_n.heic?stp=dst-jpg_e35_tt6&_nc_cat=107&ig_cache_key=Mzc1NDE1MzQ4NzA2MDgwNDU1MA%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=JswQcIAa6nsQ7kNvwGHOE_2&_nc_oc=AdmophjscptVqCz_ReL2I_Vz40xo7p0qIzcz9QBcsFIHnM6QPgWDRsxg1rs78N12XHmQcCbmA5gyl6bNu4GAtgbT&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=w16mAFzPjgjUCxchBOMDHg&oh=00_AfdQywDfTg4sOMBB_win_ImyzzrzAur5HDfDbBvs7QVmAQ&oe=6909533B' });
};

module.exports = _public;
