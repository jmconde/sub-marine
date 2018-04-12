import Metadata from "./metadataInterface";
import FileInfo from "./fileInfoInterface";

interface Sub {
  description?:String;
  rating?: Number;
  downloads?: Number;
  format?: String;
  uploader?: String;
  dateUpload?: Date;
  url?: String;
  lang?: String;
  score?: Number,
  origin?: string,
  group?: string,
  meta: Metadata,
  file: FileInfo
}

export default Sub;