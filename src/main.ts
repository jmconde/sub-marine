import * as cheerio from 'cheerio';
import OriginFactory from './factory';
import OriginInterface from './interfaces/originInterface';
import * as http from 'http';
import * as fs from 'fs';
import Sub from './interfaces/subInterface';
import * as request from 'request';
import * as unzip from 'unzip';
import * as del from 'del';

class SubMarine {
  public text: string;
  static readonly ORIGINS = {
    SUBDIVX: 'subdivx'
  };

  get(originType: String, textToSearch: String, tuneText?: String) {
    let origin: OriginInterface = OriginFactory.getOrigin(originType);
    return origin.search(textToSearch, tuneText);
  }

  download(sub: Sub) {

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
            var ext = fname.split('.').pop()
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
            } else {
              entry.autodrain();
            }
          }).on('close', function () {
            del(tempFile)
            console.log('finished!!!');
          });
      });
    // var request = http.get(sub.url.toString() , function(response) {
    //   response.pipe(file);
    // });
  }
}

export default SubMarine;