# 🚀 Email Scraper

This is a simple yet efficient web scraping tool built with Node.js, `axios`, and `cheerio`. It extracts email addresses from websites by crawling through multiple pages and prioritizing contact-related pages to quickly gather email addresses. Once an email is found, the scraper stops to avoid wasting resources.

## ✨ Features

- **Email Extraction**: Extracts email addresses from HTML content using a regular expression, while filtering out false positives like image URLs (`.jpg`, `.png`, etc.).
- **Link Extraction**: Gathers and follows links from the same domain, resolving relative URLs and avoiding URL fragments.
- **Contact Page Prioritization**: The scraper intelligently queues contact-related pages (`/contact`, `/about`, etc.) first to quickly locate email addresses.
- **Page Crawling**: Crawls up to 40 pages per website, stopping early if an email is found.
- **Concurrency**: Supports scraping multiple websites in parallel with a configurable concurrency limit to balance speed and server load.
- **User-Agent Simulation**: Mimics browser behavior by setting a custom user-agent to reduce the risk of being blocked.
- **Timeout Handling**: Configures a timeout for requests to avoid long waits for unresponsive pages.

## 🛠️ How to Use

1. Clone this repository or copy the code into your project.
2. Install dependencies by running:

    ```bash
    npm install axios cheerio
    ```

3. Add your target websites to the `testWebsiteUrls` array.
4. Run the script:

    ```bash
    node scraper.js
    ```

5. The console will print the results showing found email addresses for each website.

## 📝 Example Usage

```javascript
const testWebsiteUrls = [
    'http://example.com',
    'http://anotherexample.com',
    // Add more URLs here
];

main(testWebsiteUrls);
