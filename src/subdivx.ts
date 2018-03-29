import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import OriginInterface from "./originInterface";
import Sub from "./subInterface";
import * as cheerio from 'cheerio';

class SubdivxOrigin implements OriginInterface {
  private searchText: String;
  private actualPage: number;
  private readonly downloadUrl = 'http://www.subdivx.com/bajar.php?id=';
  private readonly subSelector = '#buscador_detalle';
  private readonly detalleSelector = '#buscador_detalle_sub';
  private readonly datosSelector = '#buscador_detalle_sub_datos';
  private readonly ratingImgSelector = 'img.detalle_calif';
  private readonly barraSelector = '#menu_detalle_buscador';
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

  private getPage(text: String): Promise<Sub[]> {
    return new Promise<Sub[]>((resolve, reject) => {
      axios.get(this.getUrl(text), {
        method: 'get'
      }).then((response) => {
        var $ = cheerio.load(response.data);
        var $subs = $('#buscador_detalle');
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

  private async lookup(text: String): Promise<Sub[]> {
    var found: Sub[] = [];
    var finished = false;
    var error = false;

    this.searchText = text;
    this.actualPage = 1;

    console.log('Searching...', text);

    while (!finished) {
      await new Promise<Sub[]>((resolve, reject) => {
        this.getPage(text).then((subs: Sub[]) => {
          console.log("length", subs.length);
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

    return Promise.resolve(found);

  }

  search(text: String):  Promise<Sub[]> {
    return this.lookup(text);
  }
}

export default SubdivxOrigin;