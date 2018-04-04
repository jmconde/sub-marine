import Metadata from "./metadata";

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
  meta?: Metadata
}

export default Sub;