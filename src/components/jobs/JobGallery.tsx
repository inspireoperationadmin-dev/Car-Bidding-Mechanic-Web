import { ImageOff, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface JobGalleryProps {
  images: string[];
}

export const JobGallery = ({ images }: JobGalleryProps) => {
  return (
    <Card className="border-border/80 shadow-sm overflow-hidden">
      <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/20">
        <CardTitle className="text-base font-bold text-foreground">Vehicle Photos</CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {images && images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div
                key={index}
                className="group relative aspect-video rounded-xl overflow-hidden border border-border/60 bg-muted/30 cursor-pointer shadow-sm hover:shadow-md transition-all"
                onClick={() => window.open(img, "_blank")}
              >
                <img
                  src={img}
                  alt={`Damage view ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Vehicle+Photo";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                  <ExternalLink className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <ImageOff className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm italic">No photos provided by the client.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
