const fs = require('fs');
let content = fs.readFileSync('src/app/api/admin/products/[id]/route.ts', 'utf8');
content = content.replace('select("name, price, slug")', 'select("name, price, slug, stock")');
fs.writeFileSync('src/app/api/admin/products/[id]/route.ts', content, 'utf8');
