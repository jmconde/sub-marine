import Sub from "./subInterface";
import AuthDataInterface from "./authdataInterface";
import Metadata from "./metadataInterface";
import FileInfo from "./fileInfoInterface";
import Search from "./searchInterface";

interface OriginInterface {
  readonly authRequired: boolean;
  authenticate?(): Promise<any>;
  logout?(data: AuthDataInterface): Promise<any>;
  search(search: Search):  Promise<Sub[]>;
  download(sub: Sub, dest: string): Promise<any>;
}

export default OriginInterface;