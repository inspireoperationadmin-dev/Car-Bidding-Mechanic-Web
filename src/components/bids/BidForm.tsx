import React, { useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { AppointmentDatePicker } from "./AppointmentDatePicker";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

// --- ZOD SCHEMA ---
const bidSchema = z.object({
  amount: z.number().min(1, "Amount is required"),
  durationValue: z.number().min(1, "Duration is required"),
  durationUnit: z.enum(["HOURS", "DAYS"]),
  notes: z.string().min(10, "Notes must be at least 10 characters long"),
});

export type BidFormData = z.infer<typeof bidSchema> & {
  appointmentDates?: string[];
};

interface BidFormProps {
  adminMaxPrice: number;
  onSubmit: (data: BidFormData) => void;
  loading?: boolean;
  minAppointmentDates?: number;
  initialValues?: {
    amount: number;
    durationValue: number;
    durationUnit: "HOURS" | "DAYS";
    notes: string;
    appointmentDates?: string[];
  };
}

export const BidForm: React.FC<BidFormProps> = ({
  adminMaxPrice,
  onSubmit,
  loading,
  minAppointmentDates = 0,
  initialValues,
}) => {
  const { t } = useTranslation();

  const [appointmentDates, setAppointmentDates] = useState<string[]>(
    initialValues?.appointmentDates ?? []
  );
  const [appointmentError, setAppointmentError] = useState(false);
  const [appointmentErrorMessage, setAppointmentErrorMessage] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof bidSchema>>({
    resolver: zodResolver(bidSchema),
    defaultValues: initialValues
      ? {
          amount: initialValues.amount,
          durationValue: initialValues.durationValue,
          durationUnit: initialValues.durationUnit,
          notes: initialValues.notes,
        }
      : {
          amount: 0,
          durationValue: 1,
          durationUnit: "DAYS",
          notes: "",
        },
  });

  const currentPrice = useWatch({
    control,
    name: "amount",
    defaultValue: initialValues?.amount || 0,
  });

  const durationValue = useWatch({
    control,
    name: "durationValue",
    defaultValue: initialValues?.durationValue ?? 1,
  });

  const durationUnit = useWatch({
    control,
    name: "durationUnit",
    defaultValue: initialValues?.durationUnit ?? "DAYS",
  });

  const timelineDays = useMemo(() => {
    if (durationUnit === "HOURS") {
      return Math.max(1, Math.ceil((Number(durationValue) || 1) / 24));
    }
    return Math.max(1, Math.floor(Number(durationValue) || 1));
  }, [durationValue, durationUnit]);

  // Check if any selected dates conflict with the repair timeline
  const hasAppointmentConflicts = useMemo(() => {
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

  const handleFormSubmit = (data: z.infer<typeof bidSchema>) => {
    if (minAppointmentDates > 0 && appointmentDates.length < minAppointmentDates) {
      setAppointmentErrorMessage(
        t("bids.form.errors.appointmentMin", `Please select ${minAppointmentDates} available appointment dates`)
      );
      setAppointmentError(true);
      return;
    }
    if (appointmentDates.length > 3) {
      setAppointmentErrorMessage(
        t("bids.form.errors.appointmentMax", "Please select a maximum of 3 appointment dates")
      );
      setAppointmentError(true);
      return;
    }
    if (hasAppointmentConflicts) {
      setAppointmentErrorMessage(
        t(
          "bids.form.errors.appointmentConflict",
          `Appointment dates must be at least ${timelineDays} day(s) apart based on your repair duration`
        )
      );
      setAppointmentError(true);
      return;
    }
    setAppointmentError(false);
    setAppointmentErrorMessage(undefined);
    onSubmit({ ...data, appointmentDates });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4 mt-2">
      {/* Warning if Price > Max Price */}
      {currentPrice > adminMaxPrice && (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 py-2.5 px-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <AlertDescription className="text-xs">
            {t(
              "bids.form.warningBudget",
              `Warning: €${currentPrice} is higher than the client's budget of €${adminMaxPrice}`,
              { bid: currentPrice, max: adminMaxPrice }
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Bid Amount */}
      <div className="space-y-1.5">
        <Label htmlFor="amount" className="text-xs font-medium text-foreground">
          {t("bids.form.amountLabel", "Bid Amount (€) *")}
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
            €
          </span>
          <Input
            id="amount"
            type="number"
            step="1"
            min="1"
            placeholder="0"
            className="pl-8"
            {...register("amount", { valueAsNumber: true })}
          />
        </div>
        {errors.amount && (
          <p className="text-[11px] text-destructive font-medium">
            {errors.amount.message || t("bids.form.errors.amount", "Amount is required")}
          </p>
        )}
      </div>

      {/* Estimated Duration */}
      <div className="space-y-1.5">
        <Label htmlFor="durationValue" className="text-xs font-medium text-foreground">
          {t("bids.form.durationLabel", "Estimated Repair Duration *")}
        </Label>
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-8">
            <Input
              id="durationValue"
              type="number"
              min="1"
              placeholder="1"
              {...register("durationValue", { valueAsNumber: true })}
            />
          </div>
          <div className="col-span-4">
            <select
              {...register("durationUnit")}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="DAYS">{t("bids.form.days", "Days")}</option>
              <option value="HOURS">{t("bids.form.hours", "Hours")}</option>
            </select>
          </div>
        </div>
        {errors.durationValue && (
          <p className="text-[11px] text-destructive font-medium">
            {errors.durationValue.message || t("bids.form.errors.duration", "Duration is required")}
          </p>
        )}
      </div>

      {/* Scope of Work / Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-xs font-medium text-foreground">
          {t("bids.form.notesLabel", "Repair Details & Scope of Work Notes *")}
        </Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder={t(
            "bids.form.notesPlaceholder",
            "Explain replacement parts, labor, warranty terms, and diagnostic approach..."
          )}
          {...register("notes")}
          className="resize-none"
        />
        {errors.notes && (
          <p className="text-[11px] text-destructive font-medium">
            {errors.notes.message ||
              t("bids.form.errors.notes", "Notes must be at least 10 characters long")}
          </p>
        )}
      </div>

      {/* Appointment Date Picker */}
      <div className="pt-2">
        <AppointmentDatePicker
          value={appointmentDates}
          onChange={(dates) => {
            setAppointmentDates(dates);
            if (dates.length >= 3) {
              setAppointmentError(false);
              setAppointmentErrorMessage(undefined);
            }
          }}
          error={appointmentError}
          helperText={appointmentErrorMessage}
          minRequired={3}
          maxAllowed={3}
          durationValue={durationValue}
          durationUnit={durationUnit}
        />
      </div>

      {/* Submit / Update Button */}
      <Button type="submit" disabled={loading} className="w-full py-2 shadow-xs font-semibold">
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t("common.saving", "Submitting...")}</span>
          </span>
        ) : (
          <span>
            {initialValues
              ? t("bids.form.update", "Update Bid")
              : t("bids.form.submit", "Submit Bid")}
          </span>
        )}
      </Button>
    </form>
  );
};

export default BidForm;
