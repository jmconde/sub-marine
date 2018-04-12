import ApiManager from "./apiManager";
import Metadata from "../interfaces/metadataInterface";
import Mapper from "./mappers/mapper";
import TVMazeMapper from "./mappers/TVMazeMapper";
import FileInfo from "../interfaces/fileInfoInterface";
import TYPES from "../utils/origin-types";
import chalk from "chalk";

export default class TVMazeManager extends ApiManager {
  ID = 'tvmaze';
  URL = 'http://api.tvmaze.com';

  mapper: Mapper = new TVMazeMapper();

  fill(info: FileInfo): Promise<Metadata> {
    console.log(chalk.grey('getting metadata from TVMaze...'));
    if (info.type === TYPES.FILE.EPISODE) {
      return this.find(info);
    }
    return Promise.resolve(null);
  }

  find(info: FileInfo): Promise<Metadata> {
    var path = '/search/shows';
    var q = {
      q: info.title
    };

    return new Promise<Metadata>((resolve, reject) => {
      var showType = info.type === TYPES.FILE.MOVIE ? TYPES.FILE.MOVIE : TYPES.FILE.SERIES;

      this.list(path, q, showType)
        .then(list => list[0])
        .then((showMeta: Metadata) => this.getEpisode(showMeta.id, info.season, info.episode)
          .then(episodeMeta => {
            showMeta.season = episodeMeta.season;
            showMeta.episode = episodeMeta.episode;
            showMeta.episodeData = episodeMeta;

            resolve(showMeta);
          })
        );
    });
  }

  getEpisode(id: string, season: number, episode: number): Promise<Metadata> {
    var path = '/shows/{id}/episodebynumber';
    var pathData = {
      id
    }
    var q = {
      season,
      number: episode
    }

    return this.get(this.getPath(path, pathData), q, TYPES.FILE.EPISODE);
  }


  check(json): number {
    return (!json || json.length === 0) ? 1 : 0;
  }
}