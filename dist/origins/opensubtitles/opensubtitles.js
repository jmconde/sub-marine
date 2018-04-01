"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const opensubtitle_auth_1 = require("./opensubtitle-auth");
const opensubtitlesManager_1 = require("./opensubtitlesManager");
class OpenSubtitlesOrigin {
    constructor(username, password, lang, agent) {
        this.ENDPOINT = 'https://api.opensubtitles.org/xml-rpc';
        this.authRequired = true;
        this.setAuthData(username, password, lang, agent);
        this.manager = new opensubtitlesManager_1.default(this.auth);
    }
    search(meta) {
        var normalize = num => new String(100 + num).substring(1);
        return new Promise((resolve, reject) => {
            this.manager.call('SearchSubtitles', [{ sublanguageid: 'spa', imdbid: meta.imdbID.substring(2) }])
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