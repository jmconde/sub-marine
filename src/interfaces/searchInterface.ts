import FileInfo from "./fileInfoInterface";
import Metadata from "./metadataInterface";

export default interface Search {
  searchString: string;
  langs: string[]
  fileInfo: FileInfo;
  metadata: Metadata;
}