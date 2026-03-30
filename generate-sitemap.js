const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');

const sitemap = new SitemapStream({ hostname: 'https://bouncesteps.com' });

const writeStream = createWriteStream('./public/sitemap.xml');

sitemap.pipe(writeStream);

// Add your pages
sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });
sitemap.write({ url: '/about', changefreq: 'weekly', priority: 0.8 });
sitemap.write({ url: '/services', changefreq: 'weekly', priority: 0.8 });
sitemap.write({ url: '/contact', changefreq: 'monthly', priority: 0.7 });
sitemap.write({ url: '/admin', changefreq: 'daily', priority: 0.9 });
sitemap.write({ url: '/login', changefreq: 'daily', priority: 0.9 });
sitemap.write({ url: '/register', changefreq: 'weekly', priority: 0.8 });
sitemap.write({ url: '/services/providers', changefreq: 'weekly', priority: 0.8 });

sitemap.end();

streamToPromise(sitemap).then(() => {
  console.log('Sitemap generated successfully!');
});
