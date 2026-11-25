"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { SampleOrderModal } from "./SampleOrderModal";
import type { Product } from "@/lib/data/types";

export function SampleOrderButton({ product, productIds, productName }: { product?: Product; productIds?: string[]; productName?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-lux btn-lux--outline w-full justify-center mt-3">
        <Package size={15} /> Order {productName ? "Sample" : "Samples"}
      </button>
      <SampleOrderModal
        isOpen={open}
        onClose={() => setOpen(false)}
        product={product}
        productIds={productIds}
      />
    </>
  );
}
