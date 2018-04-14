"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const origin_types_1 = require("./utils/origin-types");
const logger_1 = require("./utils/logger");
// var filename = 'd:\\downloads\\.test\\dexter.mp4';
// var filename = 'd:\\downloads\\.test\\justified.mp4';
var filename = 'd:\\downloads\\.test\\Back.to.the.Future.1985.720p.BrRip.x264.YIFY.mp4';
// var filename = 'd:\\downloads\\.test\\Braindead.S01E01.HDTV.x264-LOL[eztv].mkv';
// var filename = 'd:\\downloads\\.test\\Chicago.Fire.S01E03.HDTV.x264-LOL.[VTV].mp4';
// var filename = 'd:\\downloads\\.test\\Accident.Man.2018.720p.BluRay.x264-[YTS.AG].mp4';
// var filename = 'd:\\downloads\\.test\\2.22.2017.720p.BluRay.x264-[YTS.AG].mp4';
const log = logger_1.default.getInstance();
// LangUtil.test();
// HashUtil.subdbHash(filename).then(hash => {
//   console.log(hash);
// })
var submarine = new main_1.default();
submarine.get([origin_types_1.default.ORIGIN.SUBDIVX, origin_types_1.default.ORIGIN.OPEN_SUBTITLES], filename, ['es', 'en'])
    .then(subs => {
    log.cInfo(logger_1.default.BLUE_BRIGHT, "Total length: ", subs.length);
    subs.map(sub => {
        log.info(`(${sub.origin}) ${sub.meta.title} -> ${sub.url}`);
    });
    submarine.download(subs[0]);
});
//# sourceMappingURL=index.js.map