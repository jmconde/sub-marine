import * as cheerio from 'cheerio';
import OriginFactory from './factory';
import OriginInterface from './originInterface';

class SubMarine {
  public text: string;
  static readonly ORIGINS = {
    SUBDIVX: 'subdivx'
  };

  constructor() {
    console.log('Test');
    this.text = ' Test text ';
  }

  get(originType, textToSearch, destination) {
    let origin: OriginInterface = OriginFactory.getOrigin(originType);
    return origin.search(textToSearch);
  }
}

export default SubMarine;