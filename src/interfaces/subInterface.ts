import Metadata from "./metadataInterface";
import FileInfo from "./fileInfoInterface";

interface Sub {
  description?:string;
  rating?: Number;
  downloads?: Number;
  format?: string;
  uploader?: string;
  dateUpload?: Date;
  url?: string;
  lang?: string;
  score?: Number,
  origin?: string,
  group?: string,
  meta: Metadata,
  file: FileInfo
}

export default Sub;