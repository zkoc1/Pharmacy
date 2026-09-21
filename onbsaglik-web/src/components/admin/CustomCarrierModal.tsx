"use client";
import React, { useState } from "react";
import type { OrderRecord } from "@/stores/orderStore";
import { X, Truck } from "lucide-react";

interface Props {
  order: OrderRecord;
  onClose: () => void;
  onSubmit: (carrier: string, trackingNumber: string) => Promise<void>;
}

export default function CustomCarrierModal({ order, onClose, onSubmit }: Props) {
  const [carrier, setCarrier] = useState("HepsiJet");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(carrier, trackingNumber);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2"><Truck size={18} className="text-emerald-600"/> Kargo Bilgisi ve Takip No</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"><X size={18} className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm text-gray-700">
          <div>
            <label className="block font-bold mb-1.5 text-xs">Kargo Firması</label>
            <select value={carrier} onChange={e => setCarrier(e.target.value)} className="w-full border p-2.5 rounded-lg bg-gray-50 outline-none focus:ring-1 focus:ring-emerald-500 text-xs">
              <option value="HepsiJet">HepsiJet</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1.5 text-xs">Takip Numarası</label>
            <input type="text" required value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="Örn: 1Z9999999999999999" className="w-full border p-2.5 rounded-lg bg-gray-50 outline-none focus:ring-1 focus:ring-emerald-500 text-xs" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition-colors mt-2 text-xs">
            {loading ? "Kaydediliyor..." : "Kaydet ve Kargoya Verildi İşaretle"}
          </button>
        </form>
      </div>
    </div>
  );
}
