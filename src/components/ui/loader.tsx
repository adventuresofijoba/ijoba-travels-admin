import { Loader2 } from "lucide-react";
import Image from "next/image";
import React from "react";

export function Loader({
  className,
  size = 24,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { size?: number }) {
  return (
    <div
      className={`flex items-center justify-center text-primary ${
        className || ""
      }`}
      {...props}
    >
      <Loader2 className="animate-spin" size={size} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#F5E8C7]/80 backdrop-blur-sm">
      <div className="relative w-40 h-10 animate-pulse">
        <Image
          src="/logo-black.webp"
          alt="Ijoba Admin Logo"
          fill
          className="object-contain"
          sizes="160px"
          priority
        />
      </div>
      <Loader size={32} className="text-[#2D2D2D]" />
    </div>
  );
}
