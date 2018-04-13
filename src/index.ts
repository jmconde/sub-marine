import SubMarine from './main';
import TYPES from './utils/origin-types';
import Logger from './utils/logger';

var submarine = new SubMarine();
// var filename = 'd:\\downloads\\.test\\Chicago.Fire.S01E03.HDTV.x264-LOL.[VTV].mp4';
// var filename = 'd:\\downloads\\.test\\Accident.Man.2018.720p.BluRay.x264-[YTS.AG].mp4';
var filename = 'd:\\downloads\\.test\\2.22.2017.720p.BluRay.x264-[YTS.AG].mp4';

const log = Logger.getInstance();

submarine.get([TYPES.ORIGIN.SUBDIVX, TYPES.ORIGIN.OPEN_SUBTITLES], filename, [])
  .then(subs => {
    log.cInfo(Logger.BLUE_BRIGHT ,"Total length: ", subs.length);

    subs.map(sub => {
      log.info(`(${sub.origin}) ${sub.meta.title} -> ${sub.url}`)
    })

    submarine.download(subs[0]);
  });