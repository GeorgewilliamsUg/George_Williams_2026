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
console.log(`Auditing ${files.length} HTML files for Jojjy.org Technical SEO, Semantic Clarity & Schema Integrity...\n`);

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

// Track uniqueness across all indexable pages
const seenTitles = new Map();
const seenDescriptions = new Map();
const seenCanonicals = new Map();

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
    check(title.includes('404') && title.includes('Jojjy'),
      `Error page title contains 404 and Jojjy (found "${title}")`, rel);
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=(["'])([\s\S]*?)\1/i);
    const desc = descMatch ? descMatch[2].trim() : '';
    check(desc.length >= 50 && desc.length <= 165,
      `Error page meta description length is valid (${desc.length} chars)`, rel);
  }

  // Indexable Content Page Audits
  if (!isErrorPage) {
    // Title check
    const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    check(title.length >= 15 && title.length <= 75, `Title length is valid (${title.length} chars: "${title}")`, rel);
    check(title.includes('Jojjy'), `Title includes publication name "Jojjy"`, rel);

    // Title formula verification
    if (rel === 'index.html') {
      check(title.startsWith('Jojjy — '), `Homepage title follows "Jojjy — [description]" (found "${title}")`, rel);
    } else if (rel === 'about.html') {
      check(title === 'About George — Writer & Creator of Jojjy', `About page title is "About George — Writer & Creator of Jojjy" (found "${title}")`, rel);
    } else if (rel === 'articles.html') {
      check(title === 'Articles — Jojjy', `Articles archive title is "Articles — Jojjy" (found "${title}")`, rel);
    } else if (rel.startsWith('articles/')) {
      check(title.endsWith(' — George | Jojjy'), `Article title ends with " — George | Jojjy" (found "${title}")`, rel);
    }

    // Title Uniqueness
    if (seenTitles.has(title)) {
      check(false, `Duplicate title with ${seenTitles.get(title)}: "${title}"`, rel);
    } else {
      seenTitles.set(title, rel);
      check(true, 'Title is unique across publication', rel);
    }

    // Meta description
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=(["'])([\s\S]*?)\1/i);
    const desc = descMatch ? descMatch[2].trim() : '';
    check(desc.length >= 50 && desc.length <= 165, `Meta description length is valid (${desc.length} chars)`, rel);

    // Description Uniqueness
    if (seenDescriptions.has(desc)) {
      check(false, `Duplicate meta description with ${seenDescriptions.get(desc)}`, rel);
    } else {
      seenDescriptions.set(desc, rel);
      check(true, 'Meta description is unique across publication', rel);
    }

    // Author meta
    const authorMatch = content.match(/<meta\s+name=["']author["']\s+content=["']George["']/i);
    check(!!authorMatch, 'Author meta tag <meta name="author" content="George"> present', rel);

    // Canonical tag
    const expectedCanonical = rel === 'index.html' ? 'https://jojjy.org/' : `https://jojjy.org/${rel}`;
    const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=(["'])([\s\S]*?)\1/i);
    const canonical = canonicalMatch ? canonicalMatch[2] : '';
    check(canonical === expectedCanonical, `Canonical URL is "${expectedCanonical}" (found "${canonical}")`, rel);

    if (seenCanonicals.has(canonical)) {
      check(false, `Duplicate canonical URL with ${seenCanonicals.get(canonical)}`, rel);
    } else {
      seenCanonicals.set(canonical, rel);
    }

    // Open Graph
    const ogSiteName = content.match(/<meta\s+property=["']og:site_name["']\s+content=(["'])([\s\S]*?)\1/i);
    check(ogSiteName && ogSiteName[2] === 'Jojjy', `og:site_name is "Jojjy"`, rel);

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

        if (rel === 'index.html') {
          const graph = parsed['@graph'] || [];
          const website = graph.find(e => e['@type'] === 'WebSite');
          const person = graph.find(e => e['@type'] === 'Person');

          check(!!website, 'Homepage schema has WebSite entity', rel);
          check(website && website.name === 'Jojjy', 'Homepage WebSite name is "Jojjy"', rel);
          check(website && website.publisher && website.publisher['@type'] === 'Organization', 'WebSite publisher is Organization (Jojjy)', rel);
          check(website && website.publisher.name === 'Jojjy', 'WebSite publisher name is "Jojjy"', rel);
          check(website && website.creator && website.creator['@type'] === 'Person', 'WebSite creator is Person (George)', rel);

          check(!!person, 'Homepage schema has Person entity (George)', rel);
          check(person && person.name === 'George', 'Person entity name is "George"', rel);
          check(person && person.url === 'https://jojjy.org/about.html', 'Person entity url is https://jojjy.org/about.html', rel);
        } else if (rel === 'articles.html') {
          check(parsed['@type'] === 'CollectionPage', 'Archive schema type is CollectionPage', rel);
          check(parsed.isPartOf && parsed.isPartOf.name === 'Jojjy', 'Archive isPartOf is Jojjy', rel);
          check(parsed.author && parsed.author['@type'] === 'Person', 'Archive author is Person (George)', rel);
          check(parsed.publisher && parsed.publisher['@type'] === 'Organization', 'Archive publisher is Organization (Jojjy)', rel);
          check(parsed.mainEntity && parsed.mainEntity['@type'] === 'ItemList', 'Archive has ItemList mainEntity', rel);
          check(parsed.mainEntity && parsed.mainEntity.numberOfItems === 18, 'ItemList contains 18 items', rel);
        } else if (rel === 'about.html') {
          check(parsed['@type'] === 'ProfilePage', 'About page schema type is ProfilePage', rel);
          check(parsed.isPartOf && parsed.isPartOf.name === 'Jojjy', 'About isPartOf is Jojjy', rel);
          check(parsed.mainEntity && parsed.mainEntity['@type'] === 'Person', 'About mainEntity is Person (George)', rel);
          check(parsed.mainEntity && parsed.mainEntity.worksFor && parsed.mainEntity.worksFor.name === 'Jojjy', 'George worksFor Jojjy publication', rel);
        } else if (rel.startsWith('articles/')) {
          check(parsed['@type'] === 'BlogPosting', 'Article schema type is BlogPosting', rel);
          check(parsed.isPartOf && parsed.isPartOf.name === 'Jojjy', 'Article isPartOf is Jojjy', rel);
          check(parsed.author && parsed.author['@type'] === 'Person' && parsed.author.name === 'George', 'Article author is Person (George)', rel);
          check(parsed.publisher && parsed.publisher['@type'] === 'Organization' && parsed.publisher.name === 'Jojjy', 'Article publisher is Organization (Jojjy)', rel);
          check(!!parsed.datePublished, 'Article has datePublished', rel);
          check(!!parsed.headline, 'Article has headline', rel);
          check(!!parsed.breadcrumb, 'Article has breadcrumb BreadcrumbList', rel);
          check(parsed.mainEntityOfPage === expectedCanonical, 'Article mainEntityOfPage matches canonical', rel);

          // In-page semantic elements in article
          check(/<time\s+datetime="\d{4}-\d{2}-\d{2}">/i.test(content), 'Article contains semantic <time datetime="..."> tag', rel);
          check(/<a\s+href="\.\.\/about\.html"\s+rel="author"[^>]*>George<\/a>/i.test(content), 'Article byline contains rel="author" link to George About page', rel);
        }
      } catch (e) {
        check(false, `JSON-LD parsing error: ${e.message}`, rel);
      }
    }
  }

  // Image audit: alt text & file existence on disk (audited across all pages)
  const imgRegex = /<img\s+([^>]+)>/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const imgAttrs = match[1];
    const altMatch = imgAttrs.match(/alt=["'](.*?)["']/i);
    check(altMatch !== null && altMatch[1].trim().length > 0, `Image has non-empty alt text: ${match[0].slice(0, 50)}`, rel);

    const srcMatch = imgAttrs.match(/src=["'](.*?)["']/i);
    if (srcMatch && !srcMatch[1].startsWith('http') && !srcMatch[1].startsWith('//')) {
      const srcPath = srcMatch[1].split('?')[0].split('#')[0];
      const resolved = path.resolve(path.dirname(f), srcPath);
      check(fs.existsSync(resolved), `Local image src exists on disk: ${srcPath}`, rel);
    }
  }

  // Internal links check (audited across all pages)
  const anchorRegex = /<a\s+[^>]*href=["']([^"'#]+)(?:#[^"']*)?["']/gi;
  let aMatch;
  while ((aMatch = anchorRegex.exec(content)) !== null) {
    const href = aMatch[1];
    if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
      const linkTarget = href.split('?')[0];
      const resolvedLink = path.resolve(path.dirname(f), linkTarget);
      check(fs.existsSync(resolvedLink), `Internal link target exists: ${href}`, rel);
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

check(sitemapUrls.length === 21, `Sitemap contains exactly 21 URLs (found ${sitemapUrls.length})`, 'sitemap.xml');
check(sitemapUrls.includes('https://jojjy.org/'), 'Sitemap includes homepage', 'sitemap.xml');
check(sitemapUrls.includes('https://jojjy.org/articles.html'), 'Sitemap includes articles.html', 'sitemap.xml');
check(sitemapUrls.includes('https://jojjy.org/about.html'), 'Sitemap includes about.html', 'sitemap.xml');
check(!sitemap.includes('article.html'), 'Sitemap does NOT include template article.html', 'sitemap.xml');
check(!sitemap.includes('404.html'), 'Sitemap does NOT include 404 error page', 'sitemap.xml');
check(!sitemap.includes('georgewrites.com'), 'Sitemap contains no external domain', 'sitemap.xml');

// Verify that every sitemap URL maps to a local file
sitemapUrls.forEach(url => {
  const relPath = url.replace('https://jojjy.org/', '') || 'index.html';
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
  check(manifest.name === 'Jojjy', 'manifest.json name is "Jojjy"', 'manifest.json');
  check(manifest.short_name === 'Jojjy', 'manifest.json short_name is "Jojjy"', 'manifest.json');
}

// 5. .htaccess verification
const htaccessPath = path.join(rootDir, '.htaccess');
check(fs.existsSync(htaccessPath), '.htaccess exists', '.htaccess');
const htaccess = fs.readFileSync(htaccessPath, 'utf8');
check(htaccess.includes('RewriteEngine On'), '.htaccess has RewriteEngine On', '.htaccess');
check(htaccess.includes('Strict-Transport-Security'), '.htaccess has HSTS header', '.htaccess');
check(htaccess.includes('AddOutputFilterByType DEFLATE'), '.htaccess has GZIP/Deflate compression', '.htaccess');
check(htaccess.includes('ExpiresActive On'), '.htaccess has browser caching rules', '.htaccess');
check(htaccess.includes('ErrorDocument 404 /404.html'), '.htaccess has ErrorDocument 404', '.htaccess');
check(htaccess.includes('ErrorDocument 403 /404.html'), '.htaccess has ErrorDocument 403', '.htaccess');
check(htaccess.includes('Options -Indexes'), '.htaccess disables directory browsing (Options -Indexes)', '.htaccess');
check(htaccess.includes('article\\.html'), '.htaccess redirects unpopulated template', '.htaccess');
check(htaccess.includes('docx|doc|odt|ps1|md|log|bak|tmp'), '.htaccess protects sensitive drafts and documents', '.htaccess');
check(htaccess.includes('RedirectMatch 404 ^/(src|scripts)'), '.htaccess isolates internal directories (/src/, /scripts/)', '.htaccess');

// 6. .gitignore verification
const gitignorePath = path.join(rootDir, '.gitignore');
check(fs.existsSync(gitignorePath), '.gitignore exists', '.gitignore');
const gitignore = fs.readFileSync(gitignorePath, 'utf8');
check(gitignore.includes('Articles to write about.docx'), '.gitignore ignores editorial brainstorm notes', '.gitignore');
check(gitignore.includes('*.docx'), '.gitignore ignores docx documents', '.gitignore');
check(gitignore.includes('drafts/'), '.gitignore ignores draft directory', '.gitignore');
check(gitignore.includes('*.report.html'), '.gitignore ignores audit reports', '.gitignore');

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
