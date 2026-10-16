import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Lock,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// Redux
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectUser } from "../store/slices/authSlice";
import {
  fetchAvailableJobs,
  setPage,
  setFilters,
  resetFilters,
  selectAllJobs,
  selectJobsLoading,
  selectJobsError,
  selectJobsPagination,
  selectJobFilters,
} from "../store/slices/jobsSlice";

import { JobTable } from "../components/jobs/JobTable";
import { JobCardGrid } from "../components/jobs/JobCardGrid";
import { JobFilters, type FilterState } from "../components/jobs/JobFilters";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Card, CardContent } from "../components/ui/card";

export const AvailableJobs = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const jobs = useAppSelector(selectAllJobs);
  const loading = useAppSelector(selectJobsLoading);
  const error = useAppSelector(selectJobsError);
  const { page, limit, total } = useAppSelector(selectJobsPagination);
  const filters = useAppSelector(selectJobFilters);

  // Verification gating
  const isApproved = user?.verificationStatus === "APPROVED";
  const isPending = user?.verificationStatus === "PENDING";
  const isRestricted = !isApproved;

  useEffect(() => {
    if (!isApproved) return;
    dispatch(
      fetchAvailableJobs({
        page,
        limit,
        search: filters.search,
        location: filters.location,
        locationRadius: filters.locationRadius,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        deadline: filters.deadline,
      })
    );
  }, [dispatch, page, limit, filters, isApproved]);

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ search: e.target.value }));
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    dispatch(
      setFilters({
        location: newFilters.location,
        locationRadius: newFilters.locationRadius,
        minPrice: newFilters.minPrice,
        maxPrice: newFilters.maxPrice,
        deadline: newFilters.deadline,
      })
    );
    setShowMobileFilters(false);
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Controls: Summary & View Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/40">
        <div className="text-xs text-muted-foreground font-medium">
          {t("jobs.foundCount", "Found")}{" "}
          <span className="font-bold text-foreground">{total}</span>{" "}
          {t("jobs.vehiclesInArea", "vehicles matching your criteria")}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-border/60 bg-card p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{t("common.cards", "Cards")}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                viewMode === "table"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>{t("common.table", "Table")}</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder={t("jobs.searchPlaceholder", "Search brand, model, city...")}
              value={filters.search}
              onChange={handleSearchChange}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden gap-1.5 h-9"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{t("jobs.filters", "Filters")}</span>
          </Button>
        </div>
      </div>

      {error && !isRestricted && (
        <Alert variant="destructive">
          <ShieldAlert className="w-4 h-4" />
          <AlertTitle>{t("common.error", "Error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Filters (3 cols on desktop) */}
        <div
          className={`lg:col-span-3 space-y-4 ${showMobileFilters ? "block" : "hidden lg:block"}`}
        >
          <div className="sticky top-24">
            <JobFilters
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
              initialFilters={filters}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Jobs Feed (9 cols) */}
        <div className="lg:col-span-9 space-y-4">
          <div className="relative min-h-[500px]">
            {/* Main Cards / Table Feed */}
            <div
              className={`transition-all duration-300 ${
                isRestricted ? "blur-md pointer-events-none select-none opacity-40" : ""
              }`}
            >
              {viewMode === "grid" ? (
                <JobCardGrid
                  jobs={jobs}
                  loading={loading}
                  onView={(id) => navigate(`/jobs/${id}`)}
                />
              ) : (
                <JobTable jobs={jobs} loading={loading} onView={(id) => navigate(`/jobs/${id}`)} />
              )}
            </div>

            {/* Restricted Overlay for Unapproved Mechanics */}
            {isRestricted && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xs bg-background/75 rounded-2xl border border-border/60">
                <Card className="max-w-md w-full border-border/80 shadow-lg">
                  <CardContent className="p-6 text-center space-y-4">
                    {isPending ? (
                      <>
                        <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                          <Clock className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {t("jobs.pendingApproval", "Verification Under Review")}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                            {t(
                              "jobs.pendingMessage",
                              "Your garage certification documents are being reviewed by administrators. You will be able to submit bids once approved."
                            )}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-xs"
                        >
                          {t("verification.status.pending", "Pending Approval")}
                        </Badge>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                          <Lock className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {t("jobs.verificationRequired", "Verification Required")}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                            {t(
                              "jobs.verificationMessage",
                              "Please submit your business registration and garage insurance to unlock active job opportunities."
                            )}
                          </p>
                        </div>
                        <Button
                          onClick={() => navigate("/verification")}
                          className="w-full gap-2 shadow-sm font-semibold"
                        >
                          <Lock className="w-4 h-4" />
                          <span>{t("jobs.completeVerification", "Complete Verification")}</span>
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && !isRestricted && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t("common.prev", "Previous")}</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && p - arr[idx - 1] > 1 && (
                        <span className="px-2 text-xs text-muted-foreground">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                          p === page
                            ? "bg-primary text-primary-foreground shadow-xs font-bold"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="gap-1 text-xs"
              >
                <span>{t("common.next", "Next")}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableJobs;
