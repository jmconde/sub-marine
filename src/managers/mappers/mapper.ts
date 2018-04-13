import Metadata from "../../interfaces/metadataInterface";
import Logger from '../../utils/logger';
import { isString, isFunction } from "util";

export default abstract class Mapper {
  protected MAPS: Map<string, any> = new Map();

  protected log = Logger.getInstance();

  map (json: any, type: string): Metadata {
    var meta: Metadata = {};
    var typeDef = this.MAPS.get(type.toUpperCase());

    if (!typeDef) {
      this.log.cError(Logger.RED_BRIGHT, `No map defined for ${type} in mapper.`)
    }

    for (const key in typeDef) {
      if (typeDef.hasOwnProperty(key)) {
        const value = typeDef[key];
        if (isString(value)) {
          this.setValue(meta, key, this.find(value, json));
        } else if (isFunction(value)) {
          this.setValue(meta, key, value(json));
        }
      }
    }

    return meta;
  }

  private find(path: string, obj: any) {
    var arr: string[];
    var actual: any = Object.assign({}, obj);
    if (!path || !obj) {return;}

    arr = path.split('.');

    arr.forEach((s) => {
      if (actual) {
        actual = actual[s];
      }
    });

    return actual;
  }

  private setValue(meta: Metadata, field: string, value: string) {
    if (value) {
      meta[field] = value;
    }
  }

  add(key: string, value: any) {
    this.MAPS.set(key, value);
  }
}