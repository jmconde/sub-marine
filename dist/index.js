"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const origin_types_1 = require("./utils/origin-types");
var submarine = new main_1.default();
// var filename = 'd:/downloads/Black.Lightning.S01E10.720p.HDTV.x264-worldmkv[eztv].mkv';
// var filename =  'd:/downloads/Gotham.S04E16.720p.HDTV.x264-worldmkv[eztv].mkv';
var filename = 'd:/downloads/Back to the Future (1985)/Back.to.the.Future.1985.720p.BrRip.x264.YIFY.mp4';
submarine.get(origin_types_1.default.ORIGIN.OPEN_SUBTITLES, filename, [])
    .then(subs => {
    console.log("Total length: ", subs.length);
});
//# sourceMappingURL=index.js.map