const scrape = require('./scrapers.js');
const helpers = require('./helpers.js');

const l = helpers.log;

// the main funciton that calls scraping, conversion, sorting and writing routines.
module.exports = async (config) => {

    // let's start
    l('Initializing scrape', 'box');

    // create an array for the output items
    let items = [];

    // check if directory for scrapes exists. In not write it
    let backupsDir = helpers.makeDirSync(config.scrapesDirectory);

    // loop through config sources and scrape
    for (let scrapeConfig of config.scrapes) {

        let backupFilePath = config.scrapesDirectory + scrapeConfig.id + '_output.json';
        // get the source content
        let theScrape = await scrape[scrapeConfig.type](scrapeConfig).catch((err)=>{}) || false;
        // get data from backup
        if (!theScrape){
            l('Retrieving content from backup');
            theScrape = JSON.parse(await helpers.readFileAsync(backupFilePath));
        } else {
            // write a backup in file system for the scraped data
            l('Backing up ' + scrapeConfig.id + ' data');
            if (await helpers.writeFileAsync(backupFilePath,JSON.stringify(theScrape, null, 4))){
                l(scrapeConfig.id + ' data backed up successfully');
            }
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
    l('Writing file', 'box');
    const outputDir = helpers.makeDirSync(config.outputDirectory);
    const outputFileName = config.outputFileName || 'output.json';
    let outputFile = await helpers.writeFileAsync(config.outputDirectory + outputFileName,JSON.stringify({ items: items }, null, 4));
    if (outputFile) {
        l('Output successfully written! - Check your project directory for the '+outputFileName+' file\n\n', 'm');
    }
};
