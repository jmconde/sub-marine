import Mapper from "./mapper";
import Metadata from "../../interfaces/metadataInterface";

export default class OMDBMapper extends Mapper {

  constructor() {
    super();
    this.add('MOVIE', {
      title: 'Title',
      year: 'Year',
      rated: 'Rated',
      released: 'Released',
      runtime: 'Runtime',
      genre: 'Genre',
      plot: 'Plot',
      imdbID: 'imdbID',
      metascore: 'Metascore',
      poster: 'Poster',
      type: 'Type',
      production: 'Production',
      source: () => 'omdb'
    });
    this.add('SERIES', {
      title: 'Title',
      year: 'Year',
      rated: 'Rated',
      released: 'Released',
      genre: 'Genre',
      plot: 'Plot',
      runtime: 'Runtime',
      imdbID: 'imdbID',
      metascore: 'Metascore',
      poster: 'Poster',
      type: 'Type',
      source: () => 'omdb'
    });
    this.add('EPISODE', {
      title: 'Title',
      year: 'Year',
      rated: 'Rated',
      released: 'Released',
      season: 'Season',
      episode: 'Episode',
      genre: 'Genre',
      plot: 'Plot',
      runtime: 'Runtime',
      imdbID: 'imdbID',
      metascore: 'Metascore',
      poster: 'Poster',
      type: 'Type',
      source: () => 'omdb'
    });
  }
}
