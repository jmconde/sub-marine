import Metadata from "./metadataInterface";

export default interface Manager {
  ID:string;
  fill(meta: Metadata): Promise<Metadata>;
}