const fs = require('fs');
const path = require('path');

// Configuration
const args = process.argv.slice(2);
let domain = 'https://jojjy.org';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--domain' && args[i + 1]) {
    domain = args[i + 1].replace(/\/$/, '');
  }
}

const siteName = 'Jojjy';
const authorName = 'George';
const authorEmail = 'hello@georgewrites.com';
const authorUrl = `${domain}/about.html`;
const defaultOgImage = `${domain}/images/hero-countryside.png`;

// 18 Articles metadata lookup with Title formula: [Article Title] — George | Jojjy
const articlesMetadata = {
  'article-busy-isnt-faithful.html': {
    headline: "Busy Isn't Faithful",
    title: "Busy Isn't Faithful — George | Jojjy",
    desc: "Martha was serving, but Jesus named the anxiety beneath her motion. Discover why frantic Christian busyness is not devotion and how to embrace true rest.",
    topic: "Work & Vocation",
    date: "2025-08-03",
    displayDate: "August 3, 2025",
    image: "images/business.jpg",
    words: 252,
    readTime: 1
  },
  'article-nobody-is-self-made.html': {
    headline: "Nobody Is Self-Made",
    title: "Nobody Is Self-Made — George | Jojjy",
    desc: "Hands can bleed with honest effort and still stand on borrowed ground. An honest Christian reflection on Deuteronomy, humility, and the quiet gift of grace.",
    topic: "Work & Vocation",
    date: "2025-07-20",
    displayDate: "July 20, 2025",
    image: "images/writing-desk.png",
    words: 306,
    readTime: 2
  },
  'article-churches-dont-drift-toward-truth.html': {
    headline: "Churches Don't Drift Toward Truth",
    title: "Churches Don't Drift Toward Truth — George | Jojjy",
    desc: "Theological drift is quiet, gradual, and always away from Christ. Explore how congregations lose their anchor and why guarding biblical truth demands resolve.",
    topic: "Discipleship",
    date: "2025-07-13",
    displayDate: "July 13, 2025",
    image: "images/truth.jpg",
    words: 337,
    readTime: 2
  },
  'article-faithfulness-can-feel-lonely.html': {
    headline: "Faithfulness Can Feel Lonely",
    title: "Faithfulness Can Feel Lonely — George | Jojjy",
    desc: "There is a quiet ache in staying true when culture walks away. Discover biblical encouragement for the isolation that often accompanies Christian integrity.",
    topic: "Suffering & Joy",
    date: "2025-07-06",
    displayDate: "July 6, 2025",
    image: "images/prayer_01.jpg",
    words: 379,
    readTime: 2
  },
  'article-god-doesnt-need-your-resume.html': {
    headline: "God Doesn't Need Your Resume",
    title: "God Doesn't Need Your Resume — George | Jojjy",
    desc: "Moses had a stutter, Gideon was hiding, and Peter denied Christ. A 5-minute essay on how God qualifies the called instead of demanding impressive credentials.",
    topic: "Discipleship",
    date: "2025-06-29",
    displayDate: "June 29, 2025",
    image: "images/open-bible.png",
    words: 960,
    readTime: 5
  },
  'article-your-mind-is-under-attack-and-you-dont-even-see-it.html': {
    headline: "Your Mind Is Under Attack",
    title: "Your Mind Is Under Attack — George | Jojjy",
    desc: "The modern siege on faith is waged through constant digital distraction. Learn how the attention economy fragments the soul and how to guard your mind today.",
    topic: "Quiet Holiness",
    date: "2025-03-23",
    displayDate: "March 23, 2025",
    image: "images/newspapers.jpg",
    words: 427,
    readTime: 2
  },
  'article-terrified-of-silence.html': {
    headline: "Terrified of Silence",
    title: "Terrified of Silence — George | Jojjy",
    desc: "We fill our days with ambient noise because stillness forces us to confront who we are. An honest reflection on recovering quiet solitude and intimacy with God.",
    topic: "Quiet Holiness",
    date: "2025-06-15",
    displayDate: "June 15, 2025",
    image: "images/hero-countryside.png",
    words: 340,
    readTime: 2
  },
  'article-the-bible-was-never-about-you.html': {
    headline: "The Bible Was Never About You",
    title: "The Bible Was Never About You — George | Jojjy",
    desc: "We often read Scripture like a self-help manual rather than the story of redemption. Discover how shifting the focus back to Jesus transforms how you read.",
    topic: "Reading Scripture",
    date: "2025-06-08",
    displayDate: "June 8, 2025",
    image: "images/open-bible.png",
    words: 774,
    readTime: 4
  },
  'article-the-jesus-you-missed-in-the-old-testament.html': {
    headline: "The Jesus You Missed in the Old Testament",
    title: "The Jesus You Missed in the Old Testament — George | Jojjy",
    desc: "The Old Testament is rich with shadows, types, and promises fulfilled in Christ. Trace the redemptive threads from Genesis through the prophets in this essay.",
    topic: "Reading Scripture",
    date: "2025-06-01",
    displayDate: "June 1, 2025",
    image: "images/truth.jpg",
    words: 878,
    readTime: 4
  },
  'article-the-respectable-sin-nobody-talks-about.html': {
    headline: "The Respectable Sin Nobody Talks About",
    title: "The Respectable Sin Nobody Talks About — George | Jojjy",
    desc: "We condemn outward vices while treating chronic worry as harmless. Explore why anxiety is a theological statement and how Romans 8 offers profound peace.",
    topic: "Quiet Holiness",
    date: "2025-05-25",
    displayDate: "May 25, 2025",
    image: "images/anxious.jpg",
    words: 1386,
    readTime: 7
  },
  'article-the-verse-that-is-slowly-killing-you.html': {
    headline: "The Verse That Is Slowly Killing You",
    title: "The Verse That Is Slowly Killing You — George | Jojjy",
    desc: "Jeremiah 29:11 is printed on coffee mugs, yet rarely read in context. Unpack what God actually promised exiles in Babylon and why real hope is far deeper.",
    topic: "Reading Scripture",
    date: "2025-05-18",
    displayDate: "May 18, 2025",
    image: "images/open-bible.png",
    words: 844,
    readTime: 4
  },
  'article-you-were-not-made-for-sadness.html': {
    headline: "You Were Not Made for Sadness",
    title: "You Were Not Made for Sadness — George | Jojjy",
    desc: "Paul commanded joy from a Roman dungeon because Christian joy is anchored in a Person, not circumstances. A thoughtful meditation on joy amidst real grief.",
    topic: "Suffering & Joy",
    date: "2025-05-11",
    displayDate: "May 11, 2025",
    image: "images/happiness.jpg",
    words: 1043,
    readTime: 5
  },
  'article-waiting-is-not-wasting.html': {
    headline: "Waiting Is Not Wasting",
    title: "Waiting Is Not Wasting — George | Jojjy",
    desc: "From Abraham to David, God used prolonged waiting seasons to forge character. Discover why waiting is never wasted time when God is the one doing the work.",
    topic: "Suffering & Joy",
    date: "2025-05-04",
    displayDate: "May 4, 2025",
    image: "images/prayer.jpg",
    words: 289,
    readTime: 1
  },
  'article-what-poverty-taught-me-about-riches.html': {
    headline: "What Poverty Taught Me About Riches",
    title: "What Poverty Taught Me About Riches — George | Jojjy",
    desc: "Experiencing material scarcity strips away illusions of security and reveals true wealth. Read an honest reflection on contentment, simplicity, and grace.",
    topic: "Discipleship",
    date: "2025-04-27",
    displayDate: "April 27, 2025",
    image: "images/3.jpg",
    words: 391,
    readTime: 2
  },
  'article-whatever-you-do-as-unto-the-lord.html': {
    headline: "Whatever You Do, As Unto the Lord",
    title: "Whatever You Do, As Unto the Lord — George | Jojjy",
    desc: "Colossians 3:23 transforms mundane routines, emails, and dishes into sacred worship. Discover how working as unto the Lord redeems ordinary daily labor.",
    topic: "Work & Vocation",
    date: "2025-04-20",
    displayDate: "April 20, 2025",
    image: "images/1.jpg",
    words: 324,
    readTime: 2
  },
  'article-why-friendship-feels-so-rare.html': {
    headline: "Why Friendship Feels So Rare",
    title: "Why Friendship Feels So Rare — George | Jojjy",
    desc: "We live in the most digitally connected yet loneliest generation in history. An honest essay exploring why deep biblical fellowship requires intentionality.",
    topic: "Discipleship",
    date: "2025-04-13",
    displayDate: "April 13, 2025",
    image: "images/marriage.jpg",
    words: 1168,
    readTime: 6
  },
  'article-work-existed-before-sin.html': {
    headline: "Work Existed Before Sin",
    title: "Work Existed Before Sin — George | Jojjy",
    desc: "Work was instituted in the Garden of Eden before the Fall, not as a curse. Rediscover God's original design for meaningful daily labor, vocation, and rest.",
    topic: "Work & Vocation",
    date: "2025-04-06",
    displayDate: "April 6, 2025",
    image: "images/2.jpg",
    words: 950,
    readTime: 5
  },
  'article-you-are-not-your-job-title.html': {
    headline: "You Are Not Your Job Title",
    title: "You Are Not Your Job Title — George | Jojjy",
    desc: "When career titles collapse, what remains of your worth? A quiet meditation on untangling professional identity from who you truly are in the eyes of God.",
    topic: "Work & Vocation",
    date: "2025-03-30",
    displayDate: "March 30, 2025",
    image: "images/business.jpg",
    words: 301,
    readTime: 2
  }
};

const rootPages = {
  'index.html': {
    title: "Jojjy — Short Christian Essays on Faith, Life & Work by George",
    desc: "Jojjy is a personal publication by George featuring short, honest Christian essays on life, faith, work, relationships, and ordinary experience.",
    path: "",
    priority: "1.0",
    changefreq: "daily"
  },
  'articles.html': {
    title: "Articles — Jojjy",
    desc: "Browse 18 contemplative Christian essays by George exploring work, Scripture, quiet holiness, discipleship, and suffering on Jojjy.",
    path: "articles.html",
    priority: "0.9",
    changefreq: "daily"
  },
  'about.html': {
    title: "About George — Writer & Creator of Jojjy",
    desc: "Meet George, writer and creator of Jojjy, sharing short, honest Christian reflections on faith, work, and following Jesus through the beautiful ordinary.",
    path: "about.html",
    priority: "0.7",
    changefreq: "monthly"
  }
};

console.log(`Applying SEO suite with canonical domain: ${domain}`);

// Helper to inject/replace head tags cleanly
function updateHead(html, options) {
  const { title, desc, canonicalUrl, ogType, ogImage, jsonLd, extraMeta } = options;

  // 1. Replace Title
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);

  // 2. Remove any previously injected meta tags, empty comment blocks, and JSON-LD
  html = html.replace(/\s*<meta\s+name=["']description["'][\s\S]*?>/gi, '');
  html = html.replace(/\s*<meta\s+name=["']author["'][\s\S]*?>/gi, '');
  html = html.replace(/\s*<link\s+rel=["']canonical["'][\s\S]*?>/gi, '');
  html = html.replace(/\s*<meta\s+property=["']og:[\s\S]*?>/gi, '');
  html = html.replace(/\s*<meta\s+property=["']article:[\s\S]*?>/gi, '');
  html = html.replace(/\s*<meta\s+name=["']twitter:[\s\S]*?>/gi, '');
  html = html.replace(/\s*<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/gi, '');

  // Clean empty meta comment artifacts
  html = html.replace(/<!--\s*Open Graph \/ Facebook\s*-->\s*/gi, '');
  html = html.replace(/<!--\s*Twitter Card\s*-->\s*/gi, '');
  html = html.replace(/<!--\s*Structured Data \(JSON-LD\)\s*-->\s*/gi, '');

  // 3. Build Standardized Clean Metadata Block
  let metaBlock = `
    <meta name="description" content="${desc}" />
    <meta name="author" content="${authorName}" />
    <link rel="canonical" href="${canonicalUrl}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${ogType || 'website'}" />
    <meta property="og:site_name" content="${siteName}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:alt" content="${title}" />
    <meta property="og:locale" content="en_US" />`;

  if (extraMeta) {
    metaBlock += extraMeta;
  }

  metaBlock += `

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
        "inLanguage": "en-US",
        "creator": {
          "@type": "Person",
          "@id": `${domain}/#author`
        },
        "publisher": {
          "@type": "Organization",
          "@id": `${domain}/#publication`,
          "name": siteName,
          "url": `${domain}/`,
          "logo": {
            "@type": "ImageObject",
            "url": `${domain}/images/logo.png`
          }
        }
      },
      {
        "@type": "Person",
        "@id": `${domain}/#author`,
        "name": authorName,
        "url": authorUrl,
        "image": `${domain}/images/Me.png`,
        "jobTitle": "Writer & Creator of Jojjy",
        "description": "Pastor turned writer sharing short, honest Christian reflections on ordinary faith, work, and following Jesus in the everyday.",
        "sameAs": [
          authorUrl
        ]
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

  // Ensure image alt & dimensions on brand logo & avatar
  indexHtml = indexHtml.replace(/alt="George\s*—\s*Christian Essays Publication"/g, 'alt="Jojjy — Christian Essays by George"');
  indexHtml = indexHtml.replace(/alt="George"/g, 'alt="Jojjy — Christian Essays by George"');
  indexHtml = indexHtml.replace(/aria-label="George home"/g, 'aria-label="Jojjy home"');
  indexHtml = indexHtml.replace(/aria-label="George homepage"/g, 'aria-label="Jojjy home"');

  fs.writeFileSync('index.html', indexHtml, 'utf8');
  console.log('Updated index.html');
}

// articles.html
{
  let articlesHtml = fs.readFileSync('articles.html', 'utf8');
  const pageMeta = rootPages['articles.html'];
  const canonicalUrl = `${domain}/articles.html`;

  // ItemList of all 18 articles for collection page schema
  const articleListElements = Object.keys(articlesMetadata).map((file, idx) => {
    const meta = articlesMetadata[file];
    return {
      "@type": "ListItem",
      "position": idx + 1,
      "url": `${domain}/articles/${file}`,
      "name": meta.headline
    };
  });

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
      "name": siteName,
      "url": `${domain}/`
    },
    "author": {
      "@type": "Person",
      "@id": `${domain}/#author`,
      "name": authorName,
      "url": authorUrl
    },
    "publisher": {
      "@type": "Organization",
      "@id": `${domain}/#publication`,
      "name": siteName,
      "url": `${domain}/`,
      "logo": {
        "@type": "ImageObject",
        "url": `${domain}/images/logo.png`
      }
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
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": articleListElements.length,
      "itemListElement": articleListElements
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

  articlesHtml = articlesHtml.replace(/alt="George\s*—\s*Christian Essays Publication"/g, 'alt="Jojjy — Christian Essays by George"');
  articlesHtml = articlesHtml.replace(/aria-label="George homepage"/g, 'aria-label="Jojjy home"');
  articlesHtml = articlesHtml.replace(/aria-label="George home"/g, 'aria-label="Jojjy home"');

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
    "@type": "ProfilePage",
    "@id": `${domain}/about.html#profile`,
    "url": canonicalUrl,
    "name": pageMeta.title,
    "description": pageMeta.desc,
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${domain}/#website`,
      "name": siteName,
      "url": `${domain}/`
    },
    "mainEntity": {
      "@type": "Person",
      "@id": `${domain}/#author`,
      "name": authorName,
      "url": canonicalUrl,
      "image": `${domain}/images/Me.png`,
      "jobTitle": "Writer & Creator of Jojjy",
      "description": "Pastor turned writer sharing short, honest reflections on ordinary Christian faith, Scripture, and grace on Jojjy.",
      "worksFor": {
        "@type": "Organization",
        "@id": `${domain}/#publication`,
        "name": siteName,
        "url": `${domain}/`
      },
      "sameAs": [
        canonicalUrl
      ]
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

  aboutHtml = aboutHtml.replace(/alt="George\s*—\s*Christian Essays Publication"/g, 'alt="Jojjy — Christian Essays by George"');
  aboutHtml = aboutHtml.replace(/aria-label="George home"/g, 'aria-label="Jojjy home"');
  aboutHtml = aboutHtml.replace(/aria-label="George homepage"/g, 'aria-label="Jojjy home"');

  fs.writeFileSync('about.html', aboutHtml, 'utf8');
  console.log('Updated about.html');
}

// -------------------------------------------------------------
// 2. Process All 18 Article Pages in articles/
// -------------------------------------------------------------
const articlesDir = 'articles';
const articleFiles = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));

articleFiles.forEach(file => {
  const filePath = path.join(articlesDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  const meta = articlesMetadata[file] || {
    headline: file.replace(/^article-|\.html$/g, '').replace(/-/g, ' '),
    title: `${file.replace(/^article-|\.html$/g, '').replace(/-/g, ' ')} — George | Jojjy`,
    desc: "Short, honest Christian reflections on faith, work, and following Jesus in ordinary life.",
    topic: "Faith",
    date: "2025-08-01",
    displayDate: "August 1, 2025",
    image: "images/hero-countryside.png",
    words: 500,
    readTime: 3
  };

  const canonicalUrl = `${domain}/articles/${file}`;
  const ogImageUrl = `${domain}/${meta.image}`;

  const extraMeta = `
    <meta property="article:author" content="${authorUrl}" />
    <meta property="article:published_time" content="${meta.date}T08:00:00+00:00" />
    <meta property="article:modified_time" content="${meta.date}T08:00:00+00:00" />
    <meta property="article:section" content="${meta.topic}" />`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#article`,
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${domain}/#website`,
      "name": siteName,
      "url": `${domain}/`
    },
    "headline": meta.headline,
    "description": meta.desc,
    "url": canonicalUrl,
    "mainEntityOfPage": canonicalUrl,
    "datePublished": `${meta.date}T08:00:00+00:00`,
    "dateModified": `${meta.date}T08:00:00+00:00`,
    "author": {
      "@type": "Person",
      "@id": `${domain}/#author`,
      "name": authorName,
      "url": authorUrl
    },
    "publisher": {
      "@type": "Organization",
      "@id": `${domain}/#publication`,
      "name": siteName,
      "url": `${domain}/`,
      "logo": {
        "@type": "ImageObject",
        "url": `${domain}/images/logo.png`
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
          "name": meta.headline,
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
    jsonLd,
    extraMeta
  });

  // Fix brand logo alt and dimensions in articles
  html = html.replace(/alt="George\s*—\s*Christian Essays Publication"/g, 'alt="Jojjy — Christian Essays by George"');
  html = html.replace(/aria-label="George home"/g, 'aria-label="Jojjy home"');
  html = html.replace(/aria-label="George homepage"/g, 'aria-label="Jojjy home"');

  // Semantic HTML in byline: Convert unsemantic date span into <time datetime="..."> or update existing
  html = html.replace(/<time\s+datetime="[^"]*">[\s\S]*?<\/time>/g, `<time datetime="${meta.date}">${meta.displayDate}</time>`);
  const dateSpanRegex = new RegExp(`<span>\\s*${meta.displayDate}\\s*<\\/span>`, 'g');
  html = html.replace(dateSpanRegex, `<time datetime="${meta.date}">${meta.displayDate}</time>`);
  html = html.replace(/<span>\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s*\d{4}\s*<\/span>/g, `<time datetime="${meta.date}">${meta.displayDate}</time>`);

  // Semantic HTML in byline: Link George to About page with rel="author"
  html = html.replace(/<p class="font-semibold text-\[#111827\]">George<\/p>/g,
    '<p class="font-semibold text-[#111827]"><a href="../about.html" rel="author" class="hover:underline text-inherit">George</a></p>');

  // Footer copyright line:
  html = html.replace(/© 2025 George\. Written slowly in the countryside\./g,
    '© 2026 Jojjy. Essays by George, written slowly in the countryside.');

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
  templateHtml = templateHtml.replace(/href="#newsletter"/g, 'href="index.html#newsletter"');
  templateHtml = templateHtml.replace(/<title>[\s\S]*?<\/title>/i,
    '<title>ARTICLE_TITLE — George | Jojjy</title>');
  templateHtml = templateHtml.replace(/alt="George\s*—\s*Christian Essays Publication"/g, 'alt="Jojjy — Christian Essays by George"');
  templateHtml = templateHtml.replace(/aria-label="George home"/g, 'aria-label="Jojjy home"');

  fs.writeFileSync('article.html', templateHtml, 'utf8');
  console.log('Updated article.html template');
}

// -------------------------------------------------------------
// 4. Generate sitemap.xml
// -------------------------------------------------------------
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

  <!-- Published Essays by George -->
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
# ROBOTS.TXT FOR HTTPS://JOJJY.ORG
# ==============================================================================

User-agent: *
Allow: /
Allow: /articles/
Allow: /images/
Allow: /styles.css
Allow: /main.js

# Disallow Unpopulated Template, Internal Utilities, Source Drafts & Config Files
Disallow: /article.html
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

console.log('SEO pass completed successfully across all pages with Jojjy identity!');
