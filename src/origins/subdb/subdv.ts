import OriginInterface from "../../interfaces/originInterface";
import TYPES from "../../utils/origin-types";
import Search from "../../interfaces/searchInterface";
import Sub from "../../interfaces/subInterface";
import Axios from 'axios';

export default class SubDBOrigin implements OriginInterface {
  readonly ID = TYPES.ORIGIN.SUBDB;
  readonly authRequired = false;
  URL = 'http://api.thesubdb.com';

  search(search: Search):  Promise<Sub[]> {
    var registry = search.registry.get(TYPES.ORIGIN.SUBDB);
    var hash = search.fileInfo.hashes[TYPES.ORIGIN.SUBDB].hash;

    return new Promise<Sub[]>((resolve, reject) => {
      if (!hash ||registry.indexOf(hash.hash) !== -1) {
        resolve([]);
        return;
      }
      this.get({
        action: 'search',
        hash
      }).then(data => {

      })
    });
  }

  get(params: any): Promise<any> {
    return Axios.get(this.URL, {
      headers: {'User-Agent': 'SubDB/1.0 (Submarine/0.1; http://github.com/jmconde/sub-marine)'},
      responseType: 'json',
      params
    }).then(response => {
      return response.data;
    });
  }

  download(sub, dest): Promise<any> {
    return Promise.reject('Error');
  }
}