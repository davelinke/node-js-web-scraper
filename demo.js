const config = require('./config.js');
const scrape = require('./scrape.js')

// clear the screen
console.log('\033[2J');
// start this thing
scrape(config);
