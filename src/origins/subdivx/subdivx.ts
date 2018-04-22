import Axios from 'axios';
import chalk from 'chalk';
import * as cheerio from 'cheerio';
import * as stringScore from 'string-score';

import OriginInterface from '../../interfaces/originInterface';
import Search from '../../interfaces/searchInterface';
import Sub from '../../interfaces/subInterface';
import Commons from '../../utils/commons';
import Logger from '../../utils/logger';
import TYPES from '../../utils/origin-types';

class SubdivxOrigin implements OriginInterface {
  readonly ID = TYPES.ORIGIN.SUBDIVX;
  private log: Logger = Logger.getInstance();
  private searchText: String;
  private actualPage: number;
  private readonly downloadUrl = 'http://www.subdivx.com/bajar.php?id=';
  private readonly subSelector = '#buscador_detalle';
  private readonly detalleSelector = '#buscador_detalle_sub';
  private readonly datosSelector = '#buscador_detalle_sub_datos';
  private readonly ratingImgSelector = 'img.detalle_calif';
  private readonly barraSelector = '#menu_detalle_buscador';
  private readonly titleSelector = '#menu_titulo_buscador a.titulo_menu_izq';
  readonly authRequired = false;

  private readonly RATING = {
    'img/calif0.gif': 0,
    'img/calif1.gif': 1,
    'img/calif2.gif': 2,
    'img/calif3.gif': 3,
    'img/calif4.gif': 4,
    'img/calif5.gif': 5
  }
  //  #buscador_detalle_sub_datos a

  private getUrl (text: String) {
    let page: number = this.actualPage;
    let textEncoded = encodeURIComponent(text.toString());

    return `https://www.subdivx.com/index.php?buscar=${textEncoded}&accion=5&pg=${page}`;
  }

  private getScore(textToCompare: String, textToFind): Number {
    var fuzziness = 0.5;
    var total = 500;
    var score = stringScore(textToCompare, textToFind, fuzziness);
    return Math.round(score * total);
  }

  private getPage(search: Search): Promise<Sub[]> {
    return new Promise<Sub[]>((resolve, reject) => {
      Axios.get(this.getUrl(search.searchString), {}).then((response) => {
        var $ = cheerio.load(response.data);
        var $subs = $(this.subSelector);
        var subs: Sub[] = [];

        if ($subs.length === 0) {
          reject("Zero");
          return;
        }

        $subs.each((i, elem) => {
          var sub:Sub;
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
          } else {
            cds = null;
          }

          if (cds === null || cds === 1) {
            if ($b.eq(0)[0]) {
              var $dls = $($b.eq(0)[0].nextSibling);
              downloads = $dls.text() ? parseInt(new String($dls.text()).replace(',', '')) : 0;
            } else {
              downloads = null;
            }

            if ($b.eq(3)[0]) {
              var $format = $($b.eq(3)[0].nextSibling);
              format = $format.text() ? new String($format.text()).trim() : '';
            } else {
              format = null;
            }

            if ($b.eq(5)[0]) {
              var $date = $($b.eq(5)[0].nextSibling);
              var date = new String($date.text()).trim().split('/');
              dateUpload = new Date(Number(date[2]), Number(date[1]), Number(date[0]));
            } else {
              dateUpload = null;
            }

            var $rating = $bar.find(this.ratingImgSelector);
            rating = this.RATING[$rating.attr('src')] || null;

            var description = $detalle.text();
            var uploader = $a.eq(1).text();
            var url = $a.eq(2).attr('href');
            var score = this.getScore(title + ' ' + description + ' ' + format, search.searchString);
            var lang = 'es';
            var origin = 'SubDivX'


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

  private async lookup(search: Search): Promise<Sub[]> {
    var found: Sub[] = [];
    var finished = false;
    var error = false;

    this.actualPage = 1;

    console.log(chalk.gray('SubdivX: Searching for ... ') + chalk.yellow(search.searchString));

    while (!finished) {
      await new Promise<Sub[]>((resolve, reject) => {
        this.getPage(search).then((subs: Sub[]) => {
          found = found.concat(subs);
          this.actualPage++;
          resolve()
        }).catch((err) => {
          if (err !== "Zero") {
            error = true;
          }
          finished = true;
          resolve();
        });
      });
    }
    return Promise.resolve(found.sort(Commons.sortSubFn));
  }


  search(search: Search):  Promise<Sub[]> {
    var registry = search.registry.get(TYPES.ORIGIN.SUBDIVX);

    // SubDivX only has Spanish subtitles.
    if (search.langs.indexOf('es') === -1) {
      return Promise.resolve([]);
    }

    // No Search String or already searched.
    if (!search || !search.searchString || search.searchString.trim() === '' || registry.indexOf(search.searchString) !== -1) {
      return Promise.resolve<Sub[]>([]);
    }

    registry.push(search.searchString);

    return this.lookup(search);
  }

  download(sub, dest): Promise<void> {
    return null;
  }
}

export default SubdivxOrigin;