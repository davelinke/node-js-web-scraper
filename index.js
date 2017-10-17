const fs = require('fs');
const config = require('./config.js');
const scrape = require('./scrapers.js');
const helpers = require('./helpers.js');

const l = helpers.log;

// the main funciton that calls scraping, conversion, sorting and writing routines.
const merge = async () => {

    // let's start
    l('Initializing scrape', 'box');

    // create an array for the output items
    let items = [];

    // check if directory for scrapes exists.
    if (!fs.existsSync(config.scrapesDirectory)) {
        fs.mkdirSync(config.scrapesDirectory);
    }

    // loop through config sources and scrape
    for (let scrapeConfig of config.scrapes) {

        let backupFilePath = config.scrapesDirectory + scrapeConfig.id + '_output.json';
        // get the source content
        let theScrape = await scrape[scrapeConfig.type](scrapeConfig).catch((err)=>{}) || false;
        // get data from backup
        if (!theScrape){
            theScrape = JSON.parse(await helpers.readFileAsync(backupFilePath));
        } else {
            // write a backup in file system for the scraped data
            fs.writeFile(backupFilePath, JSON.stringify(theScrape, null, 4), function (err) {
                if (err) l(err);
                l('Backing up ' + scrapeConfig.id + ' data');
            });
        }


        // append scrape to output array
        items = items.concat(theScrape.items);
    }

    // let's postprecess the information
    l('Post-processing info', 'box');

    //sort items in array by date dependeing on the config param (if none, then DESC)
    l('Sorting items', 'm');

    //get teh config value and set to DESC if none
    config.sort = ((typeof (config.sort) != 'undefined') && (config.sort === 'asc')) ? -1 : 1;

    // sort
    items.sort(function (a, b) {
        var keyA = new Date(a.date),
            keyB = new Date(b.date);
        // Compare the 2 dates
        if (keyA < keyB) return config.sort;
        if (keyA > keyB) return -1 * config.sort;
        return 0;
    });


    //write all scrapes sorted to disk
    fs.writeFile(config.outputDirectory + 'output.json', JSON.stringify({ items: items }, null, 4), function (err) {
        l('Writing file', 'box');
        l('File successfully written! - Check your project directory for the output.json file', 'm');
    });
};

// clear the screen
console.log('\033[2J');
// then start this thing
merge();
