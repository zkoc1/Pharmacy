const fs = require('fs');

let content = fs.readFileSync('src/app/odeme/page.tsx', 'utf8');

// replace the span block with flag
content = content.replace(/<span className="inline-flex items-center gap-1\.5 px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-xs font-bold text-gray-700">[\s\S]*?<\/span>/m, \<span className="inline-flex items-center gap-1.5 px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-xs font-bold text-gray-700">
  🇹🇷 +90
</span>\);

fs.writeFileSync('src/app/odeme/page.tsx', content, 'utf8');
