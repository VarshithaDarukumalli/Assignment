const express = require('express');
const https = require('https');

const app = express();

function extractLatestStories(htmlContent) {
    const stories = [];

    const pattern = /<a href="([^"]+)">\s*<h3[^>]*>([^<]+)<\/h3>\s*<\/a>/g;

    let match;
    let count = 0;
    while ((match = pattern.exec(htmlContent)) !== null && count < 10) {
        const [, link, title] = match;
        const formattedLink = `https://time.com${link}`;
        stories.push({ title: title.trim(), link: formattedLink });
        count++;
    }

    return stories
}

function fetchHTMLContent(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let htmlContent = '';
            response.on('data', (chunk) => {
                htmlContent += chunk;
            });
            response.on('end', () => {
                resolve(htmlContent);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

app.get('/Varshitha/getmylatestnews', async (req, res) => {
    const url = 'https://time.com';

    try {
        const htmlContent = await fetchHTMLContent(url);

        const latestStories = extractLatestStories(htmlContent);

        const jsonStories = latestStories.map(story => {    
            return `{ \n"title": "${story.title}",\n "link": "${story.link}"\n}`;
        }).join(',\n \n');
        res.setHeader('Content-Type', 'application/json');
        res.write('[\n');
        res.write(jsonStories);
        res.write('\n]');
        res.end();
    } catch (error) {
        console.error('Error fetching HTML content:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
