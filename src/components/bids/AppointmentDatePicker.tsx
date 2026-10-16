import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar as CalendarIcon,
  Clock,
  X,
  Check,
  Plus,
  Trash2,
  ChevronRight,
} from "lucide-react";

// UI
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pad2 = (n: number) => String(n).padStart(2, "0");

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getDayRange = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// ─── Time Slots (08:00 → 18:00, every 30 min) ────────────────────────────────
const TIME_SLOTS = (() => {
  const slots: { label: string; hour: number; minute: number }[] = [];
  for (let h = 8; h <= 18; h++) {
    slots.push({ label: `${pad2(h)}:00`, hour: h, minute: 0 });
    if (h < 18) slots.push({ label: `${pad2(h)}:30`, hour: h, minute: 30 });
  }
  return slots;
})();

// ─── Props ────────────────────────────────────────────────────────────────────
interface AppointmentDatePickerProps {
  value: string[];
  onChange: (dates: string[]) => void;
  disabled?: boolean;
  minRequired?: number;
  maxAllowed?: number;
  durationValue?: number;
  durationUnit?: "HOURS" | "DAYS";
  error?: boolean;
  helperText?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const AppointmentDatePicker = ({
  value: appointmentDates,
  onChange: setAppointmentDates,
  disabled = false,
  minRequired = 3,
  maxAllowed = 3,
  durationValue = 1,
  durationUnit = "DAYS",
  error = false,
  helperText,
}: AppointmentDatePickerProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedDateForTime, setSelectedDateForTime] = useState<Date | null>(null);

  // Compute timeline spacing in calendar days based on repair duration
  const timelineDays = useMemo(() => {
    if (durationUnit === "HOURS") {
      return Math.max(1, Math.ceil((Number(durationValue) || 1) / 24));
    }
    return Math.max(1, Math.floor(Number(durationValue) || 1));
  }, [durationValue, durationUnit]);

  // Localized pretty helpers
  const prettyDate = useCallback(
    (d: Date) =>
      d.toLocaleDateString(currentLang, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    [currentLang]
  );

  const prettyTime = useCallback(
    (d: Date) =>
      d.toLocaleTimeString(currentLang, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [currentLang]
  );

  const prettyDateTime = useCallback(
    (iso: string) => {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return `${prettyDate(d)} @ ${prettyTime(d)}`;
    },
    [prettyDate, prettyTime]
  );

  // Next 30 days (starting tomorrow)
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const getSelectedForDate = useCallback(
    (date: Date) => {
      const { start, end } = getDayRange(date);
      return appointmentDates.find((iso) => {
        const d = new Date(iso);
        return d >= start && d <= end;
      });
    },
    [appointmentDates]
  );

  // Check if a candidate date conflicts with ANY currently selected date's repair timeline
  const getConflictForDate = useCallback(
    (date: Date) => {
      const startD = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      for (const iso of appointmentDates) {
        const s = new Date(iso);
        if (sameDay(date, s)) continue;
        const startS = new Date(s.getFullYear(), s.getMonth(), s.getDate());
        const diffDays = Math.round(
          Math.abs(startD.getTime() - startS.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays < timelineDays) {
          return {
            conflictingIso: iso,
            conflictingDate: s,
            diffDays,
          };
        }
      }
      return null;
    },
    [appointmentDates, timelineDays]
  );

  // Check if any existing selected dates conflict with each other
  const hasExistingConflicts = useMemo(() => {
    for (let i = 0; i < appointmentDates.length; i++) {
      const d1 = new Date(appointmentDates[i]);
      const s1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
      for (let j = i + 1; j < appointmentDates.length; j++) {
        const d2 = new Date(appointmentDates[j]);
        const s2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
        const diff = Math.round(Math.abs(s1.getTime() - s2.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < timelineDays) {
          return true;
        }
      }
    }
    return false;
  }, [appointmentDates, timelineDays]);

  const handleDateClick = (date: Date) => {
    // If already selected, deselect
    const existing = getSelectedForDate(date);
    if (existing) {
      setAppointmentDates(appointmentDates.filter((d) => d !== existing));
      return;
    }

    // Guard: Max 3 dates allowed
    if (appointmentDates.length >= maxAllowed) {
      return;
    }

    // Guard: Duration timeline conflict with an already selected date
    if (getConflictForDate(date)) {
      return;
    }

    // Otherwise open time picker
    setSelectedDateForTime(date);
    setShowTimeModal(true);
  };

  const handleTimeSelect = (hour: number, minute: number) => {
    if (!selectedDateForTime) return;
    const dt = new Date(selectedDateForTime);
    dt.setHours(hour, minute, 0, 0);
    const iso = dt.toISOString();
    const { start, end } = getDayRange(selectedDateForTime);
    const filtered = appointmentDates.filter((x) => {
      const d = new Date(x);
      return !(d >= start && d <= end);
    });

    if (filtered.length >= maxAllowed) {
      return;
    }

    setAppointmentDates([...filtered, iso].sort());
    setShowTimeModal(false);
    setSelectedDateForTime(null);
  };

  const removeDate = (iso: string) => {
    setAppointmentDates(appointmentDates.filter((d) => d !== iso));
  };

  const clearAll = () => setAppointmentDates([]);

  const progress = Math.min(appointmentDates.length / minRequired, 1) * 100;
  const isFulfilled =
    appointmentDates.length >= minRequired &&
    appointmentDates.length <= maxAllowed &&
    !hasExistingConflicts;
  const isMaxReached = appointmentDates.length >= maxAllowed;

  const selectedTimeForModal = useMemo(() => {
    if (!selectedDateForTime) return null;
    const iso = getSelectedForDate(selectedDateForTime);
    if (!iso) return null;
    return prettyTime(new Date(iso));
  }, [selectedDateForTime, getSelectedForDate, prettyTime]);

  return (
    <div className="space-y-3">
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className={`w-4 h-4 ${error || hasExistingConflicts ? "text-destructive" : "text-primary"}`} />
          <span
            className={`text-sm font-semibold ${error || hasExistingConflicts ? "text-destructive" : "text-foreground"}`}
          >
            {t("bids.appointments.title", "Available Appointment Dates")}
          </span>
        </div>
        <Badge
          variant={isFulfilled ? "success" : error || hasExistingConflicts ? "destructive" : "outline"}
          className="text-xs font-semibold px-2"
        >
          {appointmentDates.length}/{maxAllowed}
        </Badge>
      </div>

      {/* ── Timeline Helper Info ── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50">
        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
        <span>
          Repair timeline: <strong>{durationValue} {durationUnit === "DAYS" ? "day(s)" : "hour(s)"}</strong>. Dates must be separated by at least <strong>{timelineDays} day(s)</strong>.
        </span>
      </div>

      {/* ── Conflict Warning Banner ── */}
      {hasExistingConflicts && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium">
          ⚠️ Some selected dates conflict with your {timelineDays}-day repair duration. Please ensure each date is at least {timelineDays} days apart.
        </div>
      )}

      {/* ── Progress Bar ── */}
      <div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isFulfilled ? "bg-emerald-500" : error || hasExistingConflicts ? "bg-destructive" : "bg-primary"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {isFulfilled
            ? t("bids.appointments.fulfilled", "✅ Minimum dates selected (Max 3)")
            : t("bids.appointments.instruction", {
                count: minRequired,
                defaultValue: `Select exactly ${minRequired} available dates when you can work`,
              })}
        </p>
      </div>

      {/* ── Selected Date Chips ── */}
      {appointmentDates.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {appointmentDates.map((iso) => (
              <span
                key={iso}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground shadow-sm"
              >
                <CalendarIcon className="w-3 h-3 text-primary-foreground/80" />
                <span>{prettyDateTime(iso)}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeDate(iso)}
                    className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
          {!disabled && appointmentDates.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
            >
              <Trash2 className="w-3 h-3" />
              {t("bids.appointments.clearAll", "Clear all")}
            </Button>
          )}
        </div>
      )}

      {/* ── Add Dates Button ── */}
      <div
        role="button"
        tabIndex={0}
        onClick={disabled ? undefined : () => setShowDateModal(true)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            setShowDateModal(true);
          }
        }}
        className={`p-3.5 rounded-xl border border-dashed transition-all flex items-center justify-between ${
          error || hasExistingConflicts
            ? "border-destructive bg-destructive/5"
            : "border-border/80 bg-card/60 hover:border-primary hover:bg-accent/40"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:-translate-y-0.5"}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              {t("bids.appointments.selectDates", "Select Dates")}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("bids.appointments.pickInstruction", {
                count: minRequired,
                defaultValue: `Pick ${minRequired} available dates (date + time)`,
              })}
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      {helperText && (
        <p className={`text-xs ${error || hasExistingConflicts ? "text-destructive" : "text-muted-foreground"}`}>
          {helperText}
        </p>
      )}

      {/* ══════════════════════════════════════════════
          DATE PICKER DIALOG
      ══════════════════════════════════════════════ */}
      <Dialog open={showDateModal} onOpenChange={setShowDateModal}>
        <DialogContent className="max-w-lg max-h-[85vh] p-0 gap-0 overflow-hidden flex flex-col sm:rounded-2xl">
          <DialogHeader className="p-5 pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-foreground">
                {t("bids.appointments.selectDates", "Select Dates")}
              </DialogTitle>
              <Badge variant="outline" className="text-xs font-semibold">
                {appointmentDates.length}/{maxAllowed} Selected
              </Badge>
            </div>
            <div className="mt-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2 text-xs text-muted-foreground">
              <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span>
                  Repair Timeline: <strong className="text-foreground">{durationValue} {durationUnit === "DAYS" ? "Day(s)" : "Hour(s)"}</strong>.
                </span>
                <p className="text-[11px] mt-0.5">
                  Appointments require a <strong>{timelineDays}-day gap</strong> between slots. You can select up to <strong>{maxAllowed} dates</strong>.
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[50vh]">
            {availableDates.map((date) => {
              const existingIso = getSelectedForDate(date);
              const isSelected = !!existingIso;
              const isToday = sameDay(date, new Date());
              const conflict = !isSelected ? getConflictForDate(date) : null;
              const isBlockedByTimeline = !!conflict;
              const isBlockedByMax = !isSelected && !isBlockedByTimeline && isMaxReached;
              const isDisabled = isBlockedByTimeline || isBlockedByMax;

              return (
                <div
                  key={date.toISOString()}
                  onClick={() => !isDisabled && handleDateClick(date)}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm cursor-pointer"
                      : isDisabled
                      ? "border-border/40 bg-muted/20 opacity-55 cursor-not-allowed select-none"
                      : "border-border/60 bg-card hover:border-primary/50 hover:bg-accent/30 text-foreground cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Day badge */}
                    <div
                      className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center font-bold shrink-0 ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : isDisabled
                          ? "bg-muted/60 text-muted-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <span className="text-[10px] leading-tight opacity-80">
                        {date.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase()}
                      </span>
                      <span className="text-base leading-tight">{date.getDate()}</span>
                    </div>

                    <div>
                      <div className="text-sm font-semibold flex items-center gap-1.5">
                        <span>
                          {date.toLocaleDateString(currentLang, {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {isToday && (
                          <Badge variant="warning" className="h-4 px-1.5 text-[10px]">
                            {t("common.today", "Today")}
                          </Badge>
                        )}
                      </div>

                      {/* Status / Subtext */}
                      {isSelected && existingIso ? (
                        <div className="flex items-center gap-1 text-xs mt-0.5 text-white/90">
                          <Clock className="w-3 h-3" />
                          <span>
                            {prettyTime(new Date(existingIso))} — {t("bids.appointments.clickToChange", "click to remove or change")}
                          </span>
                        </div>
                      ) : isBlockedByTimeline && conflict ? (
                        <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
                          Within {timelineDays}-day repair window of {prettyDate(conflict.conflictingDate)}
                        </div>
                      ) : isBlockedByMax ? (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Maximum {maxAllowed} dates already chosen
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isBlockedByTimeline && (
                      <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30">
                        {timelineDays}d gap required
                      </Badge>
                    )}
                    {isBlockedByMax && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground bg-muted/40 border-border/50">
                        Max {maxAllowed} reached
                      </Badge>
                    )}
                    <div
                      className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-white/60 bg-white/30 text-white"
                          : isDisabled
                          ? "border-border/40 text-muted-foreground/40 bg-muted/20"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="p-4 border-t border-border/60 bg-muted/20">
            <Button
              className="w-full font-bold"
              onClick={() => setShowDateModal(false)}
              disabled={!isFulfilled}
            >
              {hasExistingConflicts
                ? t("bids.appointments.resolveConflicts", "Resolve Date Conflicts")
                : appointmentDates.length < minRequired
                ? t("bids.appointments.selectMore", {
                    count: minRequired - appointmentDates.length,
                    defaultValue: `Select ${minRequired - appointmentDates.length} more date(s)`,
                  })
                : appointmentDates.length > maxAllowed
                ? t("bids.appointments.tooMany", {
                    count: appointmentDates.length - maxAllowed,
                    defaultValue: `Remove ${appointmentDates.length - maxAllowed} date(s) (Max ${maxAllowed})`,
                  })
                : t("bids.appointments.confirmDates", {
                    count: appointmentDates.length,
                    defaultValue: `Confirm ${appointmentDates.length} Dates`,
                  })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════
          TIME PICKER DIALOG
      ══════════════════════════════════════════════ */}
      <Dialog
        open={showTimeModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowTimeModal(false);
            setSelectedDateForTime(null);
          }
        }}
      >
        <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden sm:rounded-2xl">
          <DialogHeader className="p-5 pb-3 border-b border-border/60">
            <DialogTitle className="text-lg font-bold text-foreground">
              {t("bids.appointments.selectTime", "Select Time")}
            </DialogTitle>
            {selectedDateForTime && (
              <p className="text-xs text-muted-foreground">
                {selectedDateForTime.toLocaleDateString(currentLang, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
                {selectedTimeForModal ? ` • ${selectedTimeForModal}` : ""}
              </p>
            )}
          </DialogHeader>

          <div className="p-4 max-h-[50vh] overflow-y-auto">
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isActive = selectedTimeForModal === slot.label;
                return (
                  <button
                    key={slot.label}
                    type="button"
                    onClick={() => handleTimeSelect(slot.hour, slot.minute)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-sm scale-[1.02]"
                        : "border-border/60 bg-card hover:border-primary/50 hover:bg-accent/40 text-foreground"
                    }`}
                  >
                    <Clock className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-primary"}`} />
                    <span className="text-xs font-semibold">{slot.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-border/60 bg-muted/20">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowTimeModal(false);
                setSelectedDateForTime(null);
              }}
            >
              {t("common.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
