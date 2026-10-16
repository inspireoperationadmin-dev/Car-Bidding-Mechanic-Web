import React, { useState } from "react";
import { Skeleton } from "../ui/skeleton";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: number | string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = "100%",
  height = "100%",
  borderRadius = 0,
  style,
  className,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fallbackImage = "https://placehold.co/600x400?text=No+Image";

  return (
    <div
      style={{ width, height, borderRadius }}
      className={`relative overflow-hidden ${className || ""}`}
    >
      {!isLoaded && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-inherit" />
      )}

      <img
        src={hasError ? fallbackImage : src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
          ...style,
        }}
        {...props}
      />
    </div>
  );
};
