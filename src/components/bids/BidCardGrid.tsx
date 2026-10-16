import React from "react";
import { type Bid, BidStatus } from "../../store/slices/bidSlice";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Eye,
  Edit3,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "../ui/skeleton";

interface BidCardGridProps {
  bids: Bid[];
  loading: boolean;
  onView: (requestId: number) => void;
  onEdit?: (bid: Bid) => void;
}

export const BidCardGrid: React.FC<BidCardGridProps> = ({ bids, loading, onView, onEdit }) => {
  const { t } = useTranslation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: BidStatus | string) => {
    switch (status) {
      case BidStatus.SELECTED:
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            {t("bids.status.selected", "Won / Selected")}
          </Badge>
        );
      case BidStatus.ACTIVE:
        return (
          <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            {t("bids.status.active", "Active")}
          </Badge>
        );
      case BidStatus.REJECTED:
        return (
          <Badge variant="destructive" className="flex items-center gap-1 font-medium">
            <XCircle className="w-3.5 h-3.5" />
            {t("bids.status.rejected", "Rejected")}
          </Badge>
        );
      case BidStatus.WITHDRAWN:
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 font-medium text-muted-foreground"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {t("bids.status.withdrawn", "Withdrawn")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <Card key={idx} className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-20" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card/50">
        <div className="w-28 h-28 mb-4 rounded-2xl overflow-hidden shadow-md border border-border/60">
          <img
            src="/images/empty_no_bids.jpeg"
            alt="No bids"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {t("bids.table.noBids", "No bids found")}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          {t("bids.noBidsSubtext", "You haven’t submitted any bids matching the current filters.")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {bids.map((bid) => {
        const isSelected = bid.status === BidStatus.SELECTED;
        return (
          <Card
            key={bid.id}
            className={`group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/40 ${
              isSelected ? "border-emerald-500/50 bg-emerald-500/[0.03]" : ""
            }`}
          >
            {/* Top Accent Strip for Won Bids */}
            {isSelected && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
            )}

            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    #{bid.requestId}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(bid.updatedAt || bid.createdAt)}
                  </span>
                </div>
                {getStatusBadge(bid.status)}
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4">
              {/* Bid Amount & Est Duration */}
              <div className="flex items-baseline justify-between border-b border-border/50 pb-3">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                    {t("bids.table.price", "Your Offer")}
                  </span>
                  <div className="text-2xl font-bold text-foreground flex items-center">
                    €{Number(bid.price).toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                    {t("bids.table.duration", "Duration")}
                  </span>
                  <div className="text-sm font-semibold text-foreground flex items-center gap-1 justify-end">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    {bid.durationDays > 0 ? `${bid.durationDays}d ` : ""}
                    {bid.durationHours > 0 ? `${bid.durationHours}h` : ""}
                    {bid.durationDays === 0 && bid.durationHours === 0 ? "-" : ""}
                  </div>
                </div>
              </div>

              {/* Notes excerpt if any */}
              {bid.notes && (
                <div className="text-xs text-muted-foreground line-clamp-2 italic bg-muted/30 p-2 rounded-lg border border-border/40">
                  &ldquo;{bid.notes}&rdquo;
                </div>
              )}
            </CardContent>

            <CardFooter className="p-5 pt-0 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => onView(bid.requestId)}
              >
                <Eye className="w-4 h-4" />
                {t("bids.table.viewJob", "View Job")}
              </Button>

              {onEdit && bid.status === BidStatus.ACTIVE && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onEdit(bid)}
                >
                  <Edit3 className="w-4 h-4" />
                  {t("bids.table.editBid", "Edit")}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
