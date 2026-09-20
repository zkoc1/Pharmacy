const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');

if (!content.includes('import { usePathname }')) {
  content = content.replace(/import Link from 'next\/link';/, "import Link from 'next/link';\nimport { usePathname } from 'next/navigation';");
  fs.writeFileSync('src/components/layout/Footer.tsx', content, 'utf8');
}
