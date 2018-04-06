"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const origin_types_1 = require("./utils/origin-types");
var submarine = new main_1.default();
// var filename = 'd:/downloads/Black.Lightning.S01E10.720p.HDTV.x264-worldmkv[eztv].mkv';
var filename = 'd:/downloads/test/Supernatural.S13E16.720p.HDTV.x264-worldmkv[eztv].mkv';
// var filename =  'd:/downloads/test/2.22.2017.720p.BluRay.x264-[YTS.AG].mp4';
submarine.get(origin_types_1.default.ORIGIN.SUBDIVX, filename, [])
    .then(subs => {
    console.log("Total length: ", subs.length);
    subs.map(sub => {
        console.log(`(${sub.origin}) ${sub.meta.title} -> ${sub.url}`);
    });
});
//# sourceMappingURL=index.js.map