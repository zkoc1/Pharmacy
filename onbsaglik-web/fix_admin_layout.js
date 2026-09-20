const fs = require('fs');
let content = fs.readFileSync('src/app/admin/layout.tsx', 'utf8');
content = content.replace(/sticky top-0 z-\[9999\]/g, 'z-50');
fs.writeFileSync('src/app/admin/layout.tsx', content, 'utf8');
