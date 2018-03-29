import SubMarine from './main';
import OriginInterface from './originInterface';
import SubdivxOrigin from './subdivx';


class OriginFactory {
  static getOrigin(type: String): OriginInterface {
    console.log('Getting origin...', type);
    switch(type) {
      case SubMarine.ORIGINS.SUBDIVX:
        return new SubdivxOrigin();
      default:
        throw new Error(`Cannot find origin ${type}`)
    }
  }
}

export default OriginFactory;