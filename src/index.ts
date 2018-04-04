import SubMarine from './main';
import TYPES from './utils/origin-types';

var submarine = new SubMarine();
// var filename = 'd:/downloads/Black.Lightning.S01E10.720p.HDTV.x264-worldmkv[eztv].mkv';
// var filename =  'd:/downloads/Gotham.S04E16.720p.HDTV.x264-worldmkv[eztv].mkv';
var filename =  'd:/downloads/test/2.22.2017.720p.BluRay.x264-[YTS.AG].mp4';

submarine.get(TYPES.ORIGIN.SUBDIVX, filename, [])
  .then(subs => {
    console.log("Total length: ", subs.length);
  });