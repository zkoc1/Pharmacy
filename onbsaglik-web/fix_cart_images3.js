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
    
    // Hard revert the bad string
    const badStr1 = "item.(Array.isArray(product.images) ? product.images[0] : (typeof product.images === 'string' && product.images.startsWith('[') ? JSON.parse(product.images)[0] : (typeof product.images === 'string' ? product.images.split(',')[0] : '')))";
    content = content.replace(badStr1, "item.product.images?.[0]");
    
    const badStr2 = "i.(Array.isArray(product.images) ? product.images[0] : (typeof product.images === 'string' && product.images.startsWith('[') ? JSON.parse(product.images)[0] : (typeof product.images === 'string' ? product.images.split(',')[0] : '')))";
    content = content.replace(badStr2, "i.product.images?.[0]");

    const badStr3 = "(Array.isArray(product.images) ? product.images[0] : (typeof product.images === 'string' && product.images.startsWith('[') ? JSON.parse(product.images)[0] : (typeof product.images === 'string' ? product.images.split(',')[0] : '')))";
    // we have to be careful with badStr3 not replacing valid ones, but since we are reverting all:
    // Actually let's just do a blanket replace of the injected ugly block
    content = content.split("(Array.isArray(product.images) ? product.images[0] : (typeof product.images === 'string' && product.images.startsWith('[') ? JSON.parse(product.images)[0] : (typeof product.images === 'string' ? product.images.split(',')[0] : '')))").join("product.images?.[0]");
    
    fs.writeFileSync(file, content, 'utf8');
  }
});
