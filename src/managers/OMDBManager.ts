import Manager from "./manager";
import Metadata from "../interfaces/metadata";
import chalk from "chalk";

export default class OMDBManager extends Manager {
  URL = 'http://www.omdbapi.com';
  API_KEY = 'omdb';

  async get(path: string = '', query: any,  meta?: Metadata): Promise<Metadata> {
    return super.get(path, meta).then(json => {
      console.log(json);

      return Promise.reject<Metadata>('Error!');
    });
  }

  check(json): number {
    return json.Response === 'True' ? 0 : 1;
  }

  fill(meta: Metadata): Promise<Metadata> {
    console.log(chalk.grey('getting metadata from OMDB...'));
    var promise;
    console.log(meta.type);
    if (meta.type === 'movie') {
      promise = this.getMovie(meta);
    } else if (meta.type === 'series') {
      promise = this.getSeries(meta)
        .then(meta => this.getEpisode(meta));
    } else {
      Promise.reject<Metadata>('No type');
    }

    return promise;
  }

  getMovie(meta: Metadata): Promise<Metadata> {
    var qParams = {
      t: encodeURIComponent(meta.title),
      type: 'movie'
    };

    return this.get('/', qParams, meta);
  }

  getSeries(meta: Metadata): Promise<Metadata> {
    var qParams = {
      t: encodeURIComponent(meta.title),
      type: 'series'
    };

    return this.get('/', qParams, meta);
  }

  getEpisode(meta: Metadata): Promise<Metadata> {
    var qParams = {
      t: encodeURIComponent(meta.title),
      type: 'episode',
      Season: meta.season,
      Episode: meta.episode
    };

    return this.get('/', qParams, meta);
  }

  mapper(response: any): Metadata {
    var meta: Metadata = {};
    var r = response;

    meta.title = r.Title;
    meta.year = r.Year;
    meta.rated = r.Rated;
    meta.released = r.Released;
    meta.genre = r.Genre;
    meta.plot = r.Plot;
    meta.runtime = r.Runtime;
    meta.imdbID = r.imdbID;
    meta.id = r.seriesID;
    meta.metascore = r.Metascore;
    meta.poster = r.Poster;
    meta.type = r.Type;
    meta.production = r.Production;

    return meta;
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