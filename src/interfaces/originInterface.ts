import Sub from "./subInterface";
import AuthDataInterface from "./authdataInterface";

interface OriginInterface {
  readonly authRequired: boolean;
  authenticate?(): Promise<any>;
  logout?(data: AuthDataInterface): Promise<any>;
  search(meta):  Promise<Sub[]>;
  download(sub, dest): Promise<any>;
}

export default OriginInterface;