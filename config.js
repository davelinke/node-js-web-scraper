module.exports = {
    scrapes: [{
            id: 'github',
            url: 'https://github.com/davelinke?tab=repositories',
            type: 'html',
            itemsPath: '#user-repositories-list li',
            items: {
                source: {
                    selector: 'title',
                    convert: x => 'github'
                },
                image: {
                    selector: 'title',
                    convert: x => false
                },
                title: '[itemprop="name codeRepository"]',
                url: {
                    selector: '[itemprop="name codeRepository"]',
                    attr: 'href'
                },
                description: '[itemprop="description"]',
                date: {
                    selector: 'relative-time',
                    attr: 'datetime',
                    convert: x => {
                        let zeDate = new Date(x);
                        return zeDate.toISOString();
                    }
                }
            }
        },
        {
            id: 'codepen',
            url: 'https://codepen.io/davelinke/public/feed',
            type: 'xml',
            itemsPath: 'rss > channel > 0 > item',
            items: {
                source: () => { return 'codepen' },
                image: () => { return false },
                title: (item) => { return item['title'][0] },
                url: (item) => { return item['link'][0] },
                description: (item) => {
                    return item['description'][0].split('\n')[11].trim();
                },
                date: (item) => {
                    let zeDate = new Date(item['dc:date'][0].split('\n')[1].trim());
                    return zeDate.toISOString();
                }
            }
        },
        {
            id: 'behance',
            url: 'https://www.behance.net/feeds/user?username=davidlinke',
            type: 'xml',
            itemsPath: 'rss > channel > 0 > item',
            items: {
                source: () => { return 'behance' },
                image: (item) => { return item['description'][0].split("'")[1] },
                title: (item) => { return item['title'][0] },
                url: (item) => { return item['link'][0] },
                description: (item) => { return item['description'][0].split('<br />')[1].trim() },
                date: (item) => {
                    let zeDate = new Date(item['pubDate'][0]);
                    return zeDate.toISOString();
                }
            }
        }
    ]
};
