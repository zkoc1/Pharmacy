const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');
if (!content.includes('usePathname')) {
    content = content.replace(/import \{ useRouter \} from "next\/navigation";/, 'import { useRouter, usePathname } from "next/navigation";');
    content = content.replace(/const router = useRouter\(\);/, 'const router = useRouter();\n  const pathname = usePathname();\n\n  if (pathname?.startsWith("/admin")) return null;\n');
    fs.writeFileSync('src/components/layout/Header.tsx', content, 'utf8');
}

let footerContent = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');
if (!footerContent.includes('usePathname')) {
    // Footer is a Server Component, but we need headers() or something. 
    // Actually, we can make Footer use client or just leave it. 
    // But if we want it hidden, we should hide it.
    footerContent = '"use client";\n' + footerContent.replace(/import Link from "next\/link";/, 'import Link from "next/link";\nimport { usePathname } from "next/navigation";');
    footerContent = footerContent.replace(/export default function Footer\(\) \{/, 'export default function Footer() {\n  const pathname = usePathname();\n  if (pathname?.startsWith("/admin")) return null;\n');
    fs.writeFileSync('src/components/layout/Footer.tsx', footerContent, 'utf8');
}
