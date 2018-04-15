# <img alt="SubMarine" src="https://raw.githubusercontent.com/jmconde/samples/master/submarine.svg?sanitize=true" width="50" height="50" style="float: left;margin-right: 10px;margin-top: -8px;" /> SubMarine
`v0.3.0`


Is not just another subtitle downloader, SubMarine intends to provide a common interface to download subtitle from different sources.

Experimental. Search for media file metadata from different sources (OMDB, TMDb, TVMaze) and search for the best matched subtitles in different subtitles databases.

## Installing client
```
npm i @jose.conde/submarine -g

submarine search
```

## Definitions
This is the class SubMarine definition:

```javascript
class SubMarine {
  // Gets list of subtitle objects available for the file in the path.
  async get(originTypes: string[], filepath: string, langs: string[]): Promise<Sub[]> { ... }

  // Download a subtitle in the specified path
  async download(subs: Sub | Sub[], path?: string): Promise<void> { ... }
}
```

Example:
```javascript
import SubMarine from "./main";

var submarine = new SubMarine();

submarine.get([SubMarine.ORIGINS.SUBDIVX], '/path/to/file', ['es', 'ru', 'en'])
  .then(subs => {
    console.log("Total length: ", subs.length);

    submarine.download(sub[subs.length - 1], '/path/to/save') // download(sub: Sub, path: string = './')
    .then(() => {
      // File(s) saved!
    })
  });
```