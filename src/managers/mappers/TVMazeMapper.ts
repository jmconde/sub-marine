import Mapper from "./mapper";
import Metadata from "../../interfaces/metadataInterface";

export default class TVMazeMapper extends Mapper {
  constructor() {
    super();
    this.add('SERIES', {
      plot: 'show.summary',
      // rated: 'vote_average',
      // year: d => (d.premiered && d.release_date.substring(0, 4)) || (d.first_air_date && d.first_air_date.substring(0, 4)),
      title: 'show.name',
      episodeTitle: '',
      id: 'show.id',
      lang: 'show.language',
      imdbID: 'show.externals.imdb',
      source: () => 'tvmaze'
    });
    this.add('EPISODE', {
      id: 'id',
      episodeTitle: 'name',
      season: 'season',
      episode: 'number',
      runtime: 'runtime',
      source: () => 'tvmaze'
    })
  }
}