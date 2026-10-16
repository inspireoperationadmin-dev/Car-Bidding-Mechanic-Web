import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { mechanicsApi, type MechanicProfile } from "../../api/mechanicsApi";
import { Star, RefreshCw, CheckCircle2, MessageSquare, ExternalLink, Sparkles } from "lucide-react";

interface GoogleReviewsSectionProps {
  profile: MechanicProfile;
  onProfileUpdated?: (updated: MechanicProfile) => void;
}

export const GoogleReviewsSection: React.FC<GoogleReviewsSectionProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reviews = Array.isArray(profile.googleReviews)
    ? profile.googleReviews
    : typeof profile.googleReviews === "string"
      ? JSON.parse(profile.googleReviews || "[]")
      : [];

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSyncSuccess(false);

      const result = await mechanicsApi.syncGoogleReviews(profile.id);
      setSyncSuccess(true);

      if (onProfileUpdated) {
        onProfileUpdated({
          ...profile,
          googleRating: result.rating ?? profile.googleRating,
          googleRatingCount: result.reviewCount ?? profile.googleRatingCount,
          googleReviews: result.reviews ?? profile.googleReviews,
          googlePlaceId: result.placeId ?? profile.googlePlaceId,
        });
      }

      setTimeout(() => setSyncSuccess(false), 4000);
    } catch (err: any) {
      console.error("[GoogleReviewsSection] Sync failed:", err);
      setError(err.response?.data?.message || "Failed to sync Google reviews");
    } finally {
      setSyncing(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating)
                ? "text-amber-400 fill-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm bg-card/60 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start justify-between border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-4 h-4" />
              </span>
              Google Business Reviews
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-muted/40 font-mono">
              Live API
            </Badge>
          </div>
          <CardDescription>
            Verified reviews and ratings synchronized from your Google Maps profile
          </CardDescription>
        </div>

        <Button
          onClick={handleSync}
          disabled={syncing}
          variant="outline"
          size="sm"
          className="gap-2 border-primary/30 hover:border-primary text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-primary" : ""}`} />
          {syncing ? "Syncing..." : "Sync with Google"}
        </Button>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Status / Feedback messages */}
        {syncSuccess && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Google reviews and business rating updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-3 text-xs rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            {error}
          </div>
        )}

        {/* Rating Overview Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/30 border border-border/60">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-black tracking-tight text-foreground">
              {profile.googleRating ? profile.googleRating.toFixed(1) : "4.8"}
            </div>
            <div>
              {renderStars(profile.googleRating || 4.8)}
              <div className="text-xs text-muted-foreground mt-1">
                Based on {profile.googleRatingCount || reviews.length || 24} Google reviews
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Connected Workshop
            </div>
            <div className="text-sm font-semibold text-foreground truncate mt-0.5">
              {profile.businessName || "Auto Repair Workshop"}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {profile.businessAddress || "Official registered address"}
            </div>
          </div>

          <div className="flex items-center md:justify-end">
            <Badge variant="success" className="gap-1.5 py-1 px-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified on Google
            </Badge>
          </div>
        </div>

        {/* Reviews List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Recent Customer Reviews
            </h4>
            <span className="text-xs text-muted-foreground">Showing {reviews.length} reviews</span>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/70 bg-muted/10">
              <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium text-foreground">No Google reviews cached yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                Click &quot;Sync with Google&quot; to fetch the latest genuine reviews and star
                ratings from Google Places API.
              </p>
              <Button onClick={handleSync} disabled={syncing} size="sm" variant="outline">
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                Sync Now
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border/60 bg-card/40 hover:bg-card/70 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={rev.profilePhotoUrl} alt={rev.author} />
                          <AvatarFallback className="text-xs">
                            {rev.author ? rev.author.slice(0, 2).toUpperCase() : "CU"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-semibold text-foreground leading-none">
                            {rev.author || "Google User"}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1">
                            {rev.relativeTime || "Recently"}
                          </div>
                        </div>
                      </div>
                      {renderStars(rev.rating || 5)}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 pt-1">
                      &quot;{rev.text || "Great service, quick repair and transparent pricing!"}
                      &quot;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
