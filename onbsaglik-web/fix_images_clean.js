const fs = require('fs');

function replaceImagesInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Helper definition to inject
  const helper = \
// Geriye dönük uyumluluk için güvenli görsel alıcı
const getImg = (imgs: any) => {
  if (Array.isArray(imgs)) return imgs[0] || '/placeholder.png';
  if (typeof imgs === 'string') {
    if (imgs.startsWith('[')) {
      try { return JSON.parse(imgs)[0] || '/placeholder.png'; } catch { return '/placeholder.png'; }
    }
    return imgs.split(',')[0] || '/placeholder.png';
  }
  return '/placeholder.png';
};
\;

  if (!content.includes('const getImg')) {
    // Inject helper after imports
    content = content.replace(/(import .*;\n)+/, "$&\n" + helper);
  }

  // Replace usage
  content = content.replace(/product\.images\?\.\[0\] \|\| ["']\/placeholder\.png["']/g, "getImg(product.images)");
  content = content.replace(/item\.product\.images\?\.\[0\] \|\| ["']\/placeholder\.png["']/g, "getImg(item.product.images)");
  content = content.replace(/i\.product\.images\?\.\[0\] \|\| ["']\/placeholder\.png["']/g, "getImg(i.product.images)");
  content = content.replace(/sp\.images\?\.\[0\] \|\| ["']\/placeholder\.png["']/g, "getImg(sp.images)");
  content = content.replace(/image: i\.product\.images\?\.\[0\],/g, "image: getImg(i.product.images),");

  fs.writeFileSync(filePath, content, 'utf8');
}

replaceImagesInFile('src/app/sepet/page.tsx');
replaceImagesInFile('src/app/odeme/page.tsx');
replaceImagesInFile('src/components/ui/CartDrawer.tsx');
