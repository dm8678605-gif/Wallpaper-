"use client";

import { useState, useEffect } from "react";
import { X, Package, CheckCircle } from "lucide-react";
import type { Product } from "@/lib/data/types";

interface SampleOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  productIds?: string[];
}

export function SampleOrderModal({ isOpen, onClose, product, productIds }: SampleOrderModalProps) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({ name: "", email: "", phone: "", address: "" });
      setState("idle");
      setMsg("");
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const ids = product ? [product.id] : productIds || [];
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sample", ...form, productIds: ids }),
      });
      if (res.ok) {
        setState("done");
        setMsg("Sample request received! We'll contact you shortly.");
      } else {
        const data = await res.json().catch(() => ({}));
        setState("error");
        setMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMsg("Network error. Please check your connection and try again.");
    }
  }

  const handleSubmit = () => {
    if (state === "done") {
      onClose();
    }
  };

  if (!isOpen) return null;

  const displayProduct = product;
  const samplePrice = displayProduct?.samplePrice || 199;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
        style={{ animation: "fadeIn 0.3s ease-out" }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-[var(--color-surface)] w-full max-w-md max-h-[90vh] overflow-hidden rounded-lg shadow-2xl transform transition-all duration-300 ease-out"
          style={{ animation: "slideUp 0.3s ease-out" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b hairline">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-[var(--color-primary)]" />
              <span className="font-display text-lg">Order Sample</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-bg)] rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-4">
            {state === "done" ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="text-[var(--color-secondary)] mx-auto mb-4" />
                <h3 className="font-display text-xl mb-2">Request Submitted</h3>
                <p className="text-[var(--color-muted)] text-sm mb-6">{msg}</p>
                <button onClick={handleSubmit} className="btn-lux w-full justify-center">
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Product Info */}
                {displayProduct && (
                  <div className="flex gap-4 mb-6 p-3 bg-[var(--color-bg)] rounded">
                    <img
                      src={displayProduct.images.find((i) => i.primary)?.url || displayProduct.images[0]?.url}
                      alt={displayProduct.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{displayProduct.name}</p>
                      <p className="text-[var(--color-muted)] text-xs mt-1">{displayProduct.shortDescription}</p>
                      <p className="text-[var(--color-primary)] font-semibold mt-2">₹{samplePrice}</p>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="label-lux">Full name *</label>
                    <input
                      required
                      type="text"
                      className="input-lux"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="label-lux">Email *</label>
                    <input
                      required
                      type="email"
                      className="input-lux"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="label-lux">Phone</label>
                    <input
                      type="tel"
                      className="input-lux"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 00000 00000"
                    />
                  </div>
                  <div>
                    <label className="label-lux">Delivery address *</label>
                    <textarea
                      required
                      rows={3}
                      className="input-lux resize-none"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Your complete delivery address"
                    />
                  </div>

                  {state === "error" && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                      {msg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className="btn-lux w-full justify-center"
                  >
                    {state === "loading" ? "Submitting…" : "Request Sample"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
