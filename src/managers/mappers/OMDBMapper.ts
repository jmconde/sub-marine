import Mapper from "./mapper";
import Metadata from "../../interfaces/metadataInterface";

export default class OMDBMapper extends Mapper {
  MAP_DEF = {
    title: 'Title',
    year: 'Year',
    rated: 'Rated',
    released: 'Released',
    genre: 'Genre',
    plot: 'Plot',
    runtime: 'Runtime',
    imdbID: 'imdbID',
    id: 'seriesID',
    metascore: 'Metascore',
    poster: 'Poster',
    type: 'Type',
    production: 'Production'
  };
}
