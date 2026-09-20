const fs = require('fs');
let content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');
content = content.replace(/sticky top-0 z-50/g, ''); // Remove sticky top-0 z-50 from admin dashboard header
fs.writeFileSync('src/app/admin/page.tsx', content, 'utf8');
