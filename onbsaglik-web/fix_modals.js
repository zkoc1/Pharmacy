const fs = require('fs');

let content = fs.readFileSync('src/app/admin/siparisler/page.tsx', 'utf8');

const modalsToAdd = \
      {customCarrierOrder && (
        <CustomCarrierModal
          order={customCarrierOrder}
          onClose={() => setCustomCarrierOrder(null)}
          onSubmit={async (carrier, trackingNumber) => {
            await updateCarrier(customCarrierOrder.id, carrier);
            await updateTrackingNumber(customCarrierOrder.id, trackingNumber);
            await updateOrderStatus(customCarrierOrder.id, "Kargoda", carrier + " ile kargoya verildi.");
            setCustomCarrierOrder(null);
          }}
        />
      )}
      {documentOrder && (
        <DocumentModal
          order={documentOrder.order}
          type={documentOrder.type}
          onClose={() => setDocumentOrder(null)}
        />
      )}
\;

if (!content.includes('<CustomCarrierModal')) {
  content = content.replace(
    '{billingInfoOrder && (\n        <BillingInfoModal order={billingInfoOrder} onClose={() => setBillingInfoOrder(null)} />\n      )}',
    '{billingInfoOrder && (\n        <BillingInfoModal order={billingInfoOrder} onClose={() => setBillingInfoOrder(null)} />\n      )}' + modalsToAdd
  );
}

fs.writeFileSync('src/app/admin/siparisler/page.tsx', content, 'utf8');
