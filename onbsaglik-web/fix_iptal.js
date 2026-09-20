const fs = require('fs');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/"İptal Edildi"/g, '"İptal / İade"');
  content = content.replace(/'İptal Edildi'/g, "'İptal / İade'");
  fs.writeFileSync(filePath, content, 'utf8');
}

replaceInFile('src/stores/orderStore.ts');
replaceInFile('src/app/hesabim/siparislerim/page.tsx');
