
const fs = require("fs");
let content = fs.readFileSync("src/app/api/admin/products/[id]/route.ts", "utf8");

content = content.replace("RN GNCELLEND", "ÜRÜN GÜNCELLENDİ");
content = content.replace("rn #", "Ürün #");
content = content.replace("gncellendi.", "güncellendi.");
content = content.replace("return NextResponse.json({ success: true, product: data }););", "return NextResponse.json({ success: true, product: data });\n}");

fs.writeFileSync("src/app/api/admin/products/[id]/route.ts", content, "utf8");

