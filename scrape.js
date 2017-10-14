const scrapeIt = require("scrape-it");
const fs = require('fs');
const config = require('./config.js');

// a function to log stuff onto the console.
const l = (message,style)=>{
  output ="";
  switch (style) {
    case ('box'):
      let horizontals = ''
      let mLength = message.length;
      for (let i=0;i<(mLength+2);i++){
        horizontals += '═';
      }
      output += '\n╔' + horizontals + '╗\n' + '║ ' + message + ' ║' + '\n╚' + horizontals + '╝';
      break;
    case 'm':
      output+='\n- '+message;
      break;
    default:
      output = '  '+message;
  }
  console.log(output);
};

// a function to format the output of diverse scrapes and formats onto the format required by the output feed
const formatJson = (json, what) => {
    l('Formatting json for '+ what.id);
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
            l('Retrieveing content from '+url);
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

// name says it all, comverts xml onto json
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

// the object containing the scraping functions
const scrape = {
    html: async(what) => {
        l('Scraping '+what.id+' in HTML mode','m');
        console.log('  Retrieveing Content from '+ what.url);
        //for scrape-it docs visit https://github.com/IonicaBizau/scrape-it
        return scrapeIt(what.url, {
            items: {
                listItem: what.itemsPath,
                data: what.items
            }
        });
    },
    xml: async(what) => {
        l('Scraping '+what.id+' in XML mode','m');
        let theContent = await getContent(what.url);
        let contentInJson = await xmlToJson(theContent);
        return formatJson(contentInJson, what);
    },
    json: async(what) => {

    }
}

// the main funciton that calls scraping, conversion, sorting and writing routines.
const merge = async() => {
    let items = [];
    l('Initializing scrape','box');
    //scrape all sources
    for (let scrapeConfig of config.scrapes) {
        let theScrape = await scrape[scrapeConfig.type](scrapeConfig);
        items = items.concat(theScrape.items);
    }
    //sort by date
    l('Sorting items','m');
    config.sort = ((typeof(config.sort)!='undefined')&&(config.sort==='asc'))?-1:1;
    items.sort(function(a, b){
        var keyA = new Date(a.date),
            keyB = new Date(b.date);
        // Compare the 2 dates
        if(keyA < keyB) return config.sort;
        if(keyA > keyB) return -1*config.sort;
        return 0;
    });
    fs.writeFile('output.json', JSON.stringify({ items: items }, null, 4), function(err) {
      l('Writing file','box');
      l('File successfully written! - Check your project directory for the output.json file','m');
    });
};

// clear the screen
console.log('\033[2J');
// then start this thing
merge();
