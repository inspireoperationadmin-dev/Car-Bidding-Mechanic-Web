import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ImageOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Dialog, DialogContent } from "../ui/dialog";

interface ImageGalleryProps {
  images: string[];
  title?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title = "Vehicle Photos" }) => {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleOpen = (index: number) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % images.length);
    },
    [images]
  );

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [images]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleNext, handlePrev]);

  // Empty state
  if (!images || images.length === 0) {
    return (
      <Card className="border-border/80 shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
        <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/20">
          <CardTitle className="text-base font-bold text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <ImageOff className="w-10 h-10 mb-2 opacity-40" />
          <p className="text-sm italic">No photos provided.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
      <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/20">
        <CardTitle className="text-base font-bold text-foreground">{title}</CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {/* Thumbnails Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="group relative aspect-video rounded-xl overflow-hidden border border-border/60 bg-muted/30 cursor-pointer shadow-sm hover:shadow-md transition-all"
              onClick={() => handleOpen(index)}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Vehicle+Photo";
                }}
              />
              {/* Zoom Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                <ZoomIn className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Lightbox Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl p-2 bg-black/95 border-black text-white">
          <div className="relative flex flex-col items-center justify-center p-2 min-h-[50vh]">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-20 transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-20 transition-colors"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-20 transition-colors"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={images[currentIndex]}
              alt={`Photo ${currentIndex + 1}`}
              className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl transition-all"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/800x600?text=Vehicle+Photo";
              }}
            />

            {/* Counter */}
            <div className="mt-3 text-xs text-white/70 font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
