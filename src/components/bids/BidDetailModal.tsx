import { useEffect, useState } from "react";
import { X, Edit2, Car, Clock, FileText, AlertTriangle, Loader2, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

// Redux
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { type Bid, BidStatus, updateBidAsync, selectBidLoading } from "../../store/slices/bidSlice";
import {
  fetchJobById,
  selectJobDetail,
  selectJobsLoading,
  clearSelectedJob,
} from "../../store/slices/jobsSlice";

// Components & UI
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { BidForm, type BidFormData } from "./BidForm";
import { ImageCarousel } from "../media/ImageCarousel";

interface BidDetailModalProps {
  open: boolean;
  onClose: () => void;
  bid: Bid | null;
  onUpdateSuccess?: () => void;
  onUpdateError?: (error: string) => void;
}

export const BidDetailModal = ({
  open,
  onClose,
  bid,
  onUpdateSuccess,
  onUpdateError,
}: BidDetailModalProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  const job = useAppSelector(selectJobDetail);
  const jobLoading = useAppSelector(selectJobsLoading);
  const bidLoading = useAppSelector(selectBidLoading);

  // Load Job & Reset State
  useEffect(() => {
    if (open && bid?.requestId) {
      dispatch(fetchJobById(bid.requestId.toString()));
    }
    return () => {
      if (!open) {
        dispatch(clearSelectedJob());
        setIsEditing(false);
        setEditError(null);
        setLightboxOpen(false);
      }
    };
  }, [open, bid, dispatch]);

  // Deadline Checker Helper
  const isDeadlinePassed = job && new Date(job.deadline) < new Date();

  // Handle Update
  const handleUpdateBid = async (data: BidFormData) => {
    if (!bid) return;

    try {
      const updatePayload = {
        bidId: bid.id,
        price: data.amount,
        estimatedDurationDays: data.durationUnit === "DAYS" ? data.durationValue : 0,
        estimatedDurationHours: data.durationUnit === "HOURS" ? data.durationValue : 0,
        notes: data.notes,
      };

      await dispatch(updateBidAsync(updatePayload)).unwrap();
      setIsEditing(false);
      setEditError(null);

      if (onUpdateSuccess) onUpdateSuccess();
    } catch (err) {
      const errorMsg = typeof err === "string" ? t(err) : t("bids.errors.updateFailed");
      if (onUpdateError) {
        onUpdateError(errorMsg);
      } else {
        setEditError(errorMsg);
      }
    }
  };

  // Handle Withdraw
  const handleWithdrawBid = async () => {
    if (!bid || !window.confirm(t("bids.detail.confirmWithdraw"))) return;

    try {
      await dispatch(
        updateBidAsync({
          bidId: bid.id,
          status: BidStatus.WITHDRAWN,
        })
      ).unwrap();

      if (onUpdateSuccess) onUpdateSuccess();
      onClose();
    } catch (err) {
      const errorMsg = typeof err === "string" ? t(err) : t("bids.errors.withdrawFailed");
      if (onUpdateError) {
        onUpdateError(errorMsg);
      } else {
        setEditError(errorMsg);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case BidStatus.SELECTED:
        return <Badge variant="success">{t(`bids.status.${status.toLowerCase()}`, status)}</Badge>;
      case BidStatus.REJECTED:
        return (
          <Badge variant="destructive">{t(`bids.status.${status.toLowerCase()}`, status)}</Badge>
        );
      case BidStatus.WITHDRAWN:
        return <Badge variant="warning">{t(`bids.status.${status.toLowerCase()}`, status)}</Badge>;
      case BidStatus.ACTIVE:
        return <Badge variant="info">{t(`bids.status.${status.toLowerCase()}`, status)}</Badge>;
      default:
        return (
          <Badge variant="secondary">{t(`bids.status.${status.toLowerCase()}`, status)}</Badge>
        );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return (
      new Date(dateString).toLocaleDateString() +
      " " +
      new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const handleImageClick = (index: number) => {
    setSelectedImgIndex(index);
    setLightboxOpen(true);
  };

  if (!bid) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 sm:rounded-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-border/60 sticky top-0 bg-background/95 backdrop-blur-md z-10">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-foreground">
                {isEditing
                  ? t("bids.detail.titleEdit", "Edit Bid")
                  : `${t("bids.detail.titleView", "Bid Details")} #${bid.id}`}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="p-6">
            {editError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{editError}</AlertDescription>
              </Alert>
            )}

            {jobLoading && !job ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm font-medium">{t("common.loading")}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* LEFT SIDE: IMAGES & SUMMARY */}
                <div className="md:col-span-5 space-y-4">
                  {/* IMAGES */}
                  {job && job.images && job.images.length > 0 ? (
                    <div className="rounded-xl overflow-hidden border border-border/60 bg-muted/20">
                      <ImageCarousel
                        images={job.images}
                        onImageClick={handleImageClick}
                        autoPlay={true}
                        interval={4000}
                      />
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl border border-dashed border-border/80 text-center bg-muted/10">
                      <Car className="w-12 h-12 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">No vehicle photos available</p>
                    </div>
                  )}

                  {/* JOB SUMMARY */}
                  <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                      <Car className="w-4 h-4" />
                      {t("bids.detail.jobSummary")}
                    </div>

                    {job ? (
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h3 className="text-base font-bold text-foreground">
                            {job.carModel}{" "}
                            <span className="font-normal text-muted-foreground">({job.year})</span>
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {job.status}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed">
                          {job.description}
                        </p>

                        {isDeadlinePassed && (
                          <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>{t("bids.detail.biddingClosed")}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-destructive">{t("bids.detail.jobUnavailable")}</p>
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE: BID DETAILS */}
                <div className="md:col-span-7">
                  {isEditing ? (
                    <div className="p-4 rounded-xl border border-border/60 bg-card/40">
                      <BidForm
                        adminMaxPrice={job?.maxPrice || 0}
                        loading={bidLoading}
                        onSubmit={handleUpdateBid}
                        initialValues={{
                          amount: bid.price,
                          durationValue:
                            bid.durationDays > 0 ? bid.durationDays : bid.durationHours,
                          durationUnit: bid.durationDays > 0 ? "DAYS" : "HOURS",
                          notes: bid.notes || "",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Price & Status Banner */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 via-muted/20 to-transparent border border-border/60">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            {t("bids.detail.currentStatus")}
                          </div>
                          {getStatusBadge(bid.status)}
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            {t("bids.detail.bidAmount")}
                          </div>
                          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            €{bid.price}
                          </div>
                        </div>
                      </div>

                      {/* Details Stack */}
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/40">
                          <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground block">
                              Estimated Duration
                            </span>
                            <span className="text-sm font-semibold text-foreground">
                              {bid.durationDays > 0
                                ? `${bid.durationDays} ${t("bids.detail.days")}`
                                : `${bid.durationHours} ${t("bids.detail.hours")}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/40">
                          <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-medium text-muted-foreground block">
                              Notes & Proposal
                            </span>
                            <p className="text-sm text-foreground whitespace-pre-wrap mt-0.5 leading-relaxed">
                              {bid.notes || t("bids.detail.noNotes")}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-dashed border-border/80 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{t("bids.detail.placedOn")}:</span>
                            <span className="font-medium text-foreground">
                              {formatDate(bid.createdAt)}
                            </span>
                          </div>
                          {bid.updatedAt !== bid.createdAt && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{t("bids.detail.lastUpdated")}:</span>
                              <span className="font-medium text-foreground">
                                {formatDate(bid.updatedAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 sm:justify-between">
            {isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="w-full sm:w-auto"
              >
                {t("bids.detail.cancelEdit")}
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleWithdrawBid}
                  className="w-full sm:w-auto"
                >
                  {t("bids.detail.withdrawAction")}
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                    {t("bids.detail.close")}
                  </Button>
                  {bid.status === BidStatus.ACTIVE && (
                    <Button
                      variant="default"
                      onClick={() => setIsEditing(true)}
                      disabled={!!isDeadlinePassed}
                      className="w-full sm:w-auto gap-1.5"
                    >
                      <Edit2 className="w-4 h-4" />
                      {isDeadlinePassed
                        ? t("bids.detail.deadlinePassed", "Bidding Closed")
                        : t("bids.detail.editAction", "Edit Bid")}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LIGHTBOX DIALOG */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-2 bg-black/90 border-black text-white">
          <div className="relative flex items-center justify-center p-2">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white z-10 transition-colors"
              aria-label="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>
            {job?.images && job.images[selectedImgIndex] && (
              <img
                src={job.images[selectedImgIndex]}
                alt="Full size preview"
                className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
