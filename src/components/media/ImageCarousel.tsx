import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { OptimizedImage } from "../common/OptimizedImage";

interface ImageCarouselProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
  onImageClick?: (index: number) => void;
}

export const ImageCarousel = ({
  images,
  autoPlay = true,
  interval = 3000,
  onImageClick,
}: ImageCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setInterval(handleNext, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, handleNext, images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 sm:h-60 bg-muted/40 rounded-xl flex items-center justify-center text-sm text-muted-foreground">
        No Images
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-black/5 group">
      <div
        className={`relative h-48 sm:h-60 w-full overflow-hidden ${
          onImageClick ? "cursor-pointer" : "cursor-default"
        }`}
        onClick={() => onImageClick?.(activeIndex)}
      >
        <OptimizedImage
          src={images[activeIndex]}
          alt={`Vehicle ${activeIndex + 1}`}
          width="100%"
          height="100%"
          style={{ objectFit: "cover" }}
        />

        {/* Overlay Controls */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="pointer-events-auto p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all shadow-md"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="pointer-events-auto p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all shadow-md"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Fullscreen icon indicator */}
        <div className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/50 text-white backdrop-blur-sm pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
          <Maximize2 className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Indicator dots */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-2 bg-background/80 backdrop-blur-sm border-t border-border/40">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === activeIndex
                  ? "w-5 bg-primary"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
