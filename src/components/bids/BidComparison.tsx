import React from "react";
import { useTranslation } from "react-i18next";
import { BidStatus } from "../../store/slices/bidSlice";
import type { Bid } from "../../api/bidsApi";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { TrendingUp, Coins, Clock, Trophy } from "lucide-react";

interface BidComparisonProps {
  bids: Bid[];
  currentMechanicId?: number | string;
  currentUserId?: number | string;
  adminMaxPrice?: number;
  loading?: boolean;
}

export const BidComparison: React.FC<BidComparisonProps> = ({
  bids,
  currentMechanicId,
  currentUserId,
  adminMaxPrice,
  loading,
}) => {
  const { t } = useTranslation();

  // Find only MY bid
  const myBid = bids.find((b) => {
    const mechanicUser = (b as any).mechanic?.user;
    const matchesProfileId =
      currentMechanicId && String(b.mechanicId) === String(currentMechanicId);
    const matchesUserId =
      currentUserId && mechanicUser?.id && String(mechanicUser.id) === String(currentUserId);
    return matchesProfileId || matchesUserId;
  });

  const activeBid =
    myBid && (myBid.status === BidStatus.ACTIVE || myBid.status === BidStatus.SELECTED)
      ? myBid
      : null;

  const formatDuration = (d: number, h: number) => {
    if (d > 0 && h > 0) return `${d} Days ${h} Hrs`;
    if (d > 0) return `${d} Days`;
    return `${h} Hrs`;
  };

  const savingsAmount = activeBid && adminMaxPrice ? adminMaxPrice - activeBid.price : null;
  const priceBarWidth =
    activeBid && adminMaxPrice && adminMaxPrice > 0
      ? Math.min(Math.round((activeBid.price / adminMaxPrice) * 100), 100)
      : 0;

  if (loading) {
    return (
      <div className="w-full h-2 bg-muted/40 rounded-full overflow-hidden mt-4">
        <div className="h-full bg-primary animate-pulse rounded-full w-2/3" />
      </div>
    );
  }

  if (!activeBid) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 text-base font-semibold text-foreground">
        <TrendingUp className="w-4 h-4 text-primary" />
        <span>{t("bids.comparison.title", "My Bid Summary")}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Your Bid Price Card */}
        <Card className="border-primary/30 bg-primary/5 shadow-xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Coins className="w-3.5 h-3.5 text-primary" />
              <span>{t("bids.comparison.yourBid", "YOUR BID")}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              €{activeBid.price.toLocaleString()}
            </div>
            {adminMaxPrice && (
              <div className="text-xs text-muted-foreground">
                {t("bids.comparison.maxBudget", "Admin Max")}: €{adminMaxPrice.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Duration Card */}
        <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t("bids.comparison.duration", "ESTIMATED DURATION")}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatDuration(activeBid.durationDays, activeBid.durationHours)}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("bids.comparison.completionTime", "Promised completion time")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price vs Budget Progress Bar */}
      {adminMaxPrice && (
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-foreground">
              <span>{t("bids.comparison.priceVsBudget", "Your Price vs Max Budget")}</span>
              <span className="font-semibold text-primary">{priceBarWidth}%</span>
            </div>

            <div className="relative h-2.5 w-full bg-muted/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  priceBarWidth <= 80
                    ? "bg-emerald-500"
                    : priceBarWidth <= 95
                      ? "bg-amber-500"
                      : "bg-destructive"
                }`}
                style={{ width: `${priceBarWidth}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>€0</span>
              <span>Max: €{adminMaxPrice.toLocaleString()}</span>
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center gap-2">
              <Trophy
                className={`w-4 h-4 shrink-0 ${
                  savingsAmount && savingsAmount >= 0 ? "text-amber-500" : "text-muted-foreground"
                }`}
              />
              <span className="text-xs text-muted-foreground">
                {savingsAmount && savingsAmount >= 0
                  ? t("bids.comparison.withinBudget", "Your bid is within the admin max budget.")
                  : t("bids.comparison.overBudget", "Your bid exceeds the admin max budget.")}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BidComparison;
