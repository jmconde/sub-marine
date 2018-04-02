import SubMarine from './main';
import TYPES from './utils/origin-types';

var submarine = new SubMarine();
// var filename = 'd:/downloads/Black.Lightning.S01E10.720p.HDTV.x264-worldmkv[eztv].mkv';
// var filename =  'd:/downloads/Gotham.S04E16.720p.HDTV.x264-worldmkv[eztv].mkv';
var filename =  'd:/downloads/Back to the Future (1985)/Back.to.the.Future.1985.720p.BrRip.x264.YIFY.mp4';

submarine.get(TYPES.ORIGIN.OPEN_SUBTITLES, filename, [])
  .then(subs => {
    console.log("Total length: ", subs.length);
  });