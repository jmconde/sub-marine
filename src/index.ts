import SubMarine from './main';
import TYPES from './utils/origin-types';
import Logger from './utils/logger';
import HashUtil from './utils/hash';
import LangUtil from './utils/lang';

// var filename = 'd:\\downloads\\.test\\dexter.mp4';
// var filename = 'd:\\downloads\\.test\\justified.mp4';
var filename = 'd:\\downloads\\.test\\Back.to.the.Future.1985.720p.BrRip.x264.YIFY.mp4';
// var filename = 'd:\\downloads\\.test\\Braindead.S01E01.HDTV.x264-LOL[eztv].mkv';
// var filename = 'd:\\downloads\\.test\\Chicago.Fire.S01E03.HDTV.x264-LOL.[VTV].mp4';
// var filename = 'd:\\downloads\\.test\\Accident.Man.2018.720p.BluRay.x264-[YTS.AG].mp4';
// var filename = 'd:\\downloads\\.test\\2.22.2017.720p.BluRay.x264-[YTS.AG].mp4';

const log = Logger.getInstance();

// LangUtil.test();
console.log(LangUtil.getLocal('es'));
console.log(process.env);
console.log(__dirname);
console.log(__filename);
console.log('->', process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']);

// HashUtil.subdbHash(filename).then(hash => {
  //   console.log(hash);
  // })

// var submarine = new SubMarine();
// submarine.get([TYPES.ORIGIN.SUBDIVX, TYPES.ORIGIN.OPEN_SUBTITLES], filename, ['es', 'en'])
//   .then(subs => {
//     log.cInfo(Logger.BLUE_BRIGHT ,"Total length: ", subs.length);

//     subs.map(sub => {
//       log.info(`(${sub.origin}) ${sub.meta.title} -> ${sub.url}`)
//     });

//     submarine.download(subs[0]);
//   });
