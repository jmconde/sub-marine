"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const opensubtitle_auth_1 = require("./opensubtitle-auth");
const opensubtitlesManager_1 = require("./opensubtitlesManager");
const chalk_1 = require("chalk");
const logger_1 = require("../../utils/logger");
const matadataStore_1 = require("../../utils/matadataStore");
class OpenSubtitlesOrigin {
    constructor(username, password, lang, agent) {
        this.ENDPOINT = 'https://api.opensubtitles.org/xml-rpc';
        this.authRequired = true;
        this.log = logger_1.default.Instance;
        this.store = matadataStore_1.default.Instance;
        this.setAuthData(username, password, lang, agent);
        this.manager = new opensubtitlesManager_1.default(this.auth);
    }
    search(meta) {
        var normalize = num => new String(100 + num).substring(1);
        var OMDBMeta;
        return new Promise((resolve, reject) => {
            console.log(chalk_1.default.gray('Searching for ... ') + chalk_1.default.yellow(`${meta.title} ${meta.season} ${meta.episode}`));
            if (!meta.imdbID) {
                OMDBMeta = this.store.get('omdb');
                meta.imdbID = OMDBMeta.imdbID;
            }
            this.manager.call('SearchSubtitles', [{ sublanguageid: 'spa, eng', imdbid: meta.imdbID.substring(2) }])
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