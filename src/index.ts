import SubMarine from './main';
import TYPES from './utils/origin-types';
import Logger from './utils/logger';

var submarine = new SubMarine();
var filename = 'd:\\downloads\\.test\\Braindead.S01E01.HDTV.x264-LOL[eztv].mkv';
// var filename =  'd:/downloads/test/Supernatural.S13E16.720p.HDTV.x264-worldmkv[eztv].mkv';
// var filename =  'd:/downloads/Indiana.Jones.And.The.Raiders.Of.The.Lost.Ark.1981.1080p.BluRay.H264.AAC-RARBG/Indiana.Jones.And.The.Raiders.Of.The.Lost.Ark.1981.1080p.BluRay.H264.AAC-RARBG.mp4';
// var filename =  'd:/downloads/Indiana.Jones.And.The.Raiders.Of.The.Lost.Ark.1981.1080p.BluRay.H264.AAC-RARBG/Indiana.Jones.And.The.Raiders.Of.The.Lost.Ark.1981.1080p.BluRay.H264.AAC-RARBG.mp4';
const log = Logger.getInstance();

submarine.get(TYPES.ORIGIN.OPEN_SUBTITLES, filename, [])
  .then(subs => {
    log.info("Total length: ", subs.length);

    subs.map(sub => {
      log.info(`(${sub.origin}) ${sub.meta.title} -> ${sub.url}`)
    })

    // submarine.download(subs[0]);
  });