import ApiManager from "./apiManager";
import Metadata from "../interfaces/metadataInterface";
import chalk from "chalk";
import OMDBMapper from "./mappers/OMDBMapper";
import TYPES from "../utils/origin-types";
import FileInfo from "../interfaces/fileInfoInterface";
import Logger from "../utils/logger";

export default class OMDBManager extends ApiManager {
  ID = 'omdb';
  URL = 'http://www.omdbapi.com';
  mapper = new OMDBMapper();

  MOVIE = 'movie';
  RESPONSE_OK = 'True';

  // async get(path: string = '', query: any,  meta?: Metadata): Promise<Metadata> {
  //   return super.get(path, query, meta).then(json => {
  //     return Promise.reject<Metadata>('Error!');
  //   });
  // }

  check(json): number {
    return json.Response === this.RESPONSE_OK ? 0 : 1;
  }

  fill(info: FileInfo): Promise<Metadata> {
    console.log(chalk.grey('getting metadata from OMDB...'));
    this.log.cDebug(Logger.BLUE_BRIGHT, TYPES.FILE.EPISODE)
    this.log.cDebug(Logger.BLUE_BRIGHT, info)
    if (info.type === TYPES.FILE.MOVIE) {
      return this.getMovie(info.title);
    } else if (info.type === TYPES.FILE.EPISODE) {
      return this.getSeries(info.title)
        .then(seriesMeta => {
          return this.getEpisode(info.title, info.season, info.episode).then(episodeMeta => {
            seriesMeta.episodeData = episodeMeta;

            return seriesMeta;
          })
        });
    } else {
      return Promise.reject<Metadata>('OMDB: No type');
    }
  }

  getMovie(title: string): Promise<Metadata> {
    var qParams = {
      t: title,
      type: 'movie'
    };

    return this.get('/', qParams, TYPES.FILE.MOVIE);
  }

  getSeries(title: string): Promise<Metadata> {
    var qParams = {
      t: title,
      type: 'series'
    };

    return this.get('/', qParams, TYPES.FILE.SERIES);
  }

  getEpisode(title: string, season: number, episode: number): Promise<Metadata> {
    var qParams = {
      t: title,
      type: 'episode',
      Season: season,
      Episode: episode
    };

    return this.get('/', qParams, TYPES.FILE.SERIES);
  }
}
/*
{
    "Title": "Cars",
    "Year": "2006",
    "Rated": "G",
    "Released": "09 Jun 2006",
    "Runtime": "117 min",
    "Genre": "Animation, Comedy, Family",
    "Director": "John Lasseter, Joe Ranft(co-director)",
    "Writer": "John Lasseter (original story by), Joe Ranft (original story by), Jorgen Klubien (original story by), Dan Fogelman (screenplay by), John Lasseter (screenplay by), Joe Ranft (screenplay by), Kiel Murray (screenplay by), Phil Lorin (screenplay by), Jorgen Klubien (screenplay by), Steve Purcell (additional screenplay material)",
    "Actors": "Owen Wilson, Paul Newman, Bonnie Hunt, Larry the Cable Guy",
    "Plot": "A hot-shot race-car named Lightning McQueen gets waylaid in Radiator Springs, where he finds the true meaning of friendship and family.",
    "Language": "English, Italian, Japanese, Yiddish",
    "Country": "USA",
    "Awards": "Nominated for 2 Oscars. Another 27 wins & 28 nominations.",
    "Poster": "https://ia.media-imdb.com/images/M/MV5BMTg5NzY0MzA2MV5BMl5BanBnXkFtZTYwNDc3NTc2._V1_SX300.jpg",
    "Ratings": [
        {
            "Source": "Internet Movie Database",
            "Value": "7.2/10"
        },
        {
            "Source": "Rotten Tomatoes",
            "Value": "74%"
        },
        {
            "Source": "Metacritic",
            "Value": "73/100"
        }
    ],
    "Metascore": "73",
    "imdbRating": "7.2",
    "imdbVotes": "300,810",
    "imdbID": "tt0317219",
    "Type": "movie",
    "DVD": "07 Nov 2006",
    "BoxOffice": "$244,052,771",
    "Production": "Buena Vista",
    "Website": "http://www.carsthemovie.com",
    "Response": "True"
}
*/