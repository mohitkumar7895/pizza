"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, MapPin, Phone, User } from "lucide-react";

type Props = {
  open: boolean;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  onClose?: () => void;
};

export function OrderConfirmationModal({
  open,
  orderNumber,
  customerName,
  customerPhone,
  customerAddress,
  onClose,
}: Props) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowContent(false);
      return;
    }
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-0">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header Background */}
        <div className="relative bg-linear-to-br from-[#e60000] to-[#b91c1c] px-6 pt-8 pb-16">
          {/* Checkmark Animation */}
          <div
            className={`flex justify-center transition-all duration-700 ${
              showContent ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          >
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-white/20"></div>
              <CheckCircle2 className="relative h-20 w-20 text-white drop-shadow-lg" />
            </div>
          </div>

          {/* Wave Decoration */}
          <div className="absolute -bottom-1 left-0 right-0 h-8 bg-white" style={{
            clipPath: "polygon(0 50%, 0 100%, 100% 100%, 100% 50%, 95% 45%, 90% 50%, 85% 45%, 80% 50%, 75% 45%, 70% 50%, 65% 45%, 60% 50%, 55% 45%, 50% 50%, 45% 45%, 40% 50%, 35% 45%, 30% 50%, 25% 45%, 20% 50%, 15% 45%, 10% 50%, 5% 45%, 0 50%)"
          }}></div>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 py-8">
          {/* Main Message */}
          <div
            className={`space-y-2 text-center transition-all duration-700 delay-200 ${
              showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <h2 className="font-body text-2xl font-extrabold text-neutral-900">
              Order Confirmed!
            </h2>
            <p className="font-body text-sm text-neutral-600">
              Order #{orderNumber}
            </p>
          </div>

          {/* Delivery Details */}
          <div
            className={`space-y-3 rounded-2xl bg-[#faf8f5] p-4 transition-all duration-700 delay-300 ${
              showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {/* Name */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#e60000]/10 p-2.5">
                <User className="h-4 w-4 text-[#e60000]" />
              </div>
              <div className="flex-1">
                <p className="font-body text-xs font-semibold uppercase text-neutral-500">
                  Recipient Name
                </p>
                <p className="font-body mt-1 text-sm font-semibold text-neutral-900">
                  {customerName}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#e60000]/10 p-2.5">
                <Phone className="h-4 w-4 text-[#e60000]" />
              </div>
              <div className="flex-1">
                <p className="font-body text-xs font-semibold uppercase text-neutral-500">
                  Contact Number
                </p>
                <p className="font-body mt-1 text-sm font-semibold text-neutral-900">
                  {customerPhone}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#e60000]/10 p-2.5">
                <MapPin className="h-4 w-4 text-[#e60000]" />
              </div>
              <div className="flex-1">
                <p className="font-body text-xs font-semibold uppercase text-neutral-500">
                  Delivery Address
                </p>
                <p className="font-body mt-1 text-sm font-semibold text-neutral-900 line-clamp-2">
                  {customerAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Wait Message */}
          <div
            className={`space-y-2 rounded-2xl bg-linear-to-br from-[#fef3f2] to-[#fdf7f1] p-4 transition-all duration-700 delay-400 ${
              showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#e60000]"></div>
              <p className="font-body text-sm font-extrabold text-[#e60000]">
                🕐 Estimated Time
              </p>
            </div>
            <p className="font-body text-sm leading-relaxed text-neutral-700">
              Your order will be ready in <span className="font-extrabold text-neutral-900">10 to 20 minutes</span>. Our team is preparing your delicious meal with care!
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className={`w-full rounded-xl bg-linear-to-r from-[#e60000] to-[#b91c1c] px-4 py-3 font-body font-semibold text-white shadow-lg transition-all duration-700 delay-500 hover:shadow-xl active:scale-95 ${
              showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            Track Your Order
          </button>
        </div>
      </div>
    </div>
  );
}
