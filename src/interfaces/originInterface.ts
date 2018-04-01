import Sub from "./subInterface";
import AuthDataInterface from "./authdataInterface";
import Metadata from "./metadata";

interface OriginInterface {
  readonly authRequired: boolean;
  authenticate?(): Promise<any>;
  logout?(data: AuthDataInterface): Promise<any>;
  search(meta: Metadata, langs: string[]):  Promise<Sub[]>;
  download(sub: Sub, dest: string): Promise<any>;
}

export default OriginInterface;