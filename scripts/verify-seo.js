const fs = require('fs');
const path = require('path');

const rootDir = 'd:/Dev2026/George-2';

function getFiles(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    let full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (!['.git', '.agents', '.vscode', 'node_modules', 'src'].includes(file)) {
        results = results.concat(getFiles(full));
      }
    } else if (file.endsWith('.html')) {
      results.push(full);
    }
  });
  return results;
}

const files = getFiles(rootDir);
console.log(`Auditing ${files.length} HTML files...`);

const report = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const rel = path.relative(rootDir, f).replace(/\\/g, '/');

  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content="([^"]*)"/i) || content.match(/<meta\s+name=["']description["']\s+content='([^']*)'/i);
  const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href="([^"]*)"/i);
  const ogTitleMatch = content.match(/<meta\s+property=["']og:title["']\s+content=["']([\s\S]*?)["']/i);
  const ogDescMatch = content.match(/<meta\s+property=["']og:description["']\s+content=["']([\s\S]*?)["']/i);
  const ogUrlMatch = content.match(/<meta\s+property=["']og:url["']\s+content=["']([\s\S]*?)["']/i);
  const ogImgMatch = content.match(/<meta\s+property=["']og:image["']\s+content=["']([\s\S]*?)["']/i);
  const twitterMatch = content.match(/<meta\s+name=["']twitter:card["']/i);

  // JSON-LD check
  let jsonLdValid = false;
  let jsonLdType = 'None';
  const jsonLdMatch = content.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      const parsed = JSON.parse(jsonLdMatch[1]);
      jsonLdValid = true;
      jsonLdType = parsed['@type'] || (parsed['@graph'] ? 'Graph' : 'Object');
    } catch (e) {
      jsonLdValid = false;
      jsonLdType = 'ERROR: ' + e.message;
    }
  }

  report.push({
    file: rel,
    titleLen: titleMatch ? titleMatch[1].trim().length : 0,
    descLen: descMatch ? descMatch[1].trim().length : 0,
    hasCanonical: !!canonicalMatch,
    hasOg: !!(ogTitleMatch && ogDescMatch && ogUrlMatch && ogImgMatch),
    hasTwitter: !!twitterMatch,
    jsonLd: jsonLdType
  });
});

console.table(report);

// Sitemap verification
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
console.log(`Sitemap total URLs: ${sitemapUrls.length}`);

// Robots verification
const robots = fs.readFileSync('robots.txt', 'utf8');
console.log('Robots.txt has Sitemap reference:', robots.includes('Sitemap:'));
