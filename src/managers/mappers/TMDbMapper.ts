import Mapper from "./mapper";
import Metadata from "../../interfaces/metadataInterface";
import TYPES from "../../utils/origin-types";

export default class TMDbMapper extends Mapper {
  constructor() {
    super();
    this.add('MOVIE', {
      plot: 'overview',
      rated: 'vote_average',
      year: d => (d.release_date && d.release_date.substring(0, 4)) || (d.first_air_date && d.first_air_date.substring(0, 4)),
      title: 'title',
      id: 'id',
      lang: 'original_language',
      imdbID: 'external_ids.imdb_id',
      source: () => 'tmdb',
      type: () => TYPES.FILE.MOVIE
    });
    this.add('SERIES', {
      id: 'id',
      title: 'name',
      poster: 'poster_path',
      plot: 'overview',
      released: 'first_air_date',
      lang: 'original_language',
      // rated: 'vote_average',
      year: d => (d.first_air_date && d.first_air_date.substring(0, 4)),
      source: () => 'tmdb',
      type: () => TYPES.FILE.SERIES
    });
    this.add('EPISODE', {
      plot: 'overview',
      rated: 'vote_average',
      year: d => (d.release_date && d.release_date.substring(0, 4)) || (d.first_air_date && d.first_air_date.substring(0, 4)),
      title: 'title',
      id: 'id',
      lang: 'original_language',
      imdbID: 'external_ids.imdb_id',
      source: () => 'tmdb',
      type: () => TYPES.FILE.EPISODE
    });
  }
}