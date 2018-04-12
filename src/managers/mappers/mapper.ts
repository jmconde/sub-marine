import Metadata from "../../interfaces/metadataInterface";
import { isString, isFunction } from "util";

export default abstract class Mapper {
  abstract DEFAULT: any;


  map (json: any, type: string): Metadata {
    var meta: Metadata = {};
    var typeDef = (type  && this[`${type.toUpperCase()}`]) || this.DEFAULT;

    for (const key in typeDef) {
      if (typeDef.hasOwnProperty(key)) {
        const value = typeDef[key];
        if (isString(value)) {
          this.add(meta, key, this.find(value, json));
        } else if (isFunction(value)) {
          this.add(meta, key, value(json));
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

  private add(meta: Metadata, field: string, value: string) {
    if (value) {
      meta[field] = value;
    }
  }
}