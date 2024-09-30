const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

function extractEmails(text) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/gi;
    let emails = text.match(emailRegex) || [];

    // Blacklist certain file extensions to filter out false positives
    const blacklistedExtensions = [
        '.jpg', '.jpeg', '.png', '.svg', '.gif',
        '.tga', '.bmp', '.zip', '.pdf', '.webp',
    ];

    emails = emails.filter(email => {
        // Convert email and extensions to lowercase for case-insensitive comparison
        const lowerEmail = email.toLowerCase();
        return !blacklistedExtensions.some(ext => lowerEmail.endsWith(ext));
    });

    return emails;
}

function extractLinks(html, baseUrl) {
    const $ = cheerio.load(html);
    const links = [];
    $('a[href]').each((i, elem) => {
        let href = $(elem).attr('href');
        if (href) {
            // Remove URL fragments
            href = href.split('#')[0];
            // Resolve relative URLs
            href = url.resolve(baseUrl, href);
            // Ensure the link is on the same domain
            if (href.startsWith(baseUrl)) {
                links.push(href);
            }
        }
    });
    return links;
}

async function fetchPage(pageUrl) {
    try {
        const response = await axios.get(pageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; EmailScraper/1.0)'
            },
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        // Handle errors silently
        return null;
    }
}

async function crawlWebsite(startUrl) {
    const emailsFound = new Set();
    const visited = new Set();
    const queue = [];

    const maxPages = 40;
    let pagesCrawled = 0;
    let emailFound = false;

    const parsedUrl = url.parse(startUrl);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

    // Start with the main page
    queue.push(startUrl);

    // Prepare potential contact page URLs
    const contactPaths = ['/contact', '/contact-us', '/contactus', '/about', '/about-us', '/aboutus', '/impressum'];
    for (let path of contactPaths) {
        queue.push(url.resolve(baseUrl, path));
    }

    while (queue.length > 0 && pagesCrawled < maxPages && !emailFound) {
        const currentUrl = queue.shift();

        if (visited.has(currentUrl)) {
            continue;
        }
        visited.add(currentUrl);

        const html = await fetchPage(currentUrl);
        if (!html) {
            continue;
        }
        pagesCrawled++;

        // Extract emails from page
        const emails = extractEmails(html);
        if (emails.length > 0) {
            emails.forEach(email => emailsFound.add(email));
            emailFound = true;
            break; // Stop crawling this website
        }

        // Extract links from page
        const links = extractLinks(html, baseUrl);
        for (let link of links) {
            if (!visited.has(link)) {
                queue.push(link);
            }
        }
    }

    return Array.from(emailsFound);
}

async function main(websiteUrls) {
    const results = {};
    const concurrencyLimit = 5;

    for (let i = 0; i < websiteUrls.length; i += concurrencyLimit) {
        const batch = websiteUrls.slice(i, i + concurrencyLimit);
        const batchPromises = batch.map(async (url) => {
            const emails = await crawlWebsite(url);
            results[url] = emails;
        });
        await Promise.all(batchPromises);
    }

    console.log(results);
}

// Example usage
const testWebsiteUrls = [
    'http://ballardproperty.com.au/home',
    'https://www.cohenfarquharson.com.au/',
    'https://www.metrocommercial.com.au/',
    'https://nuaskinbliss.com/',
    'https://ahoyclub.com/',
    'https://www.cyclehire.com.au/',
    'https://www.moveyourself.com.au/index.php?page=depot&code=RANDC',
    'http://www.mccyclery.com.au/',
    'http://www.oneroundentertainment.com.au/',
    'http://sydneyresurfacingservices.com.au/',
    'http://andersensicecream.com/australia/',
    'http://www.thecoogeeview.com.au/',
    'https://www.instagram.com/coogeesurfandco'
];

main(testWebsiteUrls);
