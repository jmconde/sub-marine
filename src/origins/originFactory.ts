import OriginInterface from '../interfaces/originInterface';
import SubdivxOrigin from './subdivx/subdivx';
import OpenSubtitlesOrigin from './opensubtitles/opensubtitles';
import TYPES from '../utils/origin-types';
import Logger from '../utils/logger';
import SubDBOrigin from './subdb/subdv';


class OriginFactory {
  private static log: Logger = Logger.getInstance();

  static getOrigin(type: String): OriginInterface {
    console.log('Getting origin...', type);
    switch(type) {
      case TYPES.ORIGIN.SUBDIVX:
        return new SubdivxOrigin();
      case TYPES.ORIGIN.OPEN_SUBTITLES:
        return new OpenSubtitlesOrigin('jose.conde@gmail.com', 'nevada98', 'en', 'TemporaryUserAgent');
      case TYPES.ORIGIN.SUBDB:
        return new SubDBOrigin();
      default:
        throw new Error(`Cannot find origin ${type}`)
    }
  }
}

export default OriginFactory;