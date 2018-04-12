import Metadata from "./metadataInterface";
import FileInfo from "./fileInfoInterface";

export default interface Manager {
  ID:string;
  fill(info: FileInfo): Promise<Metadata>;
}