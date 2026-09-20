const fs = require('fs');
let content = fs.readFileSync('src/app/admin/urunler/page.tsx', 'utf8');

content = content.replace(/className="fixed inset-0 bg-black\/50 z-50/g, 'className="fixed inset-0 bg-black/60 z-[999]');
content = content.replace(/className="fixed inset-0 bg-black\/60 z-50/g, 'className="fixed inset-0 bg-black/60 z-[999]');

fs.writeFileSync('src/app/admin/urunler/page.tsx', content, 'utf8');
