import OriginInterface from './interfaces/originInterface';
import SubdivxOrigin from './origins/subdivx/subdivx';
import OpenSubtitlesOrigin from './origins/opensubtitles/opensubtitles';
import TYPES from './origins/origin-types';


class OriginFactory {
  static getOrigin(type: String): OriginInterface {
    console.log('Getting origin...', type);
    switch(type) {
      case TYPES.ORIGIN.SUBDIVX:
        return new SubdivxOrigin();
      case TYPES.ORIGIN.OPEN_SUBTITLES:
        return new OpenSubtitlesOrigin('jose.conde@gmail.com', 'nevada98', 'en', 'TemporaryUserAgent');
      default:
        throw new Error(`Cannot find origin ${type}`)
    }
  }
}

export default OriginFactory;