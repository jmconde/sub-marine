import Metadata from "../../interfaces/metadataInterface";
import { isString, isFunction } from "util";

export default abstract class Mapper {
  abstract MAP_DEF: any;

  map (json: any, type: string): Metadata {
    var meta: Metadata = {};
    meta.type = type;

    for (const key in this.MAP_DEF) {
      if (this.MAP_DEF.hasOwnProperty(key)) {
        const value = this.MAP_DEF[key];
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