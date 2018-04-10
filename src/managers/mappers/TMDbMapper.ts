import Mapper from "./mapper";
import Metadata from "../../interfaces/metadataInterface";

export default class TMDbMapper extends Mapper {
  MAP_DEF = {
    plot: 'overview',
    rated: 'vote_average',
    year: d => (d.release_date && d.release_date.substring(0, 4)) || (d.first_air_date && d.first_air_date.substring(0, 4)),
    title: 'title',
    id: 'id',
    lang: 'original_language',
    imdbID: 'external_ids.imdb_id'
  };
}