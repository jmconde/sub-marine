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
const cheerio = require("cheerio");
class SubdivxOrigin {
    constructor() {
        this.downloadUrl = 'http://www.subdivx.com/bajar.php?id=';
        this.subSelector = '#buscador_detalle';
        this.detalleSelector = '#buscador_detalle_sub';
        this.datosSelector = '#buscador_detalle_sub_datos';
        this.ratingImgSelector = 'img.detalle_calif';
        this.barraSelector = '#menu_detalle_buscador';
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
    getPage(text) {
        return new Promise((resolve, reject) => {
            axios_1.default.get(this.getUrl(text), {
                method: 'get'
            }).then((response) => {
                var $ = cheerio.load(response.data);
                var $subs = $('#buscador_detalle');
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
                    var $dls = $($b.eq(0)[0].nextSibling);
                    var dls = $dls.text() ? parseInt(new String($dls.text()).replace(',', '')) : 0;
                    var $format = $($b.eq(3)[0].nextSibling);
                    var format = $format.text() ? new String($format.text()).trim() : '';
                    var $date = $($b.eq(5)[0].nextSibling);
                    var date = new String($date.text()).trim();
                    var uploader = $a.eq(1).text();
                    var url = $a.eq(2).attr('href');
                    var $rating = $elem.prev(this.barraSelector).find(this.ratingImgSelector);
                    var rating = this.RATING[$rating.attr('src')] || 0;
                    sub = {
                        description: $detalle.text(),
                        rating: rating,
                        downloads: dls,
                        format: format,
                        uploader: uploader,
                        dateUpload: new Date(date),
                        url: url
                    };
                    subs.push(sub);
                    resolve(subs);
                });
            });
        });
    }
    lookup(text) {
        return __awaiter(this, void 0, void 0, function* () {
            var found = [];
            var finished = false;
            var error = false;
            this.searchText = text;
            this.actualPage = 1;
            console.log('Searching...', text);
            while (!finished) {
                yield new Promise((resolve, reject) => {
                    this.getPage(text).then((subs) => {
                        console.log("length", subs.length);
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
            return Promise.resolve(found);
        });
    }
    search(text) {
        return this.lookup(text);
    }
}
exports.default = SubdivxOrigin;
//# sourceMappingURL=subdivx.js.map