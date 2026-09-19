
const fs = require("fs");

function fixFile(path) {
  let content = fs.readFileSync(path, "utf8");
  
  // Create a map of mangled UTF-8 characters back to proper Turkish characters
  const replacements = {
    "Ãœ": "Ü",
    "Ã¼": "ü",
    "Ä°": "İ",
    "Ä±": "ı",
    "Ã–": "Ö",
    "Ã¶": "ö",
    "Ã‡": "Ç",
    "Ã§": "ç",
    "Åž": "Ş",
    "ÅŸ": "ş",
    "Äž": "Ğ",
    "ÄŸ": "ğ"
  };
  
  for (const [mangled, correct] of Object.entries(replacements)) {
    content = content.split(mangled).join(correct);
  }
  
  fs.writeFileSync(path, content, "utf8");
  console.log("Fixed " + path);
}

fixFile("src/app/odeme/page.tsx");
fixFile("src/components/product/ProductDetailClient.tsx");
fixFile("src/stores/accountExtrasStore.ts");

fixFile("src/app/admin/urunler/page.tsx");
