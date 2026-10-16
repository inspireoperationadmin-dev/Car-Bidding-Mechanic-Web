import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Car,
  MapPin,
  Clock,
  Euro,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { type Job } from "../../store/slices/jobsSlice";

interface JobCardGridProps {
  jobs: Job[];
  loading?: boolean;
  onView: (id: number) => void;
}

export const JobCardGrid: React.FC<JobCardGridProps> = ({ jobs, loading, onView }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-64 rounded-2xl bg-muted/40 animate-pulse border border-border/60"
          />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border/70 bg-card/40 flex flex-col items-center">
        <div className="w-28 h-28 mb-4 rounded-2xl overflow-hidden shadow-md border border-border/60">
          <img
            src="/images/empty_no_jobs.jpeg"
            alt="No jobs"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-base font-bold text-foreground">No vehicles found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
          Try expanding your search radius or clearing active price filters to see more requests.
        </p>
      </div>
    );
  }

  const sampleFallbacks = [
    "/images/sample_bumper_damage.jpeg",
    "/images/sample_wheel_rash.jpeg",
    "/images/sample_brake_service.jpeg",
  ];

  const formatDeadline = (deadlineStr: string) => {
    const end = new Date(deadlineStr).getTime();
    const now = Date.now();
    const diffMs = end - now;

    if (diffMs <= 0) return { text: "Bidding Closed", isUrgent: true, isExpired: true };

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours < 6) {
      return { text: `${diffHours}h ${diffMins}m left`, isUrgent: true, isExpired: false };
    }
    return { text: `${diffHours}h remaining`, isUrgent: false, isExpired: false };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {jobs.map((job) => {
        const deadline = formatDeadline(job.deadline);
        const hasPhoto = job.images && job.images.length > 0;
        const photoUrl = hasPhoto
          ? job.images[0]
          : sampleFallbacks[job.id % sampleFallbacks.length];

        return (
          <Card
            key={job.id}
            onClick={() => onView(job.id)}
            className="group overflow-hidden rounded-2xl border-border/80 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Card Photo Header */}
              <div className="relative h-44 w-full bg-muted overflow-hidden">
                <img
                  src={photoUrl}
                  alt={job.carModel}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badges Over Image */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="backdrop-blur-md bg-card/80 font-bold text-xs"
                  >
                    {job.damageType || "Collision"}
                  </Badge>

                  <Badge
                    variant={deadline.isUrgent ? "destructive" : "outline"}
                    className={`gap-1 text-[11px] font-bold backdrop-blur-md ${
                      !deadline.isUrgent ? "bg-card/80" : ""
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {deadline.text}
                  </Badge>
                </div>

                {/* Photos Count Indicator */}
                {hasPhoto && job.images.length > 1 && (
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                    +{job.images.length - 1} photos
                  </span>
                )}
              </div>

              {/* Card Body */}
              <CardContent className="p-4 space-y-3">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {job.carModel}
                    </h3>
                    <span className="text-xs font-semibold text-muted-foreground shrink-0">
                      {job.year}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                    {job.description || "Customer has not provided additional damage notes."}
                  </p>
                </div>

                {/* Location & Radius Pill */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {job.location || "Local Area"}
                  </span>

                  <span>·</span>

                  <span className="text-primary font-semibold">
                    {job.distance ? `${job.distance} away` : "In range"}
                  </span>

                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 ml-auto font-mono">
                    Max {job.biddingRadiusKm || 25}km
                  </Badge>
                </div>
              </CardContent>
            </div>

            {/* Card Footer: Price & Bid CTA */}
            <div className="p-4 pt-0 border-t border-border/40 flex items-center justify-between mt-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Max Budget
                </span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                  €{job.maxPrice.toLocaleString()}
                </span>
              </div>

              <Button
                size="sm"
                className="gap-1.5 font-bold text-xs bg-primary shadow-sm group-hover:bg-primary/90"
              >
                <span>Place Bid</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
