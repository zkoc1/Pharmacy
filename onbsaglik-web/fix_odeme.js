const fs = require('fs');

let content = fs.readFileSync('src/app/odeme/page.tsx', 'utf8');

// 1. Fix Phone Flag
content = content.replace("ğŸ‡’ğŸ‡· +90", "🇹🇷 +90");
content = content.replace("YY +90", "🇹🇷 +90");

// 2. Fix Shipping calculation
const oldCarriers = \  const carriers = [
    { name: "Kolay Gelsin", price: 0, label: "BEDAVA" },
    { name: "HepsiJet", price: 0, label: "BEDAVA" },
    { name: "PTT Kargo", price: 0, label: "BEDAVA" },
    { name: "DHL Kargo", price: 149.9, label: "149,90 TL" },
    { name: "Srat Kargo", price: 129.9, label: "129,90 TL" },
    { name: "Sürat Kargo", price: 129.9, label: "129,90 TL" },
    { name: "Aras Kargo", price: 149.9, label: "149,90 TL" },
    { name: "Yurtii Kargo", price: 149.9, label: "149,90 TL" },
    { name: "Yurtiçi Kargo", price: 149.9, label: "149,90 TL" },
  ];\;

// We just do regex for carriers
content = content.replace(/const carriers = \[\s*\{ name: "Kolay Gelsin"[\s\S]*?\];/m, 
\  const subTotalForFreeShipping = getTotalPrice() - calculateMultiBuyDiscount(items, getTotalPrice()) - discount;
  const isFree = subTotalForFreeShipping >= checkoutSettings.freeShippingThreshold;
  
  const carriers = [
    { name: "Kolay Gelsin", base: checkoutSettings.shippingCost },
    { name: "HepsiJet", base: checkoutSettings.shippingCost },
    { name: "PTT Kargo", base: checkoutSettings.shippingCost },
    { name: "Sürat Kargo", base: checkoutSettings.shippingCost },
    { name: "Aras Kargo", base: checkoutSettings.shippingCost },
    { name: "Yurtiçi Kargo", base: checkoutSettings.shippingCost },
  ].map(c => {
    const p = isFree ? 0 : c.base;
    return { name: c.name, price: p, label: p === 0 ? "BEDAVA" : formatPrice(p) };
  });\);

// 3. Fix shippingCost logic
const oldShippingLogic = \  const carrierObj = carriers.find((c) => c.name === selectedCarrier);
  const defaultShippingCost = carrierObj ? carrierObj.price : 0;
  
  // Dinamik kargo hesaplama
  const subTotalForShipping = total - multiBuyDiscount - discount;
  const calculatedShippingCost = subTotalForShipping > checkoutSettings.freeShippingThreshold ? 0 : checkoutSettings.shippingCost;
  const shippingCost = defaultShippingCost > 0 ? calculatedShippingCost : 0;\;

const newShippingLogic = \  const carrierObj = carriers.find((c) => c.name === selectedCarrier);
  const shippingCost = carrierObj ? carrierObj.price : 0;
  const subTotalForShipping = total - multiBuyDiscount - discount;\;

// we might need regex for the logic block because of weird characters
content = content.replace(/const carrierObj = carriers\.find\(\(c\) => c\.name === selectedCarrier\);[\s\S]*?const shippingCost = defaultShippingCost > 0 \? calculatedShippingCost : 0;/m, newShippingLogic);


fs.writeFileSync('src/app/odeme/page.tsx', content, 'utf8');
