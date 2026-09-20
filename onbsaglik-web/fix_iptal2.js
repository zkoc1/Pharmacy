const fs = require('fs');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/"İptal Edildi"/g, '"İptal / İade"');
  content = content.replace(/'İptal Edildi'/g, "'İptal / İade'");
  fs.writeFileSync(filePath, content, 'utf8');
}

replaceInFile('src/app/api/checkout/callback/route.ts');
replaceInFile('src/app/hesabim/page.tsx');
