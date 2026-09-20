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
    
    // Safely parse images if they accidentally got stuck as a string in localStorage
    content = content.replace(/product\.images\?\.\[0\]/g, "(Array.isArray(product.images) ? product.images[0] : (typeof product.images === 'string' && product.images.startsWith('[') ? JSON.parse(product.images)[0] : (typeof product.images === 'string' ? product.images.split(',')[0] : '')))");
    
    fs.writeFileSync(file, content, 'utf8');
  }
});
