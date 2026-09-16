const fs = require('fs');
const path = require('path');

// Configuration (can be overridden via CLI args e.g. node apply-seo.js --domain https://jojjy.com)
const args = process.argv.slice(2);
let domain = 'https://georgewrites.com';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--domain' && args[i + 1]) {
    domain = args[i + 1].replace(/\/$/, '');
  }
}

const siteName = 'George';
const authorName = 'George';
const authorEmail = 'hello@georgewrites.com';
const defaultOgImage = `${domain}/images/hero-countryside.png`;

// 18 Articles metadata lookup
const articlesMetadata = {
  'article-busy-isnt-faithful.html': {
    title: "Busy Isn't Faithful: Christian Work & Rest Essay | George",
    desc: "Martha was serving, but Jesus named the anxiety beneath her motion. Discover why frantic Christian busyness is not devotion and how to embrace true rest.",
    topic: "Work & Vocation",
    date: "2025-08-03",
    image: "images/business.jpg",
    words: 252,
    readTime: 1
  },
  'article-nobody-is-self-made.html': {
    title: "Nobody Is Self-Made: Humility, Work & Grace | George",
    desc: "Hands can bleed with honest effort and still stand on borrowed ground. An honest Christian reflection on Deuteronomy, humility, and the quiet gift of grace.",
    topic: "Work & Vocation",
    date: "2025-07-20",
    image: "images/writing-desk.png",
    words: 306,
    readTime: 2
  },
  'article-churches-dont-drift-toward-truth.html': {
    title: "Churches Don't Drift Toward Truth: Faith Essay | George",
    desc: "Theological drift is quiet, gradual, and always away from Christ. Explore how congregations lose their anchor and why guarding biblical truth demands resolve.",
    topic: "Discipleship",
    date: "2025-07-13",
    image: "images/truth.jpg",
    words: 337,
    readTime: 2
  },
  'article-faithfulness-can-feel-lonely.html': {
    title: "Faithfulness Can Feel Lonely: Christian Life | George",
    desc: "There is a quiet ache in staying true when culture walks away. Discover biblical encouragement for the isolation that often accompanies Christian integrity.",
    topic: "Suffering & Joy",
    date: "2025-07-06",
    image: "images/prayer_01.jpg",
    words: 379,
    readTime: 2
  },
  'article-god-doesnt-need-your-resume.html': {
    title: "God Doesn't Need Your Resume: Grace & Calling | George",
    desc: "Moses had a stutter, Gideon was hiding, and Peter denied Christ. A 5-minute essay on how God qualifies the called instead of demanding impressive credentials.",
    topic: "Discipleship",
    date: "2025-06-29",
    image: "images/open-bible.png",
    words: 960,
    readTime: 5
  },
  'article-your-mind-is-under-attack-and-you-dont-even-see-it.html': {
    title: "Your Mind Is Under Attack: Guarding Your Thoughts | George",
    desc: "The modern siege on faith is waged through constant digital distraction. Learn how the attention economy fragments the soul and how to guard your mind today.",
    topic: "Quiet Holiness",
    date: "2025-06-22",
    image: "images/newspapers.jpg",
    words: 427,
    readTime: 2
  },
  'article-terrified-of-silence.html': {
    title: "Terrified of Silence: Solitude & Prayer Essay | George",
    desc: "We fill our days with ambient noise because stillness forces us to confront who we are. An honest reflection on recovering quiet solitude and intimacy with God.",
    topic: "Quiet Holiness",
    date: "2025-06-15",
    image: "images/hero-countryside.png",
    words: 340,
    readTime: 2
  },
  'article-the-bible-was-never-about-you.html': {
    title: "The Bible Was Never About You: Scripture Truth | George",
    desc: "We often read Scripture like a self-help manual rather than the story of redemption. Discover how shifting the focus back to Jesus transforms how you read.",
    topic: "Reading Scripture",
    date: "2025-06-08",
    image: "images/open-bible.png",
    words: 774,
    readTime: 4
  },
  'article-the-jesus-you-missed-in-the-old-testament.html': {
    title: "The Jesus You Missed in the Old Testament | George",
    desc: "The Old Testament is rich with shadows, types, and promises fulfilled in Christ. Trace the redemptive threads from Genesis through the prophets in this essay.",
    topic: "Reading Scripture",
    date: "2025-06-01",
    image: "images/truth.jpg",
    words: 878,
    readTime: 4
  },
  'article-the-respectable-sin-nobody-talks-about.html': {
    title: "The Respectable Sin Nobody Talks About: Worry | George",
    desc: "We condemn outward vices while treating chronic worry as harmless. Explore why anxiety is a theological statement and how Romans 8 offers profound peace.",
    topic: "Quiet Holiness",
    date: "2025-05-25",
    image: "images/anxious.jpg",
    words: 1386,
    readTime: 7
  },
  'article-the-verse-that-is-slowly-killing-you.html': {
    title: "The Verse That Is Slowly Killing You: Context | George",
    desc: "Jeremiah 29:11 is printed on coffee mugs, yet rarely read in context. Unpack what God actually promised exiles in Babylon and why real hope is far deeper.",
    topic: "Reading Scripture",
    date: "2025-05-18",
    image: "images/open-bible.png",
    words: 844,
    readTime: 4
  },
  'article-you-were-not-made-for-sadness.html': {
    title: "You Were Not Made for Sadness: Joy & Sorrow | George",
    desc: "Paul commanded joy from a Roman dungeon because Christian joy is anchored in a Person, not circumstances. A thoughtful meditation on joy amidst real grief.",
    topic: "Suffering & Joy",
    date: "2025-05-11",
    image: "images/happiness.jpg",
    words: 1043,
    readTime: 5
  },
  'article-waiting-is-not-wasting.html': {
    title: "Waiting Is Not Wasting: Patience & Hope Essay | George",
    desc: "From Abraham to David, God used prolonged waiting seasons to forge character. Discover why waiting is never wasted time when God is the one doing the work.",
    topic: "Suffering & Joy",
    date: "2025-05-04",
    image: "images/prayer.jpg",
    words: 289,
    readTime: 1
  },
  'article-what-poverty-taught-me-about-riches.html': {
    title: "What Poverty Taught Me About Riches: Gratitude | George",
    desc: "Experiencing material scarcity strips away illusions of security and reveals true wealth. Read an honest reflection on contentment, simplicity, and grace.",
    topic: "Discipleship",
    date: "2025-04-27",
    image: "images/3.jpg",
    words: 391,
    readTime: 2
  },
  'article-whatever-you-do-as-unto-the-lord.html': {
    title: "Whatever You Do, As Unto the Lord: Daily Work | George",
    desc: "Colossians 3:23 transforms mundane routines, emails, and dishes into sacred worship. Discover how working as unto the Lord redeems ordinary daily labor.",
    topic: "Work & Vocation",
    date: "2025-04-20",
    image: "images/1.jpg",
    words: 324,
    readTime: 2
  },
  'article-why-friendship-feels-so-rare.html': {
    title: "Why Friendship Feels So Rare: Christian Community | George",
    desc: "We live in the most digitally connected yet loneliest generation in history. An honest essay exploring why deep biblical fellowship requires intentionality.",
    topic: "Discipleship",
    date: "2025-04-13",
    image: "images/marriage.jpg",
    words: 1168,
    readTime: 6
  },
  'article-work-existed-before-sin.html': {
    title: "Work Existed Before Sin: Purpose & Vocation | George",
    desc: "Work was instituted in the Garden of Eden before the Fall, not as a curse. Rediscover God's original design for meaningful daily labor, vocation, and rest.",
    topic: "Work & Vocation",
    date: "2025-04-06",
    image: "images/2.jpg",
    words: 950,
    readTime: 5
  },
  'article-you-are-not-your-job-title.html': {
    title: "You Are Not Your Job Title: Identity in Christ | George",
    desc: "When career titles collapse, what remains of your worth? A quiet meditation on untangling professional identity from who you truly are in the eyes of God.",
    topic: "Work & Vocation",
    date: "2025-03-30",
    image: "images/business.jpg",
    words: 301,
    readTime: 2
  }
};

const rootPages = {
  'index.html': {
    title: "George | Short Christian Essays on Faith, Work & Truth",
    desc: "A quiet publication of short, honest Christian essays on following Jesus through work, family, doubt, and ordinary life. Read slowly or subscribe free.",
    path: "",
    priority: "1.0",
    changefreq: "daily"
  },
  'articles.html': {
    title: "Christian Essays & Reflection Archive | Read Online | George",
    desc: "Browse 18 contemplative Christian essays exploring work, Scripture, quiet holiness, discipleship, and suffering. Filter by topic or search the full archive.",
    path: "articles.html",
    priority: "0.9",
    changefreq: "daily"
  },
  'about.html': {
    title: "About George | Quiet Reflections on Ordinary Christian Faith",
    desc: "Meet George, a pastor turned writer in the countryside sharing honest thoughts on following Jesus through the beautiful ordinary. Read the publication story.",
    path: "about.html",
    priority: "0.7",
    changefreq: "monthly"
  }
};

console.log(`Applying SEO suite with canonical domain: ${domain}`);

// Helper to inject/replace head tags
function updateHead(html, options) {
  const { title, desc, canonicalUrl, ogType, ogImage, jsonLd } = options;

  // 1. Replace Title
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);

  // 2. Replace or Insert Meta Description
  if (/<meta\s+name=["']description["']/i.test(html)) {
    html = html.replace(/<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="description" content="${desc}" />`);
  } else {
    html = html.replace(/<head>/i, `<head>\n    <meta name="description" content="${desc}" />`);
  }

  // 3. Remove existing canonical, og, twitter, json-ld tags to prevent duplicates
  html = html.replace(/\s*<link\s+rel=["']canonical["'][\s\S]*?>/gi, '');
  html = html.replace(/\s*<meta\s+property=["']og:[\s\S]*?>/gi, '');
  html = html.replace(/\s*<meta\s+name=["']twitter:[\s\S]*?>/gi, '');
  html = html.replace(/\s*<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/gi, '');

  // 4. Build Metadata Block
  const metaBlock = `
    <link rel="canonical" href="${canonicalUrl}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${ogType || 'website'}" />
    <meta property="og:site_name" content="${siteName}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:alt" content="${title}" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${canonicalUrl}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${ogImage}" />

    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>`;

  // Insert before </head>
  html = html.replace(/<\/head>/i, `${metaBlock}\n  </head>`);
  return html;
}

// -------------------------------------------------------------
// 1. Process Root Pages (index.html, articles.html, about.html)
// -------------------------------------------------------------
const today = new Date().toISOString().split('T')[0];

// index.html
{
  let indexHtml = fs.readFileSync('index.html', 'utf8');
  const pageMeta = rootPages['index.html'];
  const canonicalUrl = `${domain}/`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${domain}/#website`,
        "url": `${domain}/`,
        "name": siteName,
        "description": pageMeta.desc,
        "publisher": {
          "@type": "Organization",
          "@id": `${domain}/#organization`,
          "name": siteName,
          "url": `${domain}/`,
          "logo": {
            "@type": "ImageObject",
            "url": `${domain}/images/logo.png`,
            "width": 120,
            "height": 40
          }
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "Person",
        "@id": `${domain}/#author`,
        "name": authorName,
        "url": `${domain}/about.html`,
        "image": `${domain}/images/Me.png`,
        "description": "Pastor turned writer sharing short, honest reflections on ordinary Christian faith.",
        "email": authorEmail
      }
    ]
  };

  indexHtml = updateHead(indexHtml, {
    title: pageMeta.title,
    desc: pageMeta.desc,
    canonicalUrl,
    ogType: 'website',
    ogImage: defaultOgImage,
    jsonLd
  });

  // Ensure image dimensions on brand logo & avatar in index.html
  indexHtml = indexHtml.replace(/<img\s+src="images\/logo\.png"\s+alt="George"\s+class="brand-logo-img"\s*\/>/g,
    '<img src="images/logo.png" alt="George — Christian Essays Publication" class="brand-logo-img" width="120" height="32" />');
  indexHtml = indexHtml.replace(/<img\s+src="images\/Me\.png"\s+alt="George"\s+class="author-avatar-img"\s*\/>/g,
    '<img src="images/Me.png" alt="George — Author photo" class="author-avatar-img" width="24" height="24" />');

  fs.writeFileSync('index.html', indexHtml, 'utf8');
  console.log('Updated index.html');
}

// articles.html
{
  let articlesHtml = fs.readFileSync('articles.html', 'utf8');
  const pageMeta = rootPages['articles.html'];
  const canonicalUrl = `${domain}/articles.html`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${domain}/articles.html#collection`,
    "url": canonicalUrl,
    "name": pageMeta.title,
    "description": pageMeta.desc,
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${domain}/#website`,
      "url": `${domain}/`,
      "name": siteName
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `${domain}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Articles",
          "item": canonicalUrl
        }
      ]
    }
  };

  articlesHtml = updateHead(articlesHtml, {
    title: pageMeta.title,
    desc: pageMeta.desc,
    canonicalUrl,
    ogType: 'website',
    ogImage: defaultOgImage,
    jsonLd
  });

  articlesHtml = articlesHtml.replace(/<img\s+src="images\/logo\.png"\s+alt="George"\s+class="brand-logo-img"\s*\/>/g,
    '<img src="images/logo.png" alt="George — Christian Essays Publication" class="brand-logo-img" width="120" height="32" />');

  fs.writeFileSync('articles.html', articlesHtml, 'utf8');
  console.log('Updated articles.html');
}

// about.html
{
  let aboutHtml = fs.readFileSync('about.html', 'utf8');
  const pageMeta = rootPages['about.html'];
  const canonicalUrl = `${domain}/about.html`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${domain}/about.html#webpage`,
    "url": canonicalUrl,
    "name": pageMeta.title,
    "description": pageMeta.desc,
    "mainEntity": {
      "@type": "Person",
      "@id": `${domain}/#author`,
      "name": authorName,
      "url": canonicalUrl,
      "image": `${domain}/images/Me.png`,
      "jobTitle": "Writer & Former Pastor",
      "description": "Pastor turned writer sharing short, honest reflections on ordinary Christian faith, Scripture, and grace.",
      "email": authorEmail
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `${domain}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "About",
          "item": canonicalUrl
        }
      ]
    }
  };

  aboutHtml = updateHead(aboutHtml, {
    title: pageMeta.title,
    desc: pageMeta.desc,
    canonicalUrl,
    ogType: 'profile',
    ogImage: `${domain}/images/Me.png`,
    jsonLd
  });

  aboutHtml = aboutHtml.replace(/<img\s+src="images\/logo\.png"\s+alt="George"\s+class="brand-logo-img"\s*\/>/g,
    '<img src="images/logo.png" alt="George — Christian Essays Publication" class="brand-logo-img" width="120" height="32" />');

  fs.writeFileSync('about.html', aboutHtml, 'utf8');
  console.log('Updated about.html');
}

// -------------------------------------------------------------
// 2. Process All 18 Article Pages
// -------------------------------------------------------------
const articlesDir = 'articles';
const articleFiles = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));

articleFiles.forEach(file => {
  const filePath = path.join(articlesDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  const meta = articlesMetadata[file] || {
    title: `${file.replace(/^article-|\.html$/g, '').replace(/-/g, ' ')} | George`,
    desc: "Short, honest Christian reflections on faith, work, and following Jesus in ordinary life.",
    topic: "Faith",
    date: "2025-08-01",
    image: "images/hero-countryside.png",
    words: 500,
    readTime: 3
  };

  const canonicalUrl = `${domain}/articles/${file}`;
  const ogImageUrl = `${domain}/${meta.image}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonicalUrl}#article`,
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${domain}/#website`,
      "name": siteName,
      "url": `${domain}/`
    },
    "headline": meta.title.split(':')[0].replace(/ \| George$/, ''),
    "description": meta.desc,
    "url": canonicalUrl,
    "mainEntityOfPage": canonicalUrl,
    "datePublished": `${meta.date}T08:00:00+00:00`,
    "dateModified": `${meta.date}T08:00:00+00:00`,
    "author": {
      "@type": "Person",
      "@id": `${domain}/#author`,
      "name": authorName,
      "url": `${domain}/about.html`
    },
    "publisher": {
      "@type": "Organization",
      "@id": `${domain}/#organization`,
      "name": siteName,
      "url": `${domain}/`,
      "logo": {
        "@type": "ImageObject",
        "url": `${domain}/images/logo.png`,
        "width": 120,
        "height": 40
      }
    },
    "image": {
      "@type": "ImageObject",
      "url": ogImageUrl
    },
    "articleSection": meta.topic,
    "wordCount": meta.words,
    "inLanguage": "en-US",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `${domain}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Articles",
          "item": `${domain}/articles.html`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": meta.title.split(':')[0].replace(/ \| George$/, ''),
          "item": canonicalUrl
        }
      ]
    }
  };

  html = updateHead(html, {
    title: meta.title,
    desc: meta.desc,
    canonicalUrl,
    ogType: 'article',
    ogImage: ogImageUrl,
    jsonLd
  });

  // Fix brand logo alt and dimension in articles
  html = html.replace(/<img\s+src="\.\.\/images\/logo\.png"\s+alt="George"\s+class="brand-logo-img"\s*\/>/g,
    '<img src="../images/logo.png" alt="George — Christian Essays Publication" class="brand-logo-img" width="120" height="32" />');
  html = html.replace(/<img\s+src="\.\.\/images\/Me\.png"\s+alt="George"/g,
    '<img src="../images/Me.png" alt="George — Author photo" width="32" height="32"');

  // Fix dead footer anchor on articles if present
  html = html.replace(/href="#newsletter"/g, 'href="../index.html#newsletter"');

  fs.writeFileSync(filePath, html, 'utf8');
});
console.log(`Updated ${articleFiles.length} article pages in articles/`);

// -------------------------------------------------------------
// 3. Update article.html Template
// -------------------------------------------------------------
{
  let templateHtml = fs.readFileSync('article.html', 'utf8');
  // Fix dead anchor on line 251
  templateHtml = templateHtml.replace(/href="#newsletter"/g, 'href="index.html#newsletter"');
  templateHtml = templateHtml.replace(/<title>ARTICLE_TITLE \| George<\/title>/, '<title>ARTICLE_TITLE | Christian Faith Essays | George</title>');
  templateHtml = templateHtml.replace(/<img\s+src="images\/logo\.png"\s+alt="George"\s+class="brand-logo-img"\s*\/>/g,
    '<img src="images/logo.png" alt="George — Christian Essays Publication" class="brand-logo-img" width="120" height="32" />');

  fs.writeFileSync('article.html', templateHtml, 'utf8');
  console.log('Updated article.html template');
}

// -------------------------------------------------------------
// 4. Generate sitemap.xml
// -------------------------------------------------------------
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Site Pages -->
  <url>
    <loc>${domain}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domain}/articles.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/about.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Published Essays -->
`;

Object.keys(articlesMetadata).sort().forEach(file => {
  const meta = articlesMetadata[file];
  sitemapXml += `  <url>
    <loc>${domain}/articles/${file}</loc>
    <lastmod>${meta.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
});

sitemapXml += `</urlset>\n`;
fs.writeFileSync('sitemap.xml', sitemapXml, 'utf8');
console.log('Generated sitemap.xml');

// -------------------------------------------------------------
// 5. Generate robots.txt
// -------------------------------------------------------------
const robotsTxt = `# ==============================================================================
# ROBOTS.TXT FOR ${domain.toUpperCase()}
# ==============================================================================

User-agent: *
Allow: /
Allow: /articles/
Allow: /images/
Allow: /styles.css
Allow: /main.js

# Disallow Internal Utility, Source Drafts & Config Files
Disallow: /src/
Disallow: /scripts/
Disallow: /*.json$
Disallow: /*.ps1$
Disallow: /*.md$
Disallow: /*.docx$
Disallow: /.*

# XML Sitemap Location
Sitemap: ${domain}/sitemap.xml
`;

fs.writeFileSync('robots.txt', robotsTxt, 'utf8');
console.log('Generated robots.txt');

console.log('SEO pass completed successfully across all pages!');
