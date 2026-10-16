import { useState } from "react";
import { Filter, RotateCcw, Check, MapPin, Calendar, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";

// UI
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

// --- TYPES ---
export interface FilterState {
  location: string;
  locationRadius: number;
  minPrice: number;
  maxPrice: number;
  deadline: string; // ISO Date string (YYYY-MM-DD)
}

interface JobFiltersProps {
  onApply: (filters: FilterState) => void;
  onReset: () => void;
  initialFilters?: Partial<FilterState>;
}

export const JobFilters = ({ onApply, onReset, initialFilters }: JobFiltersProps) => {
  // Local State for Filters
  const [location, setLocation] = useState<string>(initialFilters?.location || "");
  const [locationRadius, setLocationRadius] = useState<number>(
    initialFilters?.locationRadius || 50
  );
  const [minPrice, setMinPrice] = useState<number | string>(
    initialFilters?.minPrice !== undefined && initialFilters?.minPrice > 0 ? initialFilters.minPrice : ""
  );
  const [maxPrice, setMaxPrice] = useState<number | string>(
    initialFilters?.maxPrice !== undefined && initialFilters?.maxPrice < 20000 ? initialFilters.maxPrice : ""
  );
  const [deadline, setDeadline] = useState<string>(initialFilters?.deadline || "");
  const [priceError, setPriceError] = useState<string>("");
  const { t } = useTranslation();

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setMinPrice("");
      setPriceError("");
      return;
    }
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) return;
    setMinPrice(num);
    if (maxPrice !== "" && Number(maxPrice) > 0 && num > Number(maxPrice)) {
      setPriceError(t("jobs.filters.minExceedsMax", "Min price cannot exceed max price"));
    } else {
      setPriceError("");
    }
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setMaxPrice("");
      setPriceError("");
      return;
    }
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) return;
    setMaxPrice(num);
    if (minPrice !== "" && Number(minPrice) > 0 && num < Number(minPrice)) {
      setPriceError(t("jobs.filters.maxLessThanMin", "Max price cannot be less than min price"));
    } else {
      setPriceError("");
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block '-', '+', 'e', 'E' to strictly prevent negative numbers and scientific notation
    if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  const handleApply = () => {
    const min = Math.max(0, Number(minPrice) || 0);
    const max = maxPrice !== "" ? Math.max(0, Number(maxPrice) || 0) : 20000;

    if (maxPrice !== "" && max < min) {
      setPriceError(t("jobs.filters.maxLessThanMin", "Max price cannot be less than min price"));
      return;
    }

    setPriceError("");
    onApply({
      location,
      locationRadius,
      minPrice: min,
      maxPrice: max,
      deadline,
    });
  };

  const handleReset = () => {
    setLocation("");
    setLocationRadius(50);
    setMinPrice("");
    setMaxPrice("");
    setDeadline("");
    setPriceError("");
    onReset();
  };

  return (
    <Card className="sticky top-20 border-border/80 shadow-sm overflow-hidden">
      <CardHeader className="py-4 px-5 border-b border-border/60 bg-muted/20">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span>{t("jobs.filters.title")}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* 0. Location Search Filter */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            {t("jobs.filters.location", "Location")}
          </Label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              placeholder="e.g., Colombo"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* 1. Location Radius Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">{t("jobs.filters.radius")}:</span>
            <span className="font-bold text-primary">{locationRadius} km</span>
          </div>
          <input
            type="range"
            min={5}
            max={200}
            step={5}
            value={locationRadius}
            onChange={(e) => setLocationRadius(Number(e.target.value))}
            className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>5 km</span>
            <span>100 km</span>
            <span>200 km</span>
          </div>
          <p className="text-[11px] italic text-muted-foreground">
            * Works only if job coordinates are available
          </p>
        </div>

        {/* 2. Price Range Filter */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{t("jobs.filters.priceRange")}</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                min={0}
                placeholder={t("jobs.filters.min")}
                value={minPrice}
                onChange={handleMinPriceChange}
                onKeyDown={handlePriceKeyDown}
                className={`h-9 text-sm ${priceError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
            </div>
            <div>
              <Input
                type="number"
                min={0}
                placeholder={t("jobs.filters.max")}
                value={maxPrice}
                onChange={handleMaxPriceChange}
                onKeyDown={handlePriceKeyDown}
                className={`h-9 text-sm ${priceError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
            </div>
          </div>
          {priceError && (
            <p className="text-[11px] font-medium text-destructive mt-1 animate-fade-in">
              {priceError}
            </p>
          )}
        </div>

        {/* 3. Deadline Filter */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{t("jobs.filters.deadline")}</span>
          </Label>
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="h-9 text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button onClick={handleApply} className="w-full h-9 font-semibold gap-1.5">
            <Check className="w-4 h-4" />
            <span>{t("jobs.filters.apply")}</span>
          </Button>

          <Button variant="outline" onClick={handleReset} className="w-full h-9 gap-1.5">
            <RotateCcw className="w-4 h-4" />
            <span>{t("jobs.filters.reset")}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
