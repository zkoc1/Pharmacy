const fs = require('fs');
const files = [
  'src/app/sepet/page.tsx',
  'src/app/odeme/page.tsx',
  'src/components/ui/CartDrawer.tsx',
  'src/components/layout/Header.tsx',
  'src/components/product/ProductCard.tsx',
  'src/components/checkout/OrderSummary.tsx'
];

const variants = [
  "item.product",
  "product",
  "i.product",
  "sp",
  "p",
  "" // For the broken .images
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // First, fix the broken ones:
    content = content.replace(/\(typeof \.images === 'string'.*?: \.images\?\.\[0\]\)/g, "product.images?.[0]");
    content = content.replace(/\(typeof item\.product\.images === 'string'.*?: item\.product\.images\?\.\[0\]\)/g, "item.product.images?.[0]");
    // Hard reset everything that looks like the inline parser back to original state if possible.
    // Actually, let's just do a blanket replacement of the broken parser string:
    content = content.split("(typeof .images === 'string' ? (.images as string).split(',')[0].replace(/[\\[\\]\"]/g, '') : .images?.[0])").join("item.product.images?.[0]"); // Defaulting to item.product isn't safe for all, but let's see where it broke.
    
    fs.writeFileSync(file, content, 'utf8');
  }
});
