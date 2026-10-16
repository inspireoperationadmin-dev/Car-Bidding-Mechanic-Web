import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { repairProgressApi, RepairStage, type RepairMilestone } from "../../api/repairProgressApi";
import {
  Wrench,
  CheckCircle2,
  Clock,
  PlusCircle,
  Calendar,
  AlertCircle,
  Truck,
  Layers,
  ShoppingBag,
  Paintbrush,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

interface RepairProgressTrackerProps {
  requestId: number;
  isMechanicOwner?: boolean;
}

const STAGE_CONFIG: Record<
  RepairStage,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  [RepairStage.VEHICLE_RECEIVED]: {
    label: "Vehicle Received",
    icon: Truck,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  [RepairStage.DISASSEMBLY]: {
    label: "Disassembly & Diagnosis",
    icon: Layers,
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  },
  [RepairStage.PARTS_ORDERED]: {
    label: "Parts Ordered",
    icon: ShoppingBag,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  [RepairStage.REPAIR_IN_PROGRESS]: {
    label: "Repair in Progress",
    icon: Wrench,
    color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
  },
  [RepairStage.PAINTING]: {
    label: "Painting & Finishing",
    icon: Paintbrush,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  },
  [RepairStage.QUALITY_INSPECTION]: {
    label: "Quality Inspection",
    icon: ShieldCheck,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  [RepairStage.COMPLETED_READY_FOR_PICKUP]: {
    label: "Completed & Ready for Pickup",
    icon: Sparkles,
    color: "text-emerald-600 bg-emerald-600/10 border-emerald-600/20",
  },
};

const STAGES_ORDER: RepairStage[] = [
  RepairStage.VEHICLE_RECEIVED,
  RepairStage.DISASSEMBLY,
  RepairStage.PARTS_ORDERED,
  RepairStage.REPAIR_IN_PROGRESS,
  RepairStage.PAINTING,
  RepairStage.QUALITY_INSPECTION,
  RepairStage.COMPLETED_READY_FOR_PICKUP,
];

export const RepairProgressTracker: React.FC<RepairProgressTrackerProps> = ({
  requestId,
  isMechanicOwner = true,
}) => {
  const [milestones, setMilestones] = useState<RepairMilestone[]>([]);
  const [currentStage, setCurrentStage] = useState<RepairStage | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedStage, setSelectedStage] = useState<RepairStage>(RepairStage.VEHICLE_RECEIVED);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationValue, setDurationValue] = useState<number | "">("");
  const [durationUnit, setDurationUnit] = useState<"HOURS" | "DAYS">("DAYS");
  const [completionDate, setCompletionDate] = useState("");
  const [photoUrlInput, setPhotoUrlInput] = useState("");

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      const data = await repairProgressApi.getRepairProgress(requestId);
      setMilestones(data.milestones || []);
      setCurrentStage(data.currentStage || null);
    } catch (err: any) {
      console.warn("[RepairProgressTracker] Error fetching progress:", err.message);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const handleOpenDialog = () => {
    // Determine next logical stage
    const currentIndex = currentStage ? STAGES_ORDER.indexOf(currentStage) : -1;
    const nextStage =
      currentIndex < STAGES_ORDER.length - 1
        ? STAGES_ORDER[currentIndex + 1]
        : STAGES_ORDER[STAGES_ORDER.length - 1];

    setSelectedStage(nextStage);
    setTitle(STAGE_CONFIG[nextStage]?.label || "");
    setDescription("");
    setDurationValue("");
    setCompletionDate("");
    setPhotoUrlInput("");
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmitMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const photos = photoUrlInput
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);

      await repairProgressApi.logRepairProgress(requestId, {
        stage: selectedStage,
        title: title.trim(),
        description: description.trim() || undefined,
        photoUrls: photos.length > 0 ? photos : undefined,
        estimatedCompletionDate: completionDate
          ? new Date(completionDate).toISOString()
          : undefined,
        durationDays:
          durationUnit === "DAYS" && durationValue !== "" ? Number(durationValue) : undefined,
        durationHours:
          durationUnit === "HOURS" && durationValue !== "" ? Number(durationValue) : undefined,
      });

      setDialogOpen(false);
      await loadProgress();
    } catch (err: any) {
      console.error("[RepairProgressTracker] Submit failed:", err);
      setError(err.response?.data?.message || "Failed to log progress milestone");
    } finally {
      setSubmitting(false);
    }
  };

  const getStageIndex = (stage: RepairStage | null) => {
    return stage ? STAGES_ORDER.indexOf(stage) : -1;
  };

  const currentIdx = getStageIndex(currentStage);

  return (
    <Card className="border-border/80 shadow-md bg-card/70 backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wrench className="w-4 h-4" />
            </span>
            <CardTitle className="text-xl font-bold">Repair Progress & Tracking</CardTitle>
            {currentStage && (
              <Badge variant="success" className="capitalize text-xs font-semibold">
                {STAGE_CONFIG[currentStage]?.label}
              </Badge>
            )}
          </div>
          <CardDescription>
            Update live repair milestones and notify the customer of vehicle repair status
          </CardDescription>
        </div>

        {isMechanicOwner && (
          <Button
            onClick={handleOpenDialog}
            size="sm"
            className="gap-2 font-semibold text-xs bg-primary shadow-md hover:bg-primary/90"
          >
            <PlusCircle className="w-4 h-4" />
            Update Work
          </Button>
        )}
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Horizontal Milestone Stepper */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center justify-between min-w-[650px] px-2 py-3 bg-muted/20 rounded-xl border border-border/40">
            {STAGES_ORDER.map((stage, idx) => {
              const config = STAGE_CONFIG[stage];
              const Icon = config.icon;
              const isDone = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <React.Fragment key={stage}>
                  <div className="flex flex-col items-center text-center group cursor-default">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? "ring-4 ring-primary/20 bg-primary text-primary-foreground shadow-md"
                          : isDone
                            ? "bg-emerald-500 text-white"
                            : "bg-muted text-muted-foreground/60 border border-border"
                      }`}
                    >
                      {isDone && !isCurrent ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-2 max-w-[85px] leading-tight line-clamp-2 ${
                        isCurrent
                          ? "text-primary font-bold"
                          : isDone
                            ? "text-foreground"
                            : "text-muted-foreground/60"
                      }`}
                    >
                      {config.label}
                    </span>
                  </div>

                  {idx < STAGES_ORDER.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1.5 transition-colors ${
                        idx < currentIdx ? "bg-emerald-500" : "bg-border/60"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Milestone Timeline List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Milestone History ({milestones.length})
            </h4>
          </div>

          {loading ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Loading repair milestones...
            </div>
          ) : milestones.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/60 bg-muted/10">
              <Clock className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">
                No repair milestones logged yet
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-3">
                Log the first milestone when you receive the vehicle into your shop so the customer
                can track real-time progress.
              </p>
              {isMechanicOwner && (
                <Button onClick={handleOpenDialog} size="sm" variant="outline">
                  <PlusCircle className="w-3.5 h-3.5 mr-2" />
                  Log First Milestone
                </Button>
              )}
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/70">
              {milestones.map((m) => {
                const config = STAGE_CONFIG[m.stage] || STAGE_CONFIG[RepairStage.VEHICLE_RECEIVED];
                const Icon = config.icon;

                return (
                  <div key={m.id} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>

                    <div className="p-4 rounded-xl border border-border/60 bg-card/60 shadow-sm hover:border-border transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs gap-1 py-0.5 px-2 font-medium ${config.color}`}
                          >
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </Badge>
                          <span className="text-sm font-bold text-foreground">{m.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(m.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {m.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                          {m.description}
                        </p>
                      )}

                      {/* Remaining / Estimated info */}
                      {(m.durationDays || m.durationHours || m.estimatedCompletionDate) && (
                        <div className="flex flex-wrap items-center gap-3 mt-3 pt-2.5 border-t border-border/40 text-[11px] text-muted-foreground">
                          {(m.durationDays || m.durationHours) && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-primary" />
                              Estimated Duration:{" "}
                              <strong className="text-foreground">
                                {m.durationDays
                                  ? `${m.durationDays} Days`
                                  : `${m.durationHours} Hours`}
                              </strong>
                            </span>
                          )}

                          {m.estimatedCompletionDate && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-emerald-500" />
                              Target Completion:{" "}
                              <strong className="text-foreground">
                                {new Date(m.estimatedCompletionDate).toLocaleDateString()}
                              </strong>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Photos if attached */}
                      {m.photoUrls && m.photoUrls.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 pt-2">
                          {m.photoUrls.map((url, pIdx) => (
                            <a
                              key={pIdx}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-12 h-12 rounded-lg border border-border overflow-hidden block hover:opacity-80 transition-opacity"
                            >
                              <img src={url} alt="Proof" className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>

      {/* Log Milestone Modal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Wrench className="w-5 h-5 text-primary" />
              Update Repair Milestone
            </DialogTitle>
            <DialogDescription>
              Record the current stage of repair and share updates with the customer.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitMilestone} className="space-y-4 pt-2">
            {error && (
              <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Repair Stage Selector */}
            <div className="space-y-1.5">
              <Label htmlFor="stage" className="text-xs font-semibold text-foreground">
                Repair Stage
              </Label>
              <Select
                value={selectedStage}
                onValueChange={(val) => {
                  const stage = val as RepairStage;
                  setSelectedStage(stage);
                  setTitle(STAGE_CONFIG[stage]?.label || "");
                }}
              >
                <SelectTrigger id="stage" className="w-full">
                  <SelectValue placeholder="Select repair stage" />
                </SelectTrigger>
                <SelectContent>
                  {STAGES_ORDER.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {STAGE_CONFIG[stage]?.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold text-foreground">
                Milestone Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Engine disassembly complete"
                required
              />
            </div>

            {/* Description / Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-xs font-semibold text-foreground">
                Progress Notes for Customer (Optional)
              </Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details on parts replaced, diagnostics performed, or next steps..."
                rows={3}
              />
            </div>

            {/* Duration / Hours remaining */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="duration" className="text-xs font-semibold text-foreground">
                  Est. Work Duration
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={durationValue}
                    onChange={(e) =>
                      setDurationValue(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="e.g. 3"
                  />
                  <Select
                    value={durationUnit}
                    onValueChange={(v) => setDurationUnit(v as "HOURS" | "DAYS")}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOURS">Hours</SelectItem>
                      <SelectItem value="DAYS">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="completionDate" className="text-xs font-semibold text-foreground">
                  Target Completion Date
                </Label>
                <Input
                  id="completionDate"
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                />
              </div>
            </div>

            {/* Photo URLs */}
            <div className="space-y-1.5">
              <Label htmlFor="photos" className="text-xs font-semibold text-foreground">
                Photo URLs (One per line, optional)
              </Label>
              <Textarea
                id="photos"
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                placeholder="https://example.com/repair-photo-1.jpg"
                rows={2}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="font-semibold gap-1.5">
                {submitting ? "Saving..." : "Save Milestone"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
