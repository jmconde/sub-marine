"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const opensubtitle_auth_1 = require("./opensubtitle-auth");
const opensubtitlesManager_1 = require("./opensubtitlesManager");
const chalk_1 = require("chalk");
const logger_1 = require("../../utils/logger");
const origin_types_1 = require("../../utils/origin-types");
class OpenSubtitlesOrigin {
    constructor(username, password, lang, agent) {
        this.ID = origin_types_1.default.ORIGIN.OPEN_SUBTITLES;
        this.ENDPOINT = 'https://api.opensubtitles.org/xml-rpc';
        this.authRequired = true;
        this.log = logger_1.default.getInstance();
        this.setAuthData(username, password, lang, agent);
        this.manager = new opensubtitlesManager_1.default(this.auth);
    }
    search(search) {
        var meta = search.metadata;
        var OMDBMeta;
        var registry = search.registry.get(origin_types_1.default.ORIGIN.OPEN_SUBTITLES);
        return new Promise((resolve, reject) => {
            var imdbId;
            if (meta.type === origin_types_1.default.FILE.EPISODE && meta.episodeData && meta.episodeData.imdbID) {
                imdbId = meta.episodeData.imdbID;
            }
            else if (meta.type === origin_types_1.default.FILE.MOVIE && meta.imdbID) {
                imdbId = meta.imdbID;
            }
            this.log.cInfo(logger_1.default.GREEN_BRIGHT, meta);
            if (!imdbId) {
                console.log(chalk_1.default.gray('OpenSubtitles: No Episode or Movie IMDB ID.'));
                resolve([]);
                return;
            }
            else if (registry.indexOf(imdbId) !== -1) {
                resolve([]);
                return;
            }
            console.log(chalk_1.default.gray('Opensubtitles: Searching for ... ') + chalk_1.default.yellow(`${search.searchString} - IMDB ID: ${imdbId}`));
            registry.push(meta.imdbID);
            this.manager.call('SearchSubtitles', [{ sublanguageid: 'spa, eng', imdbid: imdbId.substring(2) }])
                .then(response => {
                if (response.status === '200 OK') {
                    resolve(response.data.map(d => {
                        var sub = {
                            description: '',
                            rating: Number(d.MovieImdbRating),
                            downloads: Number(d.SubDownloadsCnt),
                            format: d.InfoFormat,
                            uploader: d.UserID,
                            group: d.InfoReleaseGroup,
                            dateUpload: new Date(d.SubAddDate),
                            url: d.ZipDownloadLink,
                            lang: d.ISO639,
                            score: 0,
                            meta: meta,
                            file: search.fileInfo,
                            origin: 'opensubtitles.org'
                        };
                        return sub;
                    }));
                }
                else {
                    reject(response.status);
                }
            }).catch(err => reject(err));
        });
    }
    download(sub, dest) {
        return Promise.reject('Error');
    }
    setAuthData(username, password, lang, agent) {
        this.auth = new opensubtitle_auth_1.default(username, password, lang, agent);
    }
    authenticate() {
        if (!this.auth) {
            Promise.reject('No auth data.');
            return;
        }
        return this.manager.call('LogIn', this.auth.getAuthData(), true)
            .then(data => {
            this.auth.authenticated = true;
            this.auth.token = data.token;
            this.auth.setRaw(data);
        });
    }
}
exports.default = OpenSubtitlesOrigin;
//# sourceMappingURL=opensubtitles.js.map