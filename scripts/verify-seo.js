const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

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
console.log(`Auditing ${files.length} HTML files for George Clean Directory URLs, Technical SEO & Schema Integrity...\n`);

let passedChecks = 0;
let failedChecks = 0;
const failures = [];

function check(condition, message, file) {
  if (condition) {
    passedChecks++;
  } else {
    failedChecks++;
    failures.push({ file: file ? path.relative(rootDir, file).replace(/\\/g, '/') : 'GLOBAL', message });
  }
}

// Track uniqueness across all primary directory entrypoints
const seenTitles = new Map();
const seenDescriptions = new Map();

// Helper to determine expected canonical URL
function getExpectedCanonical(rel) {
  if (rel === 'index.html' || rel === 'home/index.html') return 'https://jojjy.org/';
  if (rel === 'about.html' || rel === 'about/index.html') return 'https://jojjy.org/about/';
  if (rel === 'articles.html' || rel === 'articles/index.html') return 'https://jojjy.org/articles/';
  if (rel === 'collections.html' || rel === 'collections/index.html') return 'https://jojjy.org/collections/';
  
  // Article pages in subdirectories
  const dirMatch = rel.match(/^articles\/(article-[^/]+)\/index\.html$/);
  if (dirMatch) return `https://jojjy.org/articles/${dirMatch[1]}/`;

  // Legacy article pages
  const legacyMatch = rel.match(/^articles\/(article-[^/.]+)\.html$/);
  if (legacyMatch) return `https://jojjy.org/articles/${legacyMatch[1]}/`;

  return null;
}

// 1. Audit All HTML Files
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const rel = path.relative(rootDir, f).replace(/\\/g, '/');
  const isTemplate = rel === 'article.html';
  const isErrorPage = rel === '404.html';

  // Language & Viewport
  check(/<html[^>]*lang=["']en["']/i.test(content), 'HTML lang="en" present', rel);
  check(/<meta[^>]*name=["']viewport["']/i.test(content), 'Viewport meta tag present', rel);

  // Single H1
  const h1Matches = content.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
  check(h1Matches.length === 1, `Exactly 1 H1 element (found ${h1Matches.length})`, rel);

  // Template Isolation
  if (isTemplate) {
    check(/<meta\s+name=["']robots["']\s+content=["']noindex,\s*nofollow["']/i.test(content),
      'Template article.html has noindex, nofollow', rel);
    return;
  }

  // Error Page Verification & Isolation
  if (isErrorPage) {
    check(/<meta\s+name=["']robots["']\s+content=["']noindex,\s*follow["']/i.test(content),
      'Error page 404.html has noindex, follow', rel);
    const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    check(title.includes('Page Not Found') && title.includes('George'),
      `Error page title contains Page Not Found and George (found "${title}")`, rel);
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=(["'])([\s\S]*?)\1/i);
    const desc = descMatch ? descMatch[2].trim() : '';
    check(desc.length >= 120 && desc.length <= 158,
      `Error page meta description length is valid (${desc.length} chars)`, rel);
  }

  // Indexable Content Page Audits
  if (!isErrorPage) {
    // Title check
    const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    check(title.length >= 5 && title.length <= 75, `Title length is valid (${title.length} chars: "${title}")`, rel);
    check(title.includes('George'), `Title includes publication name "George"`, rel);

    // Title formula verification
    if (rel === 'index.html' || rel === 'home/index.html') {
      check(title === 'George | Short Christian Essays on Faith, Work & Ordinary Life', `Homepage title matches (found "${title}")`, rel);
    } else if (rel === 'about.html' || rel === 'about/index.html') {
      check(title === 'About George | Christian Essays from the Countryside', `About page title matches (found "${title}")`, rel);
    } else if (rel === 'articles.html' || rel === 'articles/index.html') {
      check(title === 'Essays Archive | George', `Articles archive title matches (found "${title}")`, rel);
    } else if (rel === 'collections.html' || rel === 'collections/index.html') {
      check(title === 'Collections | George', `Collections title matches (found "${title}")`, rel);
    } else if (rel.includes('articles/')) {
      check(title.endsWith(' | George'), `Article title ends with " | George" (found "${title}")`, rel);
    }

    // Title Uniqueness for primary indexable canonical files
    const isPrimaryCanonicalFile = rel.endsWith('/index.html') || rel === 'index.html';
    if (isPrimaryCanonicalFile) {
      if (seenTitles.has(title)) {
        check(false, `Duplicate title with ${seenTitles.get(title)}: "${title}"`, rel);
      } else {
        seenTitles.set(title, rel);
        check(true, 'Title is unique across publication', rel);
      }
    }

    // Meta description
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=(["'])([\s\S]*?)\1/i);
    const desc = descMatch ? descMatch[2].trim() : '';
    check(desc.length >= 120 && desc.length <= 158, `Meta description length is valid between 120 and 158 chars (${desc.length} chars)`, rel);

    // Author meta
    const authorMatch = content.match(/<meta\s+name=["']author["']\s+content=["']George["']/i);
    check(!!authorMatch, 'Author meta tag <meta name="author" content="George"> present', rel);

    // Canonical tag verification
    const expectedCanonical = getExpectedCanonical(rel);
    const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=(["'])([\s\S]*?)\1/i);
    const canonical = canonicalMatch ? canonicalMatch[2] : '';
    check(canonical === expectedCanonical, `Canonical URL is "${expectedCanonical}" (found "${canonical}")`, rel);
    check(canonical.endsWith('/'), `Canonical URL has trailing slash: ${canonical}`, rel);

    // Open Graph
    const ogSiteName = content.match(/<meta\s+property=["']og:site_name["']\s+content=(["'])([\s\S]*?)\1/i);
    check(ogSiteName && ogSiteName[2] === 'George', `og:site_name is "George"`, rel);

    const ogUrl = content.match(/<meta\s+property=["']og:url["']\s+content=(["'])([\s\S]*?)\1/i);
    check(ogUrl && ogUrl[2] === expectedCanonical, `og:url matches canonical`, rel);

    const ogTitle = content.match(/<meta\s+property=["']og:title["']\s+content=(["'])([\s\S]*?)\1/i);
    check(ogTitle && ogTitle[2] === title, `og:title matches page title`, rel);

    const ogDesc = content.match(/<meta\s+property=["']og:description["']\s+content=(["'])([\s\S]*?)\1/i);
    check(ogDesc && ogDesc[2] === desc, `og:description matches meta description`, rel);

    const ogImg = content.match(/<meta\s+property=["']og:image["']\s+content=(["'])([\s\S]*?)\1/i);
    check(!!ogImg && ogImg[2].startsWith('https://jojjy.org/images/'), 'og:image points to https://jojjy.org/images/', rel);

    if (ogImg) {
      const localImgPath = path.join(rootDir, ogImg[2].replace('https://jojjy.org/', ''));
      check(fs.existsSync(localImgPath), `og:image target exists on disk: ${localImgPath}`, rel);
    }

    // Twitter Card
    const twitterCard = content.match(/<meta\s+name=["']twitter:card["']\s+content=["']summary_large_image["']/i);
    check(!!twitterCard, 'twitter:card is summary_large_image', rel);

    const twitterTitle = content.match(/<meta\s+name=["']twitter:title["']\s+content=(["'])([\s\S]*?)\1/i);
    check(twitterTitle && twitterTitle[2] === title, 'twitter:title matches page title', rel);

    // JSON-LD Structured Data
    const jsonLdMatch = content.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i);
    check(!!jsonLdMatch, 'JSON-LD block present', rel);

    if (jsonLdMatch) {
      try {
        const parsed = JSON.parse(jsonLdMatch[1]);
        check(true, 'JSON-LD syntax is valid JSON', rel);

        if (rel === 'index.html' || rel === 'home/index.html') {
          const graph = parsed['@graph'] || [];
          const website = graph.find(e => e['@type'] === 'WebSite');
          const person = graph.find(e => e['@type'] === 'Person');

          check(!!website, 'Homepage schema has WebSite entity', rel);
          check(website && website.name === 'George', 'Homepage WebSite name is "George"', rel);
          check(website && website.publisher && website.publisher['@id'] === 'https://jojjy.org/#george', 'WebSite publisher is George Person', rel);
          check(!!person, 'Homepage schema has Person entity (George)', rel);
          check(person && person.name === 'George', 'Person entity name is "George"', rel);
          check(person && person.url === 'https://jojjy.org/about/', 'Person entity url is https://jojjy.org/about/', rel);
        } else if (rel === 'articles.html' || rel === 'articles/index.html') {
          check(parsed['@type'] === 'CollectionPage', 'Archive schema type is CollectionPage', rel);
          check(parsed.isPartOf && parsed.isPartOf['@id'] === 'https://jojjy.org/#website', 'Archive isPartOf is George WebSite', rel);
          check(parsed.author && parsed.author['@type'] === 'Person', 'Archive author is Person (George)', rel);
          check(parsed.publisher && parsed.publisher['@type'] === 'Organization', 'Archive publisher is Organization (George)', rel);
          check(parsed.mainEntity && parsed.mainEntity['@type'] === 'ItemList', 'Archive has ItemList mainEntity', rel);
          check(parsed.mainEntity && parsed.mainEntity.numberOfItems === 18, 'ItemList contains 18 items', rel);
        } else if (rel === 'about.html' || rel === 'about/index.html') {
          const graph = parsed['@graph'] || [];
          const aboutPage = graph.find(e => e['@type'] === 'AboutPage');
          const person = graph.find(e => e['@type'] === 'Person');
          check(!!aboutPage, 'About schema has AboutPage entity', rel);
          check(aboutPage && aboutPage.isPartOf && aboutPage.isPartOf['@id'] === 'https://jojjy.org/#website', 'AboutPage isPartOf is George WebSite', rel);
          check(!!person && person['@id'] === 'https://jojjy.org/#george', 'About page has Person George', rel);
        } else if (rel.includes('articles/')) {
          check(parsed['@type'] === 'BlogPosting', 'Article schema type is BlogPosting', rel);
          check(parsed.author && parsed.author['@id'] === 'https://jojjy.org/#george' && parsed.author.name === 'George', 'Article author is Person (George)', rel);
          check(parsed.publisher && parsed.publisher['@id'] === 'https://jojjy.org/#website' && parsed.publisher.name === 'George', 'Article publisher is Organization (George)', rel);
          check(!!parsed.datePublished, 'Article has datePublished', rel);
          check(!!parsed.headline, 'Article has headline', rel);
          check(parsed.mainEntityOfPage && parsed.mainEntityOfPage['@id'] === expectedCanonical, 'Article mainEntityOfPage matches canonical', rel);
        }
      } catch (e) {
        check(false, `JSON-LD parsing error: ${e.message}`, rel);
      }
    }
  }

  // Image audit: alt text & file existence on disk
  const imgRegex = /<img\s+([^>]+)>/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const imgAttrs = match[1];
    const altMatch = imgAttrs.match(/alt=["'](.*?)["']/i);
    check(altMatch !== null && altMatch[1].trim().length > 0, `Image has non-empty alt text: ${match[0].slice(0, 50)}`, rel);

    const srcMatch = imgAttrs.match(/src=["'](.*?)["']/i);
    if (srcMatch && !srcMatch[1].startsWith('http') && !srcMatch[1].startsWith('//')) {
      const srcPath = srcMatch[1].split('?')[0].split('#')[0];
      const resolved = srcPath.startsWith('/')
        ? path.join(rootDir, srcPath.slice(1))
        : path.resolve(path.dirname(f), srcPath);
      check(fs.existsSync(resolved), `Local image src exists on disk: ${srcPath}`, rel);
    }
  }

  // Internal links check
  const anchorRegex = /<a\s+[^>]*href=["']([^"'#]+)(?:#[^"']*)?["']/gi;
  let aMatch;
  while ((aMatch = anchorRegex.exec(content)) !== null) {
    const href = aMatch[1];
    if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
      const linkTarget = href.split('?')[0];
      let resolvedLink;
      if (linkTarget.startsWith('/')) {
        let trimmed = linkTarget.replace(/^\//, '');
        if (trimmed === '' || trimmed.endsWith('/')) trimmed = path.join(trimmed, 'index.html');
        resolvedLink = path.join(rootDir, trimmed);
      } else {
        resolvedLink = path.resolve(path.dirname(f), linkTarget);
        if (fs.existsSync(resolvedLink) && fs.statSync(resolvedLink).isDirectory()) {
          resolvedLink = path.join(resolvedLink, 'index.html');
        }
      }
      check(fs.existsSync(resolvedLink), `Internal link target exists: ${href} (resolves to ${resolvedLink})`, rel);
    }
  }

  // Check for obsolete domain leaks in canonical / og / links
  check(!content.includes('https://georgewrites.com/'), 'No https://georgewrites.com/ references', rel);
  check(!content.includes('http://jojjy.org'), 'No insecure http://jojjy.org references', rel);
  check(!content.includes('www.jojjy.org'), 'No www.jojjy.org references', rel);
});

// 2. Sitemap verification
const sitemapPath = path.join(rootDir, 'sitemap.xml');
check(fs.existsSync(sitemapPath), 'sitemap.xml exists', 'sitemap.xml');
const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);

check(sitemapUrls.length === 22, `Sitemap contains exactly 22 URLs (found ${sitemapUrls.length})`, 'sitemap.xml');
check(sitemapUrls.includes('https://jojjy.org/'), 'Sitemap includes root homepage', 'sitemap.xml');
check(sitemapUrls.includes('https://jojjy.org/articles/'), 'Sitemap includes /articles/', 'sitemap.xml');
check(sitemapUrls.includes('https://jojjy.org/collections/'), 'Sitemap includes /collections/', 'sitemap.xml');
check(sitemapUrls.includes('https://jojjy.org/about/'), 'Sitemap includes /about/', 'sitemap.xml');
check(!sitemap.includes('article.html'), 'Sitemap does NOT include template article.html', 'sitemap.xml');
check(!sitemap.includes('404.html'), 'Sitemap does NOT include 404 error page', 'sitemap.xml');
check(!sitemap.includes('.html</loc>'), 'Sitemap URLs end with clean trailing slash and no .html extension', 'sitemap.xml');

// Verify that every sitemap URL maps to a local directory or index.html
sitemapUrls.forEach(url => {
  let relPath = url.replace('https://jojjy.org/', '');
  if (!relPath || relPath.endsWith('/')) relPath = path.join(relPath, 'index.html');
  const filePath = path.join(rootDir, relPath);
  check(fs.existsSync(filePath), `Sitemap URL resolves to existing file on disk: ${url}`, 'sitemap.xml');
});

// 3. Robots.txt verification
const robotsPath = path.join(rootDir, 'robots.txt');
check(fs.existsSync(robotsPath), 'robots.txt exists', 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
check(robots.includes('Sitemap: https://jojjy.org/sitemap.xml'), 'robots.txt declares correct Sitemap URL', 'robots.txt');
check(robots.includes('Disallow: /article.html'), 'robots.txt disallows template article.html', 'robots.txt');
check(robots.includes('Allow: /'), 'robots.txt allows root', 'robots.txt');
check(robots.includes('Allow: /articles/'), 'robots.txt allows /articles/', 'robots.txt');

// 4. Manifest.json verification
const manifestPath = path.join(rootDir, 'images/favicon/manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  check(manifest.name.includes('George'), 'manifest.json name includes "George"', 'manifest.json');
  check(manifest.short_name === 'George', 'manifest.json short_name is "George"', 'manifest.json');
}

// 5. .htaccess verification
const htaccessPath = path.join(rootDir, '.htaccess');
check(fs.existsSync(htaccessPath), '.htaccess exists', '.htaccess');
const htaccess = fs.readFileSync(htaccessPath, 'utf8');
check(htaccess.includes('RewriteEngine On'), '.htaccess has RewriteEngine On', '.htaccess');
check(htaccess.includes('DirectorySlash On'), '.htaccess has DirectorySlash On for trailing slashes', '.htaccess');
check(htaccess.includes('Strict-Transport-Security'), '.htaccess has HSTS header', '.htaccess');
check(htaccess.includes('AddOutputFilterByType DEFLATE'), '.htaccess has GZIP/Deflate compression', '.htaccess');
check(htaccess.includes('ExpiresActive On'), '.htaccess has browser caching rules', '.htaccess');
check(htaccess.includes('ErrorDocument 404 /404.html'), '.htaccess has ErrorDocument 404', '.htaccess');
check(htaccess.includes('ErrorDocument 403 /404.html'), '.htaccess has ErrorDocument 403', '.htaccess');
check(htaccess.includes('Options -Indexes'), '.htaccess disables directory browsing (Options -Indexes)', '.htaccess');
check(htaccess.includes('index\\.html$ / [R=301,L]'), '.htaccess 301 redirects /index.html to root /', '.htaccess');
check(htaccess.includes('about\\.html$ /about/'), '.htaccess 301 redirects /about.html to /about/', '.htaccess');
check(htaccess.includes('articles\\.html$ /articles/'), '.htaccess 301 redirects /articles.html to /articles/', '.htaccess');
check(htaccess.includes('articles/(article-[^/.]+)\\.html$ /articles/$1/'), '.htaccess 301 redirects /articles/*.html to clean directory', '.htaccess');

console.log('='.repeat(70));
console.log(`SEO Verification Results: ${passedChecks} checks PASSED, ${failedChecks} checks FAILED.`);
console.log('='.repeat(70));

if (failures.length > 0) {
  console.log('\nFailures detected:');
  failures.forEach(f => console.log(`  [${f.file}] ${f.message}`));
  process.exit(1);
} else {
  console.log('\nALL AUDITS & INTEGRITY CHECKS VERIFIED PERFECTLY (100% PASS)!\n');
}
