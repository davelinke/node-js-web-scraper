// a function to log stuff onto the console.

const log = (message,style)=>{
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
    log('Formatting json for '+ what.id);
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
const getContent = (url) => {
    // return new pending promise
    return new Promise((resolve, reject) => {
        // select http or https module, depending on reqested url
        const lib = url.startsWith('https') ? require('https') : require('http');
        const request = lib.get(url, (response) => {
            log('Retrieveing content from '+url);
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
    });
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

module.exports = {
  log:log,
  getContent:getContent,
  xmlToJson:xmlToJson,
  formatJson:formatJson
}
