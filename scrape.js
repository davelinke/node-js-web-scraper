const scrapeIt = require("scrape-it");
const fs = require('fs');
const config = require('./config.js');

//for scrape-it docs visit https://github.com/IonicaBizau/scrape-it

const formatJson = (json, what) => {
    console.log('formatting json');
    const findItems = (route) => {
        var branches = route.split('>');
        let obj = json;
        for (let i = 0; i < branches.length; i++) {
            obj = obj[branches[i].trim()];
        }
        return obj;
    };
    let sourceArray = findItems(what.itemsPath);
    let output = { items: [] };
    let sourceItem, outputItem;
    for (let i = 0; i < sourceArray.length; i++) {
        sourceItem = sourceArray[i]
        outputItem = {};
        for (let key in what.items) {
            outputItem[key] = what.items[key](sourceItem);
        }
        output.items.push(outputItem);
    }
    return output;
};

// https get with promises
const getContent = function(url) {
    // return new pending promise
    return new Promise((resolve, reject) => {
        // select http or https module, depending on reqested url
        const lib = url.startsWith('https') ? require('https') : require('http');
        const request = lib.get(url, (response) => {
            // handle http errors
            if (response.statusCode < 200 || response.statusCode > 299) {
                reject(new Error('Failed to load page, status code: ' + response.statusCode));
            }
            // temporary data holder
            const body = [];
            // on every content chunk, push it to the data array
            response.on('data', (chunk) => body.push(chunk));
            // we are done, resolve promise with those joined chunks
            response.on('end', () => resolve(body.join('')));
        });
        // handle connection errors of the request
        request.on('error', (err) => reject(err))
    })
};

const xmlToJson = function(xml) {
    return new Promise((resolve, reject) => {
        let parseString = require('xml2js').parseString;
        let output = parseString(xml, function(err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

//https://codepen.io/davelinke/pens/public/grid/?grid_type=list&_cachebust=1507346630672
let items = [];
const scrape = {
    html: async(what) => {
        return scrapeIt(what.url, {
            items: {
                listItem: what.itemsPath,
                data: what.items
            }
        });
    },
    xml: async(what) => {
        let theContent = await getContent(what.url);
        let contentInJson = await xmlToJson(theContent);
        return formatJson(contentInJson, what);
    },
    json: async(what) => {

    }
}

const merge = async() => {
    let items = [];
    for (let scrapeConfig of config.scrapes) {
        let theScrape = await scrape[scrapeConfig.type](scrapeConfig);
        items = items.concat(theScrape.items);
    }
    fs.writeFile('output.json', JSON.stringify({ items: items }, null, 4), function(err) {
        console.log('File successfully written! - Check your project directory for the output.json file');
    });
};
merge();