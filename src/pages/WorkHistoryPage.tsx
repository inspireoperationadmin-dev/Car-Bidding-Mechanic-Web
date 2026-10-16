import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  Car,
  Search,
  Eye,
  RefreshCw,
  TrendingUp,
  LayoutGrid,
  List,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Phone,
  User,
  Wrench,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchBidsAsync,
  selectAllBids,
  selectBidLoading,
  type Bid,
  BidStatus,
} from "../store/slices/bidSlice";
import { jobsApi, type JobRequest } from "../api/jobsApi";
import { BidDetailModal } from "../components/bids/BidDetailModal";

import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";

export const WorkHistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const allBids = useAppSelector(selectAllBids);
  const loading = useAppSelector(selectBidLoading);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cache for loaded job details (car name, customer, etc.)
  const [jobsData, setJobsData] = useState<Record<number, JobRequest>>({});

  const loadData = useCallback(() => {
    dispatch(fetchBidsAsync({}));
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter only won / assigned works (SELECTED)
  const wonBids = useMemo(() => {
    return allBids.filter((b) => b.status === BidStatus.SELECTED);
  }, [allBids]);

  // Pre-fetch job metadata for each won bid
  useEffect(() => {
    const fetchJobDetails = async () => {
      for (const bid of wonBids) {
        if (!jobsData[bid.requestId]) {
          try {
            const res = await jobsApi.getJobDetail(bid.requestId);
            if (res.data?.data) {
              setJobsData((prev) => ({ ...prev, [bid.requestId]: res.data.data }));
            }
          } catch {
            // Ignore background metadata load error
          }
        }
      }
    };

    if (wonBids.length > 0) {
      fetchJobDetails();
    }
  }, [wonBids, jobsData]);

  // Metrics calculation
  const stats = useMemo(() => {
    const totalWon = wonBids.length;
    const totalRevenue = wonBids.reduce((acc, b) => acc + (b.price || 0), 0);
    const avgDays =
      totalWon > 0
        ? (wonBids.reduce((acc, b) => acc + (b.durationDays || 1), 0) / totalWon).toFixed(1)
        : "0";
    return {
      totalWon,
      totalRevenue,
      avgDays,
    };
  }, [wonBids]);

  // Filtered list
  const filteredBids = useMemo(() => {
    return wonBids.filter((bid) => {
      const job = jobsData[bid.requestId];
      const searchLower = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !searchLower ||
        String(bid.requestId).includes(searchLower) ||
        (bid.notes && bid.notes.toLowerCase().includes(searchLower)) ||
        (job?.carBrand && job.carBrand.toLowerCase().includes(searchLower)) ||
        (job?.carModel && job.carModel.toLowerCase().includes(searchLower)) ||
        (job?.licensePlate && job.licensePlate.toLowerCase().includes(searchLower));

      const isJobCompleted = job?.status === "COMPLETED";
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "COMPLETED" && isJobCompleted) ||
        (statusFilter === "IN_PROGRESS" && !isJobCompleted);

      return matchesSearch && matchesStatus;
    });
  }, [wonBids, jobsData, searchQuery, statusFilter]);

  const handleOpenDetail = (bid: Bid) => {
    setSelectedBid(bid);
    setIsModalOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. KPI Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Won Jobs */}
        <Card className="bg-card/70 border-border/80 shadow-xs backdrop-blur-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("workHistory.kpiTotalWon", "Total Works Awarded")}
              </p>
              <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                {stats.totalWon}
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Customer accepted estimates</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Briefcase className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="bg-card/70 border-border/80 shadow-xs backdrop-blur-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("workHistory.kpiRevenue", "Total Agreed Payout")}
              </p>
              <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                €{stats.totalRevenue.toLocaleString()}
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Combined repair contract value</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Avg. Turnaround */}
        <Card className="bg-card/70 border-border/80 shadow-xs backdrop-blur-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("workHistory.kpiAvgTurnaround", "Avg. Estimated Duration")}
              </p>
              <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                {stats.avgDays}{" "}
                <span className="text-sm font-medium text-muted-foreground">Days</span>
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Standard repair completion time</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Wrench className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Sub-Toolbar: Search, Status Tabs, Refresh & View Mode */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("workHistory.searchPlaceholder", "Search car, job ID, or notes...")}
            className="pl-9.5 h-9.5 rounded-xl border-border/80 bg-card text-xs font-medium"
          />
        </div>

        {/* Right: View toggle & Refresh */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Status Tabs */}
          <div className="flex items-center bg-card p-1 rounded-xl border border-border/80 shadow-xs text-xs">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({wonBids.length})
            </button>
            <button
              onClick={() => setStatusFilter("IN_PROGRESS")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === "IN_PROGRESS"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter("COMPLETED")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === "COMPLETED"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Cards / Table toggle */}
          <div className="hidden sm:flex items-center bg-card p-1 rounded-xl border border-border/80 shadow-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-medium transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-medium transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-9 px-3 rounded-xl border-border/80 bg-card hover:bg-accent text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* 3. Works List: Grid Cards or Table */}
      {loading && wonBids.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 space-y-4">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      ) : filteredBids.length === 0 ? (
        /* Empty State */
        <Card className="bg-card/70 border-border/80 backdrop-blur-md p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-inner">
              <Briefcase className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">
                {wonBids.length === 0
                  ? t("workHistory.noWorks", "No Work History Yet")
                  : "No Matching Work Orders Found"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {wonBids.length === 0
                  ? t(
                      "workHistory.noWorksDesc",
                      "When customers accept your bids, their repair orders, appointment schedules, and service milestones will be recorded here."
                    )
                  : "Try clearing your search query or selecting a different status filter."}
              </p>
            </div>
            {wonBids.length === 0 && (
              <Button
                onClick={() => navigate("/jobs")}
                className="gap-2 font-semibold shadow-md bg-primary hover:bg-primary/90 mt-2 cursor-pointer"
              >
                <span>{t("workHistory.browseJobs", "Browse Available Jobs")}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      ) : viewMode === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBids.map((bid) => {
            const job = jobsData[bid.requestId];
            const isCompleted = job?.status === "COMPLETED";
            const vehicleTitle = job
              ? `${job.carBrand} ${job.carModel} (${job.year || ""})`
              : `Request #${bid.requestId}`;

            return (
              <Card
                key={bid.id}
                className="overflow-hidden border-border/80 bg-card/70 backdrop-blur-sm hover:border-border hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header with Car Brand and Status */}
                  <div className="p-5 border-b border-border/50 bg-muted/10 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Car className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-foreground truncate">
                          {vehicleTitle}
                        </h4>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {job?.licensePlate || `ID: #${bid.requestId}`}
                        </p>
                      </div>
                    </div>

                    <Badge
                      className={
                        isCompleted
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold"
                          : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[10px] font-semibold"
                      }
                    >
                      {isCompleted ? "Completed" : "Won & Assigned"}
                    </Badge>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    {/* Financial & Duration highlights */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-muted/30 border border-border/60">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                          Agreed Payout
                        </span>
                        <span className="text-base font-extrabold text-foreground">
                          €{bid.price}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                          Est. Duration
                        </span>
                        <span className="text-sm font-bold text-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>
                            {bid.durationDays}d {bid.durationHours || 0}h
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Customer & Location information */}
                    {job?.customer && (
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-primary" />
                          <span className="font-semibold text-foreground">
                            {job.customer.firstName} {job.customer.lastName}
                          </span>
                        </div>
                        {job.customer.phoneNo && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-primary" />
                            <span>{job.customer.phoneNo}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Damage description snippet */}
                    {job?.damageDescription && (
                      <p className="text-xs text-muted-foreground line-clamp-2 italic">
                        "{job.damageDescription}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 border-t border-border/50 bg-muted/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    Awarded: {formatDate(bid.createdAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDetail(bid)}
                      className="h-8 px-2.5 text-xs gap-1.5 rounded-lg border-border hover:bg-accent font-medium cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/jobs/${bid.requestId}`)}
                      className="h-8 px-3 text-xs gap-1.5 rounded-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Track Progress</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card className="bg-card/70 border-border/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Vehicle / Request</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Agreed Payout</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Awarded Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredBids.map((bid) => {
                  const job = jobsData[bid.requestId];
                  const isCompleted = job?.status === "COMPLETED";

                  return (
                    <tr key={bid.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-foreground">
                        <div>
                          {job?.carBrand
                            ? `${job.carBrand} ${job.carModel}`
                            : `Request #${bid.requestId}`}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {job?.licensePlate || `ID: #${bid.requestId}`}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {job?.customer ? `${job.customer.firstName} ${job.customer.lastName}` : "-"}
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">€{bid.price}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {bid.durationDays}d {bid.durationHours || 0}h
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {formatDate(bid.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            isCompleted
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px]"
                              : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[10px]"
                          }
                        >
                          {isCompleted ? "Completed" : "Won & Assigned"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDetail(bid)}
                            className="h-7 px-2 text-xs text-primary hover:bg-primary/10 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            <span>Details</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/jobs/${bid.requestId}`)}
                            className="h-7 px-2.5 text-xs gap-1 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Update Stages</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 4. Full Job Details Modal */}
      {selectedBid && (
        <BidDetailModal
          open={isModalOpen}
          bid={selectedBid}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBid(null);
          }}
          onBidUpdated={loadData}
        />
      )}
    </div>
  );
};

export default WorkHistoryPage;
