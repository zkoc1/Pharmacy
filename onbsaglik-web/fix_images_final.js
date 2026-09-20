const fs = require('fs');
const files = [
  'src/app/sepet/page.tsx',
  'src/app/odeme/page.tsx',
  'src/components/ui/CartDrawer.tsx',
  'src/components/layout/Header.tsx',
  'src/components/product/ProductCard.tsx',
  'src/components/checkout/OrderSummary.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace .images?.[0] with a robust inline parser
    content = content.replace(/([a-zA-Z0-9_\.]+)\.images\?\.\[0\]/g, "(typeof .images === 'string' ? (.images as string).split(',')[0].replace(/[\\[\\]\"]/g, '') : .images?.[0])");
    
    fs.writeFileSync(file, content, 'utf8');
  }
});
