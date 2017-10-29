const puppeteer = require('puppeteer');
const helpers = require('./helpers.js');

var els = [];


const run = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.setViewport({width:1280,height:768});
    await page.goto('https://www.behance.net/davidlinke');
    await page.waitForNavigation({waitUntil:'networkidle'})
    await page.screenshot(
        {
            path: 'screenshots/github.png',
            fullPage:true
        }
    );

    // Extract the results from the page
    const projects = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('.rf-project-cover__image'));
        return anchors.map(anchor => anchor.src);
    });
    console.log(projects);

    await browser.close();
}

run();
