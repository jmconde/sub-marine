# <img alt="SubMarine" src="https://raw.githubusercontent.com/jmconde/samples/master/submarine.svg?sanitize=true" width="50" height="50" /> SubMarine
`v0.1.0`


Is not just another subtitle downloader, SubMarine intends to provide a common interface to download subtitle from different sources.

For now it just have an interface to access SubDivX a latin (spanish) popular subtitles download site but more sources are going to be added in the future if I have time of course. =P

This is the class SubMarine definition:

```javascript
class SubMarine {
  // Gets list of subtitle objects available.
  get(originType: String, textToSearch: String, tuneText?: String): Promise<Sub[]> { ... }

  // Download a subtitle in the specified path
  download(sub: Sub, path: string = './'): Promise<void> { ... }
}
```

Example:
```javascript
import SubMarine from "./main";

var submarine = new SubMarine();

submarine.get(SubMarine.ORIGINS.SUBDIVX, 'Heroes s01e03', 'blueray')
  .then(subs => {
    console.log("Total length: ", subs.length);

    submarine.download(sub[subs.length - 1], '/path/to/save') // download(sub: Sub, path: string = './')
    .then(() => {
      // File(s) saved!
    })
  });
```