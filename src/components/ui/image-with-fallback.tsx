"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { Image as ImageIcon } from "lucide-react";

interface ImageWithFallbackProps extends ImageProps {
  fallback?: React.ReactNode;
}

export function ImageWithFallback({
  fallback,
  src,
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (error || !src) {
    return (
      fallback || (
        <div className="flex items-center justify-center h-full w-full text-muted-foreground bg-black/5">
          <ImageIcon className="h-10 w-10 opacity-20" />
        </div>
      )
    );
  }

  return (
    <Image src={src} alt={alt} onError={() => setError(true)} {...props} />
  );
}
