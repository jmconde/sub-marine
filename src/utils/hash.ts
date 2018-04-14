import { createHash } from 'crypto';
import { close, createReadStream, open, read, readFile, readSync, stat } from 'fs';
import { deflate } from 'zlib';

export default class HashUtil {

    // opens the file, gzip the content and base64 encode it
    static computeSubContent(path): Promise<any> {
        return new Promise((resolve, reject) => {
            readFile(path, (err, data) => {
                if (err) return reject(err)
                deflate(data, (err, buffer) => {
                    if (err) return reject(err)
                    resolve(buffer.toString('base64'))
                })
            })
        })
    }

    // get md5 of a file
    static computeMD5(path): Promise<any> {
        return new Promise((resolve, reject) => {
            let hash = createHash('md5')

            createReadStream(path)
                .on('data', data => hash.update(data, 'utf8'))
                .on('end', () => resolve(hash.digest('hex'))) // md5 checksum
                .on('error', reject)
        })
    }
    static subdbHash(path): Promise<any> {
      return new Promise((resolve, reject) => {
        // get first 64kb
        // get last 64kb
        // md5 everything

        var file_size = 0;
        var chunk_size = 65536;
        var buf = new Buffer(chunk_size*2);
        var b_read = 0;

        stat(path, function(err, stat){
          if(err) return reject(err);

          file_size = stat.size;

          open(path, 'r', function(err, fd) {
            if(err) return reject(err);

            var t_offsets = [0, file_size-chunk_size];
            for(var i in t_offsets) {
              b_read = readSync(fd, buf, b_read, chunk_size, t_offsets[i]);
            }

            var md5sum = createHash('md5');
            md5sum.update(buf);
            var d = md5sum.digest('hex');

            resolve({
              hash: d,
              bytesize: file_size
            });
          });
        });
      });
    };

    static openSubtitlesHash(path): Promise<any> {
        // based on node-opensubtitles-api, under MIT - Copyright (c) 2015 ka2er

        return new Promise((resolve, reject) => {
            // get file size, first 64kb, last 64kb and summup everything
            let chunk_size = 65536 //64 * 1024
            let buf_start = new Buffer(chunk_size * 2)
            let buf_end = new Buffer(chunk_size * 2)
            let file_size = 0
            let checksum
            let array_checksum = Array()

            const checksumReady = checksum_part => {
                array_checksum.push(checksum_part)
                if (array_checksum.length === 3) {
                    checksum = this.sumHex64bits(array_checksum[0], array_checksum[1])
                    checksum = this.sumHex64bits(checksum, array_checksum[2])
                    checksum = checksum.substr(-16)

                    resolve({
                        hash: this.padLeft(checksum, '0', 16),
                        bytesize: file_size
                    })
                }
            }

            stat(path, (err, stat) => {
                if (err) return reject(err)

                file_size = stat.size

                checksumReady(file_size.toString(16))

                open(path, 'r', (err, fd) => {
                    if (err) return reject(err)

                    read(fd, buf_start, 0, chunk_size * 2, 0, (er1, bytesRead, buf1) => {
                        read(fd, buf_end, 0, chunk_size * 2, file_size - chunk_size, (er2, bytesRead, buf2) => {
                            close(fd, er3 => {
                                if (er1 || er2) return reject(er1 || er2) //er3 is not breaking
                                checksumReady(this.checksumBuffer(buf1, 16))
                                checksumReady(this.checksumBuffer(buf2, 16))
                            })
                        })
                    })
                })
            })
        })
    }

    // read 64 bits from buffer starting at offset as LITTLE ENDIAN hex
    private static read64LE(buffer, offset) {
        const ret_64_be = buffer.toString('hex', offset * 8, ((offset + 1) * 8))
        const array = Array()
        for (let i = 0; i < 8; i++) {
            array.push(ret_64_be.substr(i * 2, 2))
        }
        array.reverse()
        return array.join('')
    }

    // compute checksum of the buffer splitting by chunk of lengths bits
    private static checksumBuffer(buf, length) {
        let checksum: string = '';
        let checksum_hex: string = '';
        for (let i = 0; i < (buf.length / length); i++) {
            checksum_hex = this.read64LE(buf, i)
            checksum = this.sumHex64bits(checksum, checksum_hex).substr(-16)
        }
        return checksum
    }

    // calculate hex sum between 2 64bits hex numbers
    private static sumHex64bits(n1, n2) {
        if (n1.length < 16) n1 = this.padLeft(n1, '0', 16)
        if (n2.length < 16) n2 = this.padLeft(n2, '0', 16)

        // 1st 32 bits
        let n1_0 = n1.substr(0, 8)
        let n2_0 = n2.substr(0, 8)
        let i_0 = parseInt(n1_0, 16) + parseInt(n2_0, 16)

        // 2nd 32 bits
        let n1_1 = n1.substr(8, 8)
        let n2_1 = n2.substr(8, 8)
        let i_1 = parseInt(n1_1, 16) + parseInt(n2_1, 16)

        // back to hex
        let h_1 = i_1.toString(16)
        let i_1_over = 0
        if (h_1.length > 8) {
            i_1_over = parseInt(h_1.substr(0, h_1.length - 8), 16)
        } else {
            h_1 = this.padLeft(h_1, '0', 8)
        }

        let h_0 = (i_1_over + i_0).toString(16)

        return h_0 + h_1.substr(-8)
    }

    // pad left with c up to length characters
    private static padLeft(str, c, length) {
        while (str.length < length) {
            str = c.toString() + str
        }
        return str
    }
}