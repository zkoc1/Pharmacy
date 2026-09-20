const fs = require('fs');
let header = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

// Remove early returns
header = header.replace(/^[ \t]*if \(pathname\?\.startsWith\("\/admin"\)\) return null;\r?\n+/m, '');

// Insert just before the final 'return ('
header = header.replace(/^[ \t]*return \(\r?\n[ \t]*<>/m, '  if (pathname?.startsWith("/admin")) return null;\n\n  return (\n    <>');

fs.writeFileSync('src/components/layout/Header.tsx', header, 'utf8');

let footer = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');
footer = footer.replace(/^[ \t]*if \(pathname\?\.startsWith\("\/admin"\)\) return null;\r?\n+/m, '');
footer = footer.replace(/^[ \t]*return \(\r?\n[ \t]*<footer/m, '  if (pathname?.startsWith("/admin")) return null;\n\n  return (\n    <footer');
fs.writeFileSync('src/components/layout/Footer.tsx', footer, 'utf8');
