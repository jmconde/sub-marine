"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const chalk_1 = require("chalk");
const cheerio = require("cheerio");
const stringScore = require("string-score");
const commons_1 = require("../../utils/commons");
const logger_1 = require("../../utils/logger");
const origin_types_1 = require("../../utils/origin-types");
class SubdivxOrigin {
    constructor() {
        this.ID = origin_types_1.default.ORIGIN.SUBDIVX;
        this.log = logger_1.default.getInstance();
        this.downloadUrl = 'http://www.subdivx.com/bajar.php?id=';
        this.subSelector = '#buscador_detalle';
        this.detalleSelector = '#buscador_detalle_sub';
        this.datosSelector = '#buscador_detalle_sub_datos';
        this.ratingImgSelector = 'img.detalle_calif';
        this.barraSelector = '#menu_detalle_buscador';
        this.titleSelector = '#menu_titulo_buscador a.titulo_menu_izq';
        this.authRequired = false;
        this.RATING = {
            'img/calif0.gif': 0,
            'img/calif1.gif': 1,
            'img/calif2.gif': 2,
            'img/calif3.gif': 3,
            'img/calif4.gif': 4,
            'img/calif5.gif': 5
        };
    }
    //  #buscador_detalle_sub_datos a
    getUrl(text) {
        let page = this.actualPage;
        let textEncoded = encodeURIComponent(text.toString());
        return `https://www.subdivx.com/index.php?buscar=${textEncoded}&accion=5&pg=${page}`;
    }
    getScore(textToCompare, textToFind) {
        var fuzziness = 0.5;
        var total = 500;
        var score = stringScore(textToCompare, textToFind, fuzziness);
        return Math.round(score * total);
    }
    getPage(search) {
        return new Promise((resolve, reject) => {
            axios_1.default.get(this.getUrl(search.searchString), {}).then((response) => {
                var $ = cheerio.load(response.data);
                var $subs = $(this.subSelector);
                var subs = [];
                if ($subs.length === 0) {
                    reject("Zero");
                    return;
                }
                $subs.each((i, elem) => {
                    var sub;
                    var $elem = $(elem);
                    var $detalle = $elem.find(this.detalleSelector);
                    var $datos = $elem.find(this.datosSelector);
                    var $b = $datos.find('b');
                    var $a = $datos.find('a');
                    var $bar = $elem.prev(this.barraSelector);
                    var downloads, cds, format, dateUpload, rating, title;
                    if ($b.eq(1)[0]) {
                        var $cds = $($b.eq(1)[0].nextSibling);
                        cds = $cds.text() ? parseInt(new String($cds.text()).replace(',', '')) : 0;
                    }
                    else {
                        cds = null;
                    }
                    if (cds === null || cds === 1) {
                        if ($b.eq(0)[0]) {
                            var $dls = $($b.eq(0)[0].nextSibling);
                            downloads = $dls.text() ? parseInt(new String($dls.text()).replace(',', '')) : 0;
                        }
                        else {
                            downloads = null;
                        }
                        if ($b.eq(3)[0]) {
                            var $format = $($b.eq(3)[0].nextSibling);
                            format = $format.text() ? new String($format.text()).trim() : '';
                        }
                        else {
                            format = null;
                        }
                        if ($b.eq(5)[0]) {
                            var $date = $($b.eq(5)[0].nextSibling);
                            var date = new String($date.text()).trim().split('/');
                            dateUpload = new Date(Number(date[2]), Number(date[1]), Number(date[0]));
                        }
                        else {
                            dateUpload = null;
                        }
                        var $rating = $bar.find(this.ratingImgSelector);
                        rating = this.RATING[$rating.attr('src')] || null;
                        var description = $detalle.text();
                        var uploader = $a.eq(1).text();
                        var url = $a.eq(2).attr('href');
                        var score = this.getScore(title + ' ' + description + ' ' + format, search.searchString);
                        var lang = 'es';
                        var origin = 'SubDivX';
                        sub = {
                            description,
                            rating,
                            downloads,
                            format,
                            uploader,
                            dateUpload,
                            url,
                            score,
                            lang,
                            meta: search.metadata,
                            file: search.fileInfo,
                            origin
                        };
                        subs.push(sub);
                    }
                });
                // TODO:
                // if (tuneText && tuneText instanceof String && tuneText !== "") {
                //   this.log.debug('going to filter');
                //   subs.filter(d => {
                //     return true;
                //   })
                // }
                resolve(subs);
            });
        });
    }
    lookup(search) {
        return __awaiter(this, void 0, void 0, function* () {
            var found = [];
            var finished = false;
            var error = false;
            this.actualPage = 1;
            console.log(chalk_1.default.gray('SubdivX: Searching for ... ') + chalk_1.default.yellow(search.searchString));
            while (!finished) {
                yield new Promise((resolve, reject) => {
                    this.getPage(search).then((subs) => {
                        found = found.concat(subs);
                        this.actualPage++;
                        resolve();
                    }).catch((err) => {
                        if (err !== "Zero") {
                            error = true;
                        }
                        finished = true;
                        resolve();
                    });
                });
            }
            return Promise.resolve(found.sort(commons_1.default.sortSubFn));
        });
    }
    search(search) {
        var registry = search.registry.get(origin_types_1.default.ORIGIN.OPEN_SUBTITLES);
        if (!search || !search.searchString || search.searchString.trim() === '' || registry.indexOf(search.searchString) !== -1) {
            return Promise.resolve([]);
        }
        registry.push(search.searchString);
        return this.lookup(search);
    }
    download(sub, dest) {
        return null;
    }
}
exports.default = SubdivxOrigin;
//# sourceMappingURL=subdivx.js.map