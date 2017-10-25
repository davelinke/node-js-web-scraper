# node-js-web-scraper
A little Node.js module that scrapes web content and formats it into json

the NodeJS web scraper requires [Node.js](https://nodejs.org/) v7.6+ to run.
### Installation
```sh
$ npm install https://github.com/davelinke/node-js-web-scraper.git --save
```
### Usage
The scraper analyzes html using the scrape-it module. For full documentation visit [scrape-it](https://github.com/IonicaBizau/scrape-it)

```sh
const scrape = require('./scrape.js');

const config = {
	scrapesDirectory: './scrapes/',
    outputDirectory: './output/',
    outputFileName:'timeline.json',
    scrapes: [
        {
            id: 'html-scrape-id',
            url: 'https://html-scrape.url',
            type: 'html',
            itemsPath: '#cssPathToItemsWrapper',
            items: {
                title: '[itemprop="name codeRepository"]',
                url: {
                    selector: '[itemprop="name codeRepository"]',
                    attr: 'href'
                }
            }
        },
        {
            id: 'xml-scrape-id',
            url: 'https://xml-scrape.url',
            type: 'xml',
            itemsPath: 'rss > channel > 0 > item',
            items: {
                title: (item) => { return item['title'][0] },
                url: (item) => { return item['link'][0] }
            }
        }
    ]
};
```

The XML scraping has been coded around the same rules of scrape-it and accepts a function to parse the scraped elements.

### To Do
- Add json scraping
- Unifying the methods to parse the scrapes.
