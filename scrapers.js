const scrapeIt = require("scrape-it");
const helpers = require('./helpers.js');

const l = helpers.log;
const getContent = helpers.getContent;
const xmlToJson = helpers.xmlToJson;
const formatJson = helpers.formatJson;

//html scraping
const html = async (what) => {
    l('Scraping ' + what.id + ' in HTML mode', 'm');
    l('Retrieveing Content from ' + what.url);
    //for scrape-it docs visit https://github.com/IonicaBizau/scrape-it
    return scrapeIt(what.url, {
        items: {
            listItem: what.itemsPath,
            data: what.items
        }
    });
};

const xml = async (what) => {
    l('Scraping ' + what.id + ' in XML mode', 'm');
    let theContent = await getContent(what.url);
    let contentInJson = await xmlToJson(theContent);
    return formatJson(contentInJson, what);
};

const json = async (what) => {

};

// the object containing the scraping functions
module.exports = {
    html: html,
    xml: xml,
    json: json
};
