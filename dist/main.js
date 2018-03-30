"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const factory_1 = require("./factory");
const fs = require("fs");
const request = require("request");
const unzip = require("unzip");
const del = require("del");
const unrar = require("node-unrar-js");
class SubMarine {
    get(originType, textToSearch, tuneText) {
        let origin = factory_1.default.getOrigin(originType);
        return origin.search(textToSearch, tuneText);
    }
    download(sub) {
        if (!sub.url) {
            console.error("No URL.");
            process.exit(-1);
        }
        var date = new Date().getTime();
        var tempFile = `./temp_${date}`;
        var found = false;
        var type;
        request(sub.url.toString())
            .on('response', function (response) {
            switch (response.headers['content-type']) {
                case 'application/x-rar-compressed':
                    type = 'rar';
                    break;
                case 'application/zip':
                default:
                    type = 'zip';
                    break;
            }
        })
            .pipe(fs.createWriteStream(tempFile))
            .on('close', function () {
            console.log(`File downloaded at ${tempFile}`);
            if (type === 'zip') {
                fs.createReadStream(tempFile)
                    .pipe(unzip.Parse())
                    .on('entry', entry => {
                    var fname = entry.path;
                    var ext = fname.split('.').pop();
                    var filename = sub.title.replace(' ', '.') + '.' + ext;
                    //
                    if (!found && entry.type === 'File' && (/\.(srt|ssa|sub|sbv|mpsub|lrc|cap)$/i).test(fname)) {
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
            }
            else if (type === 'rar') {
                var buf = Uint8Array.from(fs.readFileSync(tempFile)).buffer;
                var extractor = unrar.createExtractorFromData(buf);
                var downloadList = [];
                var list = extractor.getFileList();
                var i = 0;
                var suffix = '';
                var ext, filename;
                if (list[0].state === "SUCCESS" && list[1] !== null) {
                    list[1].fileHeaders.forEach((file) => {
                        if (!file.flags.directory) {
                            downloadList.push(file.name);
                        }
                    });
                }
                var extracted = extractor.extractFiles(downloadList);
                if (extracted[0].state === "SUCCESS") {
                    extracted[1].files.forEach(file => {
                        var buffer;
                        if (file.extract[0].state === "SUCCESS") {
                            buffer = file.extract[1];
                            if (i > 0) {
                                suffix = `.${i}`;
                            }
                            ext = file.fileHeader.name.split('.').pop();
                            filename = './' + sub.title.replace(/\s/g, '.') + suffix + '.' + ext;
                            i++;
                            //  // Uint8Array
                            fs.appendFileSync(filename, new Buffer(buffer));
                        }
                    });
                    del(tempFile);
                    console.log('finished!!!');
                }
            }
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