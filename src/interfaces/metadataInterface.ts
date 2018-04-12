import Sub from "./subInterface";
import FileInfo from "./fileInfoInterface";

export default interface Metadata {
  genre?:string;
  id?: string;
  imdbID?: string;
  lang?: string;
  metascore?: string;
  path?: string;
  plot?: string;
  poster?: string;
  production?: string;
  rated?: string;
  released?:string;
  runtime?: string;
  search?: string;
  season?: number,
  episode?: number;
  episodeData?: Metadata;
  title?: string;
  type?: string;
  year?: string;
  source?: string;
}