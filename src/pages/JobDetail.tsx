import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Coins,
  FileText,
  Calendar,
  Clock,
  Car,
  Wrench,
  Navigation,
  Pencil,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchJobById,
  selectJobDetail,
  selectJobsLoading,
  selectJobsError,
} from "../store/slices/jobsSlice";
import {
  placeBidAsync,
  updateBidAsync,
  selectBidLoading,
  fetchBidsForRequestAsync,
  selectCurrentBid,
  BidStatus,
} from "../store/slices/bidSlice";
import { selectUser } from "../store/slices/authSlice";
import { ImageGallery } from "../components/media/ImageGallery";
import { BidForm, type BidFormData } from "../components/bids/BidForm";
import { BidComparison } from "../components/bids/BidComparison";
import { RepairProgressTracker } from "../components/jobs/RepairProgressTracker";
import { sanitizeInput } from "../utils/security";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

export const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const job = useAppSelector(selectJobDetail);
  const jobLoading = useAppSelector(selectJobsLoading);
  const jobError = useAppSelector(selectJobsError);
  const bidLoading = useAppSelector(selectBidLoading);
  const existingBid = useAppSelector(selectCurrentBid);
  const user = useAppSelector(selectUser);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });
  const [isEditing, setIsEditing] = useState(false);

  const showToast = (message: string, severity: "success" | "error" | "info" = "success") => {
    setToast({ open: true, message, severity });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 4500);
  };

  const loadData = useCallback(() => {
    if (id) {
      const requestId = parseInt(id);
      dispatch(fetchJobById(id));
      dispatch(fetchBidsForRequestAsync(requestId));
    }
  }, [id, dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBidSubmit = async (data: BidFormData) => {
    if (!id) return;
    try {
      if (existingBid) {
        // UPDATE EXISTING BID
        await dispatch(
          updateBidAsync({
            bidId: existingBid.id,
            price: data.amount,
            estimatedDurationDays: data.durationUnit === "DAYS" ? data.durationValue : 0,
            estimatedDurationHours: data.durationUnit === "HOURS" ? data.durationValue : 0,
            notes: data.notes,
            appointmentDates: data.appointmentDates,
          })
        ).unwrap();
        showToast(t("bids.detail.updateSuccess", "Proposal updated successfully!"), "success");
        setIsEditing(false);
      } else {
        // PLACE NEW BID
        const payload = {
          requestId: parseInt(id),
          price: data.amount,
          estimatedDurationDays: data.durationUnit === "DAYS" ? data.durationValue : 0,
          estimatedDurationHours: data.durationUnit === "HOURS" ? data.durationValue : 0,
          notes: data.notes,
          appointmentDates: data.appointmentDates,
        };
        await dispatch(placeBidAsync(payload)).unwrap();
        showToast(t("jobs.detail.bidPlacedSuccess", "Your proposal was submitted!"), "success");
      }
      // Refresh
      dispatch(fetchBidsForRequestAsync(parseInt(id)));
    } catch (err: any) {
      const errorMessage =
        typeof err === "string"
          ? t(err)
          : err?.message || t("common.errorBoundary.subtitle", "Operation failed");
      showToast(errorMessage, "error");
    }
  };

  if (jobLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">
          {t("common.loading", "Loading repair request details...")}
        </p>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>{t("common.error", "Error")}</AlertTitle>
          <AlertDescription>{jobError || "Job not found"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate("/jobs")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>{t("jobs.detail.backToJobs", "Back to Jobs")}</span>
          </Button>
        </div>
      </div>
    );
  }

  const isDeadlinePassed = new Date(job.deadline) < new Date();
  const isOpen = job.status === "OPEN";

  return (
    <div className="space-y-6 container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
      {/* Toast Notification */}
      {toast.open && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-card border border-border shadow-lg text-foreground text-sm font-medium">
            {toast.severity === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast((prev) => ({ ...prev, open: false }))}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/jobs")}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("jobs.detail.backToJobs", "Back to Jobs")}</span>
        </Button>

        <div className="flex items-center gap-2">
          <Badge
            variant={isOpen ? "default" : "secondary"}
            className={
              isOpen
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold"
                : "font-semibold"
            }
          >
            {job.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Photos, Vehicle Info, Description & Progress (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Photos */}
          <ImageGallery images={job.images} title={t("jobs.detail.photos", "Damage Photos")} />

          {/* Description & Vehicle Specs */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>
                  {t("jobs.detail.damageDesc", "Damage Description & Vehicle Specifications")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {job.description
                  ? sanitizeInput(job.description)
                  : t("common.noDescription", "No description provided")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                  <div className="text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Car className="w-3.5 h-3.5" />
                    <span>{t("jobs.detail.vehicle", "VEHICLE")}</span>
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {job.carModel} ({job.year})
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                  <div className="text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{t("jobs.detail.damageType", "DAMAGE TYPE")}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {job.damageType}
                  </Badge>
                </div>

                <div className="sm:col-span-2 p-3 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <div className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                        DISTANCE & RADIUS
                      </div>
                      <div className="text-xs font-medium text-foreground">
                        {job.distance
                          ? `${job.distance} from your workshop`
                          : "Within service area"}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    Max: {job.biddingRadiusKm || 25} km
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Repair Progress Tracker (When bid is SELECTED / WON or Request is MECHANIC_SELECTED) */}
          {(existingBid?.status === BidStatus.SELECTED || (existingBid as any)?.status === "SELECTED" || (existingBid as any)?.isSelected || (job?.status === "MECHANIC_SELECTED" && ((job as any)?.selectedMechanicId === user?.profileId || existingBid))) && id && (
            <RepairProgressTracker requestId={parseInt(id)} isMechanicOwner={true} />
          )}

          {/* Bid Comparison / Summary */}
          <BidComparison
            bids={existingBid ? [existingBid] : []}
            currentMechanicId={user?.profileId}
            currentUserId={user?.id}
            adminMaxPrice={job.maxPrice}
            loading={bidLoading}
          />
        </div>

        {/* RIGHT COLUMN: Budget, Proposal Form / Existing Bid Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24">
            <Card className="border-border/60 shadow-md">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {t("jobs.detail.maxBudget", "Maximum Target Budget")}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      €{job.maxPrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground font-medium">
                      {t("jobs.table.deadline", "Deadline")}
                    </div>
                    <div className="text-xs font-semibold text-foreground mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Coins className="w-4 h-4 text-primary" />
                  <span>
                    {existingBid && !isEditing
                      ? t("bids.detail.titleView", "Your Active Proposal")
                      : isEditing
                        ? t("bids.detail.titleEdit", "Edit Your Proposal")
                        : t("jobs.detail.placeBid", "Submit a Proposal")}
                  </span>
                </div>

                {existingBid && !isEditing ? (
                  <div className="p-4 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">
                        {t("bids.detail.currentStatus", "Current Status")}
                      </span>
                      <Badge
                        variant={
                          existingBid.status === BidStatus.SELECTED ? "default" : "secondary"
                        }
                        className={
                          existingBid.status === BidStatus.SELECTED
                            ? "bg-emerald-500 text-white"
                            : "bg-primary/10 text-primary border-primary/20"
                        }
                      >
                        {t(`bids.status.${existingBid.status.toLowerCase()}`, existingBid.status)}
                      </Badge>
                    </div>

                    <div>
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">
                        {t("bids.detail.bidAmount", "PROPOSED PRICE")}
                      </span>
                      <span className="text-2xl font-bold text-foreground">
                        €{existingBid.price.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">
                        {t("bids.detail.estimatedDuration", "ESTIMATED REPAIR DURATION")}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {existingBid.durationDays > 0
                          ? `${existingBid.durationDays} ${t("bids.detail.days", "Days")}`
                          : `${existingBid.durationHours} ${t("bids.detail.hours", "Hours")}`}
                      </span>
                    </div>

                    {/* Appointment Slots */}
                    {existingBid.appointmentDates &&
                      (existingBid as any).appointmentDates?.length > 0 && (
                        <div>
                          <span className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">
                            {t("bids.detail.availableDates", "PROPOSED APPOINTMENT DATES")}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {((existingBid as any).appointmentDates as string[]).map(
                              (iso: string) => {
                                const d = new Date(iso);
                                return (
                                  <Badge
                                    key={iso}
                                    variant="outline"
                                    className="text-[10px] font-mono"
                                  >
                                    {d.toLocaleDateString(undefined, {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                    })}{" "}
                                    @{" "}
                                    {d.toLocaleTimeString(undefined, {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })}
                                  </Badge>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}

                    {existingBid.status === BidStatus.ACTIVE && (
                      <div className="pt-2">
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                          className="w-full gap-2 font-semibold"
                        >
                          <Pencil className="w-4 h-4" />
                          <span>{t("bids.detail.editAction", "Edit Proposal")}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <BidForm
                      adminMaxPrice={job.maxPrice}
                      onSubmit={handleBidSubmit}
                      loading={bidLoading}
                      minAppointmentDates={3}
                      initialValues={
                        existingBid
                          ? {
                              amount: existingBid.price,
                              durationValue:
                                existingBid.durationDays > 0
                                  ? existingBid.durationDays
                                  : existingBid.durationHours,
                              durationUnit: existingBid.durationDays > 0 ? "DAYS" : "HOURS",
                              notes: existingBid.notes || "",
                              appointmentDates: existingBid.appointmentDates,
                            }
                          : undefined
                      }
                    />

                    {isEditing && (
                      <Button
                        variant="ghost"
                        onClick={() => setIsEditing(false)}
                        className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {t("common.cancel", "Cancel Edit")}
                      </Button>
                    )}
                  </div>
                )}

                {isDeadlinePassed && !existingBid && (
                  <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-4">
                    <Lock className="w-4 h-4" />
                    <AlertDescription className="text-xs">
                      {t(
                        "bids.detail.biddingClosed",
                        "Bidding deadline has ended for this vehicle request."
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
