"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const factory_1 = require("./factory");
const fs = require("fs");
const request = require("request");
const unzip = require("unzip");
const del = require("del");
class SubMarine {
    get(originType, textToSearch, tuneText) {
        let origin = factory_1.default.getOrigin(originType);
        return origin.search(textToSearch, tuneText);
    }
    download(sub) {
        console.log(sub);
        if (!sub.url) {
            console.error("No URL.");
            process.exit(-1);
        }
        var date = new Date().getTime();
        var tempFile = `./temp_${date}.zip`;
        var found = false;
        request(sub.url.toString())
            .pipe(fs.createWriteStream(tempFile))
            .on('close', function () {
            console.log(`Zip file donwloaded at ${tempFile}`);
            fs.createReadStream(tempFile)
                .pipe(unzip.Parse())
                .on('entry', entry => {
                console.log(entry);
                var fname = entry.path;
                var ext = fname.split('.').pop();
                var filename = sub.title.replace(' ', '.') + '.' + ext;
                var type = entry.type;
                console.log(found, type, fname, (/\.(srt|ssa|sub|sbv|mpsub|lrc|cap)$/i).test(fname));
                //
                if (!found && type === 'File' && (/\.(srt|ssa|sub|sbv|mpsub|lrc|cap)$/i).test(fname)) {
                    entry.pipe(fs.createWriteStream(`./${filename}`)
                        .on('close', function () {
                        console.log(`File '${filename}' extracted.`);
                    }));
                    found = true;
                }
                else {
                    entry.autodrain();
                }
            }).on('close', function () {
                del(tempFile);
                console.log('finished!!!');
            });
        });
        // var request = http.get(sub.url.toString() , function(response) {
        //   response.pipe(file);
        // });
    }
}
SubMarine.ORIGINS = {
    SUBDIVX: 'subdivx'
};
exports.default = SubMarine;
//# sourceMappingURL=main.js.map