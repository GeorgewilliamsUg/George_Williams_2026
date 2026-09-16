const fs = require('fs');
const path = require('path');

const articlesDir = 'd:/Dev2026/George-2/articles';
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));

const data = files.map(file => {
  const fullPath = path.join(articlesDir, file);
  const html = fs.readFileSync(fullPath, 'utf8');

  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const topicMatch = html.match(/<span class="[^"]*topic-tag[^"]*">(.*?)<\/span>/i) || html.match(/topic-tag.*?>(.*?)</i);
  const timeMatch = html.match(/<time[^>]*>(.*?)<\/time>/i);
  const wordCountMatch = html.match(/(\d+)\s+words/i);
  const readTimeMatch = html.match(/(\d+)\s+min read/i);

  // Find featured image if any
  let img = 'images/hero-countryside.png';
  const imgMatches = [...html.matchAll(/src=["'](?:\.\.\/)?(images\/[^"']+)["']/g)];
  for (const m of imgMatches) {
    if (!m[1].includes('logo') && !m[1].includes('favicon') && !m[1].includes('Me.png')) {
      img = m[1];
      break;
    }
  }

  return {
    file,
    title: titleMatch ? titleMatch[1].trim() : '',
    h1: h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '',
    desc: descMatch ? descMatch[1].trim() : '',
    topic: topicMatch ? topicMatch[1].trim() : 'Faith',
    date: timeMatch ? timeMatch[1].trim() : '2025-08-01',
    image: img,
    words: wordCountMatch ? parseInt(wordCountMatch[1], 10) : 600,
    readTime: readTimeMatch ? parseInt(readTimeMatch[1], 10) : 2
  };
});

fs.writeFileSync('C:/Users/George/.gemini/antigravity-ide/brain/23ba8f82-c36b-4dcf-bbfc-dc7ca12dbb3f/scratch/articles_data.json', JSON.stringify(data, null, 2));
console.log(`Extracted metadata for ${data.length} articles.`);
