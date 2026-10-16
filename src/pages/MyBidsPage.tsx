import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Search,
  X,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  Award,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";

// Redux Imports
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchBidsAsync,
  selectAllBids,
  selectBidLoading,
  selectBidError,
  clearBidMessages,
  BidStatus,
  type GetBidsFilters,
  type Bid,
} from "../store/slices/bidSlice";
import { selectToken } from "../store/slices/authSlice";

// Components
import { BidTable } from "../components/bids/BidTable";
import { BidCardGrid } from "../components/bids/BidCardGrid";
import { BidDetailModal } from "../components/bids/BidDetailModal";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

// Filter State Interface
interface FilterState {
  status: string;
  requestId: string;
}

export const MyBidsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Redux State
  const bids = useAppSelector(selectAllBids);
  const loading = useAppSelector(selectBidLoading);
  const error = useAppSelector(selectBidError);
  const token = useAppSelector(selectToken);

  // Local State
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filters, setFilters] = useState<FilterState>({
    status: "ALL",
    requestId: "",
  });

  // Snackbar State
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // KPI Calculations
  const stats = useMemo(() => {
    const total = bids.length;
    const active = bids.filter((b) => b.status === BidStatus.ACTIVE).length;
    const won = bids.filter((b) => b.status === BidStatus.SELECTED).length;
    const rejected = bids.filter((b) => b.status === BidStatus.REJECTED).length;
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
    return { total, active, won, rejected, winRate };
  }, [bids]);

  // Status Tab counts
  const statusCounts = useMemo(() => {
    return {
      ALL: bids.length,
      [BidStatus.ACTIVE]: bids.filter((b) => b.status === BidStatus.ACTIVE).length,
      [BidStatus.SELECTED]: bids.filter((b) => b.status === BidStatus.SELECTED).length,
      [BidStatus.REJECTED]: bids.filter((b) => b.status === BidStatus.REJECTED).length,
      [BidStatus.WITHDRAWN]: bids.filter((b) => b.status === BidStatus.WITHDRAWN).length,
    };
  }, [bids]);

  // --- HANDLERS ---

  const handleEditBid = (bid: Bid) => {
    setSelectedBid(bid);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBid(null);
  };

  const handleUpdateSuccess = () => {
    setSnackbar({ open: true, message: t("bids.detail.updateSuccess"), severity: "success" });
    handleCloseModal();
    loadBids();
  };

  const handleUpdateError = (msg: string) => {
    setSnackbar({ open: true, message: msg, severity: "error" });
  };

  const handleViewJob = (requestId: number) => {
    navigate(`/jobs/${requestId}`);
  };

  // --- FETCH BIDS ---
  const loadBids = useCallback(() => {
    if (!token) return;

    const apiFilters: GetBidsFilters = {};

    if (filters.status !== "ALL") {
      apiFilters.status = filters.status as BidStatus;
    }

    if (filters.requestId.trim() !== "") {
      const parsedId = parseInt(filters.requestId);
      if (!isNaN(parsedId)) {
        apiFilters.requestId = parsedId;
      }
    }

    dispatch(fetchBidsAsync(apiFilters));
  }, [dispatch, token, filters]);

  useEffect(() => {
    loadBids();
  }, [loadBids]);

  const clearSearch = () => {
    setFilters({ ...filters, requestId: "" });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls: Summary & View Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground font-medium">
          Showing <span className="font-bold text-foreground">{stats.total}</span> total proposals
          submitted by your workshop
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-card p-1 rounded-lg border border-border/80 shadow-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all text-xs flex items-center gap-1.5 font-medium cursor-pointer ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-all text-xs flex items-center gap-1.5 font-medium cursor-pointer ${
                viewMode === "table"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadBids}
            disabled={loading}
            className="gap-1.5 text-xs h-8.5 rounded-lg border-border/80 bg-card hover:bg-accent cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{t("bids.refresh", "Refresh List")}</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/70 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Proposals
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                In Consideration
              </p>
              <h3 className="text-2xl font-bold text-blue-500 mt-1">{stats.active}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Won / Assigned
              </p>
              <h3 className="text-2xl font-bold text-emerald-500 mt-1">{stats.won}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Win Rate
              </p>
              <h3 className="text-2xl font-bold text-violet-500 mt-1">{stats.winRate}%</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Filter Bar */}
      <Card className="bg-card/60 backdrop-blur-md border-border/80">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { key: "ALL", label: t("bids.status.all", "All Bids") },
                { key: BidStatus.ACTIVE, label: t("bids.status.active", "Active") },
                { key: BidStatus.SELECTED, label: t("bids.status.selected", "Won") },
                { key: BidStatus.REJECTED, label: t("bids.status.rejected", "Rejected") },
                { key: BidStatus.WITHDRAWN, label: t("bids.status.withdrawn", "Withdrawn") },
              ].map((tab) => {
                const count = statusCounts[tab.key as keyof typeof statusCounts] ?? 0;
                const isSelected = filters.status === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilters({ ...filters, status: tab.key })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-background/80 text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search by Request ID */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder={t("bids.searchPlaceholder", "Search by Request ID...")}
                value={filters.requestId}
                onChange={(e) => setFilters({ ...filters, requestId: e.target.value })}
                className="pl-9 pr-8 h-9 text-xs"
              />
              {filters.requestId && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearBidMessages())}>
          {error}
        </Alert>
      )}

      {/* Main View Display */}
      {viewMode === "grid" ? (
        <BidCardGrid bids={bids} loading={loading} onView={handleViewJob} onEdit={handleEditBid} />
      ) : (
        <BidTable bids={bids} loading={loading} onView={handleViewJob} onEdit={handleEditBid} />
      )}

      {/* Bid Detail / Edit Modal */}
      <BidDetailModal
        key={selectedBid ? selectedBid.id : "closed"}
        open={isModalOpen}
        onClose={handleCloseModal}
        bid={selectedBid}
        onUpdateSuccess={handleUpdateSuccess}
        onUpdateError={handleUpdateError}
      />

      {/* Global Toast Notification */}
      {snackbar.open && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-card border border-border shadow-lg text-foreground text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{snackbar.message}</span>
            <button
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBidsPage;
