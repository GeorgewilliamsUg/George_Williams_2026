const fs = require('fs');
const path = require('path');

const rootDir = 'd:/Dev2026/George-2';
const domain = 'https://jojjy.org';

// Helper to ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 18 Articles metadata lookup with Title formula: [Article Title] — George
const articlesMetadata = {
  'article-busy-isnt-faithful.html': {
    slug: 'article-busy-isnt-faithful',
    headline: "Busy Isn't Faithful",
    title: "Busy Isn't Faithful — George",
    desc: "Martha was serving, but Jesus named the anxiety beneath her motion. Discover why frantic Christian busyness is not devotion and how to embrace true rest.",
    topic: "Work & Vocation",
    date: "2025-08-03",
    displayDate: "August 3, 2025",
    image: "images/business.jpg",
    words: 248,
    readTime: 1
  },
  'article-nobody-is-self-made.html': {
    slug: 'article-nobody-is-self-made',
    headline: "Nobody Is Self-Made",
    title: "Nobody Is Self-Made — George",
    desc: "Hands can bleed with honest effort and still stand on borrowed ground. An honest Christian reflection on Deuteronomy, humility, and the quiet gift of grace.",
    topic: "Work & Vocation",
    date: "2025-07-20",
    displayDate: "July 20, 2025",
    image: "images/writing-desk.png",
    words: 193,
    readTime: 1
  },
  'article-churches-dont-drift-toward-truth.html': {
    slug: 'article-churches-dont-drift-toward-truth',
    headline: "Churches Don't Drift Toward Truth",
    title: "Churches Don't Drift Toward Truth — George",
    desc: "Theological drift is quiet, gradual, and always away from Christ. Explore how congregations lose their anchor and why guarding biblical truth demands resolve.",
    topic: "Quiet Holiness",
    date: "2025-07-13",
    displayDate: "July 13, 2025",
    image: "images/truth.jpg",
    words: 332,
    readTime: 2
  },
  'article-faithfulness-can-feel-lonely.html': {
    slug: 'article-faithfulness-can-feel-lonely',
    headline: "Faithfulness Can Feel Lonely",
    title: "Faithfulness Can Feel Lonely — George",
    desc: "There is a quiet ache in staying true when culture walks away. Discover biblical encouragement for the isolation that often accompanies Christian integrity.",
    topic: "Suffering & Joy",
    date: "2025-07-06",
    displayDate: "July 6, 2025",
    image: "images/prayer_01.jpg",
    words: 375,
    readTime: 2
  },
  'article-god-doesnt-need-your-resume.html': {
    slug: 'article-god-doesnt-need-your-resume',
    headline: "God Doesn't Need Your Resume",
    title: "God Doesn't Need Your Resume — George",
    desc: "Moses had a stutter, Gideon was hiding, and Peter denied Christ. A reflection on how God qualifies the called instead of demanding impressive credentials.",
    topic: "Reading Scripture",
    date: "2025-06-29",
    displayDate: "June 29, 2025",
    image: "images/open-bible.png",
    words: 954,
    readTime: 5
  },
  'article-terrified-of-silence.html': {
    slug: 'article-terrified-of-silence',
    headline: "Terrified of Silence",
    title: "Terrified of Silence — George",
    desc: "We fill our days with ambient noise because stillness forces us to confront who we are. An honest reflection on recovering quiet solitude and intimacy with God.",
    topic: "Quiet Holiness",
    date: "2025-06-15",
    displayDate: "June 15, 2025",
    image: "images/hero-countryside.png",
    words: 337,
    readTime: 2
  },
  'article-the-bible-was-never-about-you.html': {
    slug: 'article-the-bible-was-never-about-you',
    headline: "The Bible Was Never About You",
    title: "The Bible Was Never About You — George",
    desc: "We often read Scripture like a self-help manual rather than the story of redemption. Discover how shifting the focus back to Jesus transforms how you read.",
    topic: "Reading Scripture",
    date: "2025-06-08",
    displayDate: "June 8, 2025",
    image: "images/open-bible.png",
    words: 738,
    readTime: 4
  },
  'article-the-jesus-you-missed-in-the-old-testament.html': {
    slug: 'article-the-jesus-you-missed-in-the-old-testament',
    headline: "The Jesus You Missed in the Old Testament",
    title: "The Jesus You Missed in the Old Testament — George",
    desc: "The Old Testament is rich with shadows, types, and promises fulfilled in Christ. Trace the redemptive threads from Genesis through the prophets in this essay.",
    topic: "Reading Scripture",
    date: "2025-06-01",
    displayDate: "June 1, 2025",
    image: "images/truth.jpg",
    words: 869,
    readTime: 4
  },
  'article-the-respectable-sin-nobody-talks-about.html': {
    slug: 'article-the-respectable-sin-nobody-talks-about',
    headline: "The Respectable Sin Nobody Talks About",
    title: "The Respectable Sin Nobody Talks About — George",
    desc: "We condemn outward vices while treating chronic worry as harmless. Explore why anxiety is a theological statement and how Romans 8 offers profound peace.",
    topic: "Quiet Holiness",
    date: "2025-05-25",
    displayDate: "May 25, 2025",
    image: "images/anxious.jpg",
    words: 1373,
    readTime: 7
  },
  'article-the-verse-that-is-slowly-killing-you.html': {
    slug: 'article-the-verse-that-is-slowly-killing-you',
    headline: "The Verse That Is Slowly Killing You",
    title: "The Verse That Is Slowly Killing You — George",
    desc: "Jeremiah 29:11 is printed on coffee mugs, yet rarely read in context. Unpack what God actually promised exiles in Babylon and why real hope is far deeper.",
    topic: "Reading Scripture",
    date: "2025-05-18",
    displayDate: "May 18, 2025",
    image: "images/open-bible.png",
    words: 836,
    readTime: 4
  },
  'article-you-were-not-made-for-sadness.html': {
    slug: 'article-you-were-not-made-for-sadness',
    headline: "You Were Not Made for Sadness",
    title: "You Were Not Made for Sadness — George",
    desc: "Grief and brokenness are intruders in God's good creation. A compassionate Christian reflection on enduring sorrow with the sure hope of resurrection joy.",
    topic: "Suffering & Joy",
    date: "2025-05-11",
    displayDate: "May 11, 2025",
    image: "images/happiness.jpg",
    words: 1014,
    readTime: 5
  },
  'article-waiting-is-not-wasting.html': {
    slug: 'article-waiting-is-not-wasting',
    headline: "Waiting Is Not Wasting",
    title: "Waiting Is Not Wasting — George",
    desc: "In seasons of delay, we assume God is absent or silent. Discover how spiritual waiting actively shapes endurance, prayer, and deep faith in Christ.",
    topic: "Suffering & Joy",
    date: "2025-05-04",
    displayDate: "May 4, 2025",
    image: "images/prayer.jpg",
    words: 276,
    readTime: 1
  },
  'article-what-poverty-taught-me-about-riches.html': {
    slug: 'article-what-poverty-taught-me-about-riches',
    headline: "What Poverty Taught Me About Riches",
    title: "What Poverty Taught Me About Riches — George",
    desc: "Material abundance often masks spiritual impoverishment. A heartfelt reflection on Christian stewardship, gratitude, and true treasure in the kingdom.",
    topic: "Work & Vocation",
    date: "2025-04-27",
    displayDate: "April 27, 2025",
    image: "images/3.jpg",
    words: 385,
    readTime: 2
  },
  'article-whatever-you-do-as-unto-the-lord.html': {
    slug: 'article-whatever-you-do-as-unto-the-lord',
    headline: "Whatever You Do, As Unto the Lord",
    title: "Whatever You Do, As Unto the Lord — George",
    desc: "Colossians 3 transforms mundane tasks into acts of worship. Explore how everyday labor, quiet chores, and unseen faithfulness become holy offerings to God.",
    topic: "Work & Vocation",
    date: "2025-04-20",
    displayDate: "April 20, 2025",
    image: "images/1.jpg",
    words: 264,
    readTime: 1
  },
  'article-why-friendship-feels-so-rare.html': {
    slug: 'article-why-friendship-feels-so-rare',
    headline: "Why Friendship Feels So Rare",
    title: "Why Friendship Feels So Rare — George",
    desc: "Modern busyness has reduced deep covenant bonds to superficial digital interactions. Discover why biblical fellowship requires vulnerability and time.",
    topic: "Suffering & Joy",
    date: "2025-04-13",
    displayDate: "April 13, 2025",
    image: "images/marriage.jpg",
    words: 1157,
    readTime: 6
  },
  'article-work-existed-before-sin.html': {
    slug: 'article-work-existed-before-sin',
    headline: "Work Existed Before Sin",
    title: "Work Existed Before Sin — George",
    desc: "Work was instituted in the Garden of Eden before the Fall, not as a curse. Rediscover God's original design for meaningful daily labor, vocation, and rest.",
    topic: "Work & Vocation",
    date: "2025-04-06",
    displayDate: "April 6, 2025",
    image: "images/2.jpg",
    words: 945,
    readTime: 5
  },
  'article-you-are-not-your-job-title.html': {
    slug: 'article-you-are-not-your-job-title',
    headline: "You Are Not Your Job Title",
    title: "You Are Not Your Job Title — George",
    desc: "When career titles collapse, what remains of your worth? A quiet meditation on untangling professional identity from who you truly are in the eyes of God.",
    topic: "Work & Vocation",
    date: "2025-03-30",
    displayDate: "March 30, 2025",
    image: "images/business.jpg",
    words: 285,
    readTime: 1
  },
  'article-your-mind-is-under-attack-and-you-dont-even-see-it.html': {
    slug: 'article-your-mind-is-under-attack-and-you-dont-even-see-it',
    headline: "Your Mind Is Under Attack",
    title: "Your Mind Is Under Attack — George",
    desc: "The modern siege on faith is waged through constant digital distraction. Learn how the attention economy fragments the soul and how to guard your mind today.",
    topic: "Quiet Holiness",
    date: "2025-03-23",
    displayDate: "March 23, 2025",
    image: "images/newspapers.jpg",
    words: 399,
    readTime: 2
  },
};

// Clean URL normalizer for HTML content
function cleanLinksAndAssets(html) {
  let res = html;

  // 1. Root-relative CSS & JS
  res = res.replace(/href=["'](?:\.\.\/)?styles\.css["']/g, 'href="/styles.css"');
  res = res.replace(/src=["'](?:\.\.\/)?main\.js["']/g, 'src="/main.js"');
  res = res.replace(/src=["'](?:\.\.\/)?motion\.js["']/g, 'src="/motion.js"');

  // 2. Root-relative Favicons & Manifest
  res = res.replace(/href=["'](?:\.\.\/)?images\/favicon\/([^"']+)["']/g, 'href="/images/favicon/$1"');

  // 3. Root-relative Images
  res = res.replace(/src=["'](?:\.\.\/)?images\/([^"']+)["']/g, 'src="/images/$1"');

  // 4. Clean Internal Navigation & Hyperlinks
  // Home
  res = res.replace(/href=["'](?:\.\.\/)?index\.html#collections["']/g, 'href="/home/#collections"');
  res = res.replace(/href=["'](?:\.\.\/)?index\.html#newsletter["']/g, 'href="/home/#newsletter"');
  res = res.replace(/href=["'](?:\.\.\/)?index\.html["']/g, 'href="/home/"');

  // Articles archive with and without query params
  res = res.replace(/href=["'](?:\.\.\/)?articles\.html\?topic=([^"']+)["']/g, 'href="/articles/?topic=$1"');
  res = res.replace(/href=["'](?:\.\.\/)?articles\.html["']/g, 'href="/articles/"');

  // About page
  res = res.replace(/href=["'](?:\.\.\/)?about\.html["']/g, 'href="/about/"');

  // Individual articles
  Object.keys(articlesMetadata).forEach(file => {
    const meta = articlesMetadata[file];
    const regex1 = new RegExp(`href=["'](?:\\.\\.\\/)?articles\\/${file}["']`, 'g');
    const regex2 = new RegExp(`href=["']${file}["']`, 'g');
    res = res.replace(regex1, `href="/articles/${meta.slug}/"`);
    res = res.replace(regex2, `href="/articles/${meta.slug}/"`);
  });

  res = res.replace(/\/>\s*\/>/g, '/>');
  return res;
}

// -------------------------------------------------------------
// 1. Build and Update /home/ & root index.html
// -------------------------------------------------------------
console.log('Processing Homepage (/home/ and /)...');
let homeHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
homeHtml = cleanLinksAndAssets(homeHtml);

const homeTitle = "George — Christian Essays on Faith, Life & Work";
homeHtml = homeHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${homeTitle}</title>`);
homeHtml = homeHtml.replace(/<link\s+rel=["']canonical["']\s+href=["'][^"']*["'](?:\s*\/>|>)/gi,
  `<link rel="canonical" href="${domain}/home/" />`);
homeHtml = homeHtml.replace(/<meta\s+property=["']og:url["']\s+content=["'][^"']*["'](?:\s*\/>|>)/gi,
  `<meta property="og:url" content="${domain}/home/" />`);
homeHtml = homeHtml.replace(/<meta\s+name=["']twitter:url["']\s+content=["'][^"']*["'](?:\s*\/>|>)/gi,
  `<meta name="twitter:url" content="${domain}/home/" />`);

homeHtml = homeHtml.replace(/<meta\s+property=["']og:title["'][^\n\r]*\r?\n?/gi, '');
homeHtml = homeHtml.replace(/(<meta\s+property=["']og:site_name["'][^\n\r]*\r?\n?)/gi,
  `$1    <meta property="og:title" content="${homeTitle}" />\n`);
homeHtml = homeHtml.replace(/<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["'](?:\s*\/>|>)/gi,
  `<meta name="twitter:title" content="${homeTitle}" />`);

// Update structured data in home
homeHtml = homeHtml.replace(/"url":\s*"https:\/\/jojjy\.org\/about\.html"/g, `"url": "${domain}/about/"`);
homeHtml = homeHtml.replace(/"url":\s*"https:\/\/jojjy\.org\/about\/"/g, `"url": "${domain}/about/"`);
homeHtml = homeHtml.replace(/"url":\s*"https:\/\/jojjy\.org\/articles\.html"/g, `"url": "${domain}/articles/"`);
homeHtml = homeHtml.replace(/"url":\s*"https:\/\/jojjy\.org\/articles\/"/g, `"url": "${domain}/articles/"`);

// Write to home/index.html
ensureDir(path.join(rootDir, 'home'));
fs.writeFileSync(path.join(rootDir, 'home/index.html'), homeHtml, 'utf8');

// Write to root index.html (also keeps root functional)
fs.writeFileSync(path.join(rootDir, 'index.html'), homeHtml, 'utf8');
console.log('Created /home/index.html and updated root index.html');

// -------------------------------------------------------------
// 2. Build and Update /about/ & about.html
// -------------------------------------------------------------
console.log('Processing About page (/about/)...');
let aboutHtml = fs.readFileSync(path.join(rootDir, 'about.html'), 'utf8');
aboutHtml = cleanLinksAndAssets(aboutHtml);

const aboutTitle = "About George — Writer & Essays on Ordinary Faith";
aboutHtml = aboutHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${aboutTitle}</title>`);
aboutHtml = aboutHtml.replace(/<link\s+rel=["']canonical["']\s+href=["'][^"']*["'](?:\s*\/>|>)/gi,
  `<link rel="canonical" href="${domain}/about/" />`);
aboutHtml = aboutHtml.replace(/<meta\s+property=["']og:url["']\s+content=["'][^"']*["'](?:\s*\/>|>)/gi,
  `<meta property="og:url" content="${domain}/about/" />`);
aboutHtml = aboutHtml.replace(/<meta\s+name=["']twitter:url["']\s+content=["'][^"']*["'](?:\s*\/>|>)/gi,
  `<meta name="twitter:url" content="${domain}/about/" />`);

if (aboutHtml.includes('property="og:title"')) {
  aboutHtml = aboutHtml.replace(/<meta\s+property=["']og:title["']\s+content=["'][^"']*["'](?:\s*\/>|>)/gi,
    `<meta property="og:title" content="${aboutTitle}" />`);
} else {
  aboutHtml = aboutHtml.replace(/(<meta\s+property=["']og:site_name["']\s+content=["'][^"']*["'](?:\s*\/>|>))/gi,
    `$1\n    <meta property="og:title" content="${aboutTitle}" />`);
}
aboutHtml = aboutHtml.replace(/<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["'](?:\s*\/>|>)/gi,
  `<meta name="twitter:title" content="${aboutTitle}" />`);

// Structured data
aboutHtml = aboutHtml.replace(/"@id":\s*"https:\/\/jojjy\.org\/about\.html#profile"/g,
  `"@id": "${domain}/about/#profile"`);
aboutHtml = aboutHtml.replace(/"url":\s*"https:\/\/jojjy\.org\/about\.html"/g,
  `"url": "${domain}/about/"`);
aboutHtml = aboutHtml.replace(/"item":\s*"https:\/\/jojjy\.org\/about\.html"/g,
  `"item": "${domain}/about/"`);
aboutHtml = aboutHtml.replace(/"item":\s*"https:\/\/jojjy\.org\/"/g,
  `"item": "${domain}/home/"`);
aboutHtml = aboutHtml.replace(/"sameAs":\s*\[\s*"https:\/\/jojjy\.org\/about\.html"\s*\]/g,
  `"sameAs": ["${domain}/about/"]`);

ensureDir(path.join(rootDir, 'about'));
fs.writeFileSync(path.join(rootDir, 'about/index.html'), aboutHtml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'about.html'), aboutHtml, 'utf8');
console.log('Created /about/index.html and updated about.html');

// -------------------------------------------------------------
// 3. Build and Update /articles/ & articles.html
// -------------------------------------------------------------
console.log('Processing Articles archive (/articles/)...');
let articlesHtml = fs.readFileSync(path.join(rootDir, 'articles.html'), 'utf8');
articlesHtml = cleanLinksAndAssets(articlesHtml);

const articlesTitle = "Articles — George";
articlesHtml = articlesHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${articlesTitle}</title>`);
articlesHtml = articlesHtml.replace(/<link\s+rel=["']canonical["']\s+href=["'][^"']*["'](?:\s*\/>|>)/gi,
  `<link rel="canonical" href="${domain}/articles/" />`);
articlesHtml = articlesHtml.replace(/<meta\s+property=["']og:url["']\s+content=["'][^"']*["'](?:\s*\/>|>)/gi,
  `<meta property="og:url" content="${domain}/articles/" />`);
articlesHtml = articlesHtml.replace(/<meta\s+name=["']twitter:url["']\s+content=["'][^"']*["'](?:\s*\/>|>)/gi,
  `<meta name="twitter:url" content="${domain}/articles/" />`);

if (articlesHtml.includes('property="og:title"')) {
  articlesHtml = articlesHtml.replace(/<meta\s+property=["']og:title["']\s+content=["'][^"']*["'](?:\s*\/>|>)/gi,
    `<meta property="og:title" content="${articlesTitle}" />`);
} else {
  articlesHtml = articlesHtml.replace(/(<meta\s+property=["']og:site_name["']\s+content=["'][^"']*["'](?:\s*\/>|>))/gi,
    `$1\n    <meta property="og:title" content="${articlesTitle}" />`);
}
articlesHtml = articlesHtml.replace(/<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["'](?:\s*\/>|>)/gi,
  `<meta name="twitter:title" content="${articlesTitle}" />`);

// Structured data
articlesHtml = articlesHtml.replace(/"@id":\s*"https:\/\/jojjy\.org\/articles\.html#collection"/g,
  `"@id": "${domain}/articles/#collection"`);
articlesHtml = articlesHtml.replace(/"url":\s*"https:\/\/jojjy\.org\/articles\.html"/g,
  `"url": "${domain}/articles/"`);
articlesHtml = articlesHtml.replace(/"item":\s*"https:\/\/jojjy\.org\/articles\.html"/g,
  `"item": "${domain}/articles/"`);
articlesHtml = articlesHtml.replace(/"item":\s*"https:\/\/jojjy\.org\/"/g,
  `"item": "${domain}/home/"`);
articlesHtml = articlesHtml.replace(/"url":\s*"https:\/\/jojjy\.org\/about\.html"/g,
  `"url": "${domain}/about/"`);

// ItemList entries
Object.keys(articlesMetadata).forEach(file => {
  const meta = articlesMetadata[file];
  articlesHtml = articlesHtml.replace(new RegExp(`"url":\\s*"https:\\/\\/jojjy\\.org\\/articles\\/${file}"`, 'g'),
    `"url": "${domain}/articles/${meta.slug}/"`);
});

ensureDir(path.join(rootDir, 'articles'));
fs.writeFileSync(path.join(rootDir, 'articles/index.html'), articlesHtml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'articles.html'), articlesHtml, 'utf8');
console.log('Created /articles/index.html and updated articles.html');

// -------------------------------------------------------------
// 4. Build and Update Each Article Directory (/articles/[slug]/)
// -------------------------------------------------------------
console.log('Processing 18 Article Pages into /articles/[slug]/ directories...');
Object.keys(articlesMetadata).forEach(file => {
  const meta = articlesMetadata[file];
  const oldPath = path.join(rootDir, 'articles', file);
  let html = fs.readFileSync(oldPath, 'utf8');
  html = cleanLinksAndAssets(html);

  const cleanUrl = `${domain}/articles/${meta.slug}/`;

  // Canonical & OG & Twitter
  html = html.replace(/<link\s+rel=["']canonical["']\s+href=["'][^"']*["'](?:\s*\/>|>)/gi,
    `<link rel="canonical" href="${cleanUrl}" />`);
  html = html.replace(/<meta\s+property=["']og:url["']\s+content=["'][^"']*["'](?:\s*\/>|>)/gi,
    `<meta property="og:url" content="${cleanUrl}" />`);
  html = html.replace(/<meta\s+name=["']twitter:url["']\s+content=["'][^"']*["'](?:\s*\/>|>)/gi,
    `<meta name="twitter:url" content="${cleanUrl}" />`);
  html = html.replace(/<meta\s+property=["']article:author["']\s+content=["'][^"']*["'](?:\s*\/>|>)/gi,
    `<meta property="article:author" content="${domain}/about/" />`);

  // Structured Data
  html = html.replace(new RegExp(`"@id":\\s*"https:\\/\\/jojjy\\.org\\/articles\\/${file}#article"`, 'g'),
    `"@id": "${cleanUrl}#article"`);
  html = html.replace(new RegExp(`"url":\\s*"https:\\/\\/jojjy\\.org\\/articles\\/${file}"`, 'g'),
    `"url": "${cleanUrl}"`);
  html = html.replace(new RegExp(`"mainEntityOfPage":\\s*"https:\\/\\/jojjy\\.org\\/articles\\/${file}"`, 'g'),
    `"mainEntityOfPage": "${cleanUrl}"`);
  html = html.replace(/"url":\s*"https:\/\/jojjy\.org\/about\.html"/g,
    `"url": "${domain}/about/"`);
  html = html.replace(new RegExp(`"item":\\s*"https:\\/\\/jojjy\\.org\\/articles\\/${file}"`, 'g'),
    `"item": "${cleanUrl}"`);
  html = html.replace(/"item":\s*"https:\/\/jojjy\.org\/articles\.html"/g,
    `"item": "${domain}/articles/"`);
  html = html.replace(/"item":\s*"https:\/\/jojjy\.org\/"/g,
    `"item": "${domain}/home/"`);

  // Create directory articles/article-[slug]/
  const articleDir = path.join(rootDir, 'articles', meta.slug);
  ensureDir(articleDir);
  fs.writeFileSync(path.join(articleDir, 'index.html'), html, 'utf8');

  // Also update original .html file
  fs.writeFileSync(oldPath, html, 'utf8');
});
console.log('All 18 article directories created with index.html!');

// -------------------------------------------------------------
// 5. Update 404.html and article.html Template
// -------------------------------------------------------------
console.log('Updating 404.html and article.html...');
let errorHtml = fs.readFileSync(path.join(rootDir, '404.html'), 'utf8');
errorHtml = cleanLinksAndAssets(errorHtml);
fs.writeFileSync(path.join(rootDir, '404.html'), errorHtml, 'utf8');

let templateHtml = fs.readFileSync(path.join(rootDir, 'article.html'), 'utf8');
templateHtml = cleanLinksAndAssets(templateHtml);
fs.writeFileSync(path.join(rootDir, 'article.html'), templateHtml, 'utf8');

// -------------------------------------------------------------
// 6. Generate New sitemap.xml with Clean Trailing Slash URLs
// -------------------------------------------------------------
console.log('Generating updated sitemap.xml...');
const today = new Date().toISOString().split('T')[0];
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Publication Pages -->
  <url>
    <loc>${domain}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domain}/home/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domain}/articles/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/about/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Published Essays by George -->
`;

Object.keys(articlesMetadata).sort().forEach(file => {
  const meta = articlesMetadata[file];
  sitemapXml += `  <url>
    <loc>${domain}/articles/${meta.slug}/</loc>
    <lastmod>${meta.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
});

sitemapXml += `</urlset>\n`;
fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), sitemapXml, 'utf8');
console.log('Generated sitemap.xml with 22 clean trailing-slash URLs.');

// -------------------------------------------------------------
// 7. Update .htaccess with 301 Permanent Redirects to Clean URLs
// -------------------------------------------------------------
console.log('Updating .htaccess with clean URL redirects...');
const htaccessContent = `# ==============================================================================
# PRODUCTION SERVER CONFIGURATION (.htaccess) — JOJJY.ORG
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Custom Error Documents (Editorial Branded 404 Experience)
# ------------------------------------------------------------------------------
ErrorDocument 404 /404.html
ErrorDocument 403 /404.html

# ------------------------------------------------------------------------------
# 2. Prevent Directory Browsing & Enforce Trailing Slash
# ------------------------------------------------------------------------------
Options -Indexes
<IfModule mod_dir.c>
  DirectorySlash On
  DirectoryIndex index.html
</IfModule>

# ------------------------------------------------------------------------------
# 3. Enforce HTTPS, Canonical Domain & Clean Trailing Slash URLs (301 Redirects)
# ------------------------------------------------------------------------------
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Enforce canonical non-www over HTTPS in a single step
  RewriteCond %{HTTP_HOST} ^www\.(.+)$ [NC]
  RewriteRule ^(.*)$ https://%1/$1 [R=301,L]

  # Redirect remaining HTTP non-www to HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

  # 301 Redirect legacy /index.html to /home/
  RewriteCond %{THE_REQUEST} \\s/index\\.html[?\\s] [NC]
  RewriteRule ^index\\.html$ /home/ [R=301,L]

  # 301 Redirect legacy /about.html to /about/
  RewriteCond %{THE_REQUEST} \\s/about\\.html[?\\s] [NC]
  RewriteRule ^about\\.html$ /about/ [R=301,L]

  # 301 Redirect legacy /articles.html to /articles/
  RewriteCond %{THE_REQUEST} \\s/articles\\.html[?\\s] [NC]
  RewriteRule ^articles\\.html$ /articles/ [R=301,L]

  # 301 Redirect legacy /articles/article-*.html to clean directory /articles/article-*/
  RewriteCond %{THE_REQUEST} \\s/articles/(article-[^/.]+)\\.html[?\\s] [NC]
  RewriteRule ^articles/(article-[^/.]+)\\.html$ /articles/$1/ [R=301,L]

  # Redirect direct requests for unpopulated template to essay archive
  RewriteRule ^article\\.html$ /articles/ [R=301,L]
</IfModule>

# ------------------------------------------------------------------------------
# 4. Sensitive Files, Drafts & Directory Protection
# ------------------------------------------------------------------------------
# Block direct web access to private documents, shell scripts, logs, and markdown
<FilesMatch "\\.(docx|doc|odt|ps1|md|log|bak|tmp)$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order deny,allow
    Deny from all
  </IfModule>
</FilesMatch>

# Block deployment configuration and manifest JSON files (manifest.json remains public)
<FilesMatch "(deploy-config.*|deploy-manifest|deploy-state|\\.skills)\\.json$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order deny,allow
    Deny from all
  </IfModule>
</FilesMatch>

# Block hidden files and directories (.git, .env, .htaccess, etc.)
<FilesMatch "^\\.">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order deny,allow
    Deny from all
  </IfModule>
</FilesMatch>

# Block direct access to internal directories (source notes & maintenance scripts)
RedirectMatch 404 ^/(src|scripts)(/.*)?$

# ------------------------------------------------------------------------------
# 5. Security Headers
# ------------------------------------------------------------------------------
<IfModule mod_headers.c>
  # HTTP Strict Transport Security (HSTS)
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  
  # Prevent Clickjacking
  Header always set X-Frame-Options "SAMEORIGIN"
  
  # Prevent MIME sniffing
  Header always set X-Content-Type-Options "nosniff"
  
  # Referrer Policy
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  
  # Permissions Policy
  Header always set Permissions-Policy "geolocation=(self), microphone=(), camera=()"
</IfModule>

# ------------------------------------------------------------------------------
# 6. Enable GZIP / Deflate Compression (Speed & Core Web Vitals)
# ------------------------------------------------------------------------------
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript
  AddOutputFilterByType DEFLATE application/xml application/xhtml+xml application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript application/x-javascript
  AddOutputFilterByType DEFLATE application/json application/ld+json
  AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# ------------------------------------------------------------------------------
# 7. Leverage Browser Caching
# ------------------------------------------------------------------------------
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 month"

  # HTML documents (short cache for quick updates)
  ExpiresByType text/html "access plus 1 hour"

  # Data feeds
  ExpiresByType application/json "access plus 1 hour"
  ExpiresByType application/ld+json "access plus 1 hour"
  ExpiresByType text/xml "access plus 1 hour"
  ExpiresByType application/xml "access plus 1 hour"

  # CSS and JavaScript
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/javascript "access plus 1 year"

  # Media files (Images & Fonts)
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/x-icon "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType font/woff "access plus 1 year"
</IfModule>
`;

fs.writeFileSync(path.join(rootDir, '.htaccess'), htaccessContent, 'utf8');
console.log('Updated .htaccess with clean URL redirects and DirectorySlash enforcement.');

console.log('\nMigration to clean directory URLs completed successfully!');
