"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const origin_types_1 = require("./utils/origin-types");
const logger_1 = require("./utils/logger");
var submarine = new main_1.default();
var filename = 'd:\\downloads\\.test\\Braindead.S01E01.HDTV.x264-LOL[eztv].mkv';
// var filename =  'd:/downloads/test/Supernatural.S13E16.720p.HDTV.x264-worldmkv[eztv].mkv';
// var filename =  'd:/downloads/Indiana.Jones.And.The.Raiders.Of.The.Lost.Ark.1981.1080p.BluRay.H264.AAC-RARBG/Indiana.Jones.And.The.Raiders.Of.The.Lost.Ark.1981.1080p.BluRay.H264.AAC-RARBG.mp4';
// var filename =  'd:/downloads/Indiana.Jones.And.The.Raiders.Of.The.Lost.Ark.1981.1080p.BluRay.H264.AAC-RARBG/Indiana.Jones.And.The.Raiders.Of.The.Lost.Ark.1981.1080p.BluRay.H264.AAC-RARBG.mp4';
const log = logger_1.default.getInstance();
submarine.get(origin_types_1.default.ORIGIN.OPEN_SUBTITLES, filename, [])
    .then(subs => {
    log.info("Total length: ", subs.length);
    subs.map(sub => {
        log.info(`(${sub.origin}) ${sub.meta.title} -> ${sub.url}`);
    });
    // submarine.download(subs[0]);
});
//# sourceMappingURL=index.js.map