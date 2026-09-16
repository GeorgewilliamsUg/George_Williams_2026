const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'articles');
if (fs.existsSync(dir)) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

  files.forEach(f => {
    const p = path.join(dir, f);
    let html = fs.readFileSync(p, 'utf8');

    // Replace header author icon
    html = html.replace(
      /<div class="flex h-8 w-8 items-center justify-center rounded-full bg-\[#cef542\]\/25 text-\[#111827\] border border-\[#cef542\]\/40">\s*<iconify-icon icon="solar:user-linear" width="16" stroke-width="1.5"><\/iconify-icon>\s*<\/div>/g,
      '<div class="flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#cef542]"><img src="../images/Me.png" alt="George" class="h-full w-full object-cover object-top" /></div>'
    );

    // Replace bottom author card icon
    html = html.replace(
      /<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white border border-\[#cef542\] text-\[#111827\] ring-2 ring-\[#cef542\]\/40">\s*<iconify-icon icon="solar:user-speak-linear" width="22" stroke-width="1.5"><\/iconify-icon>\s*<\/div>/g,
      '<div class="flex h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#cef542] ring-2 ring-[#cef542]/40 bg-white"><img src="../images/Me.png" alt="George" class="h-full w-full object-cover object-top" /></div>'
    );

    fs.writeFileSync(p, html, 'utf8');
  });

  console.log(`Successfully updated ${files.length} article pages with real portraits!`);
}
