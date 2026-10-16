import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  Search,
  Eye,
  CheckCircle2,
  Wrench,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// Redux
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchAvailableJobs,
  selectAllJobs,
  selectJobsLoading,
  selectJobsError,
} from "../store/slices/jobsSlice";

// UI
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/table";

const ITEMS_PER_PAGE = 10;

export const JobHistory: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const jobs = useAppSelector(selectAllJobs);
  const loading = useAppSelector(selectJobsLoading);
  const error = useAppSelector(selectJobsError);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAvailableJobs());
  }, [dispatch]);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.carModel.toLowerCase().includes(lowerTerm) ||
          job.licensePlate?.toLowerCase().includes(lowerTerm) ||
          job.id.toString().includes(lowerTerm)
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter((job) => job.status === statusFilter);
    }
    return result;
  }, [jobs, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE) || 1;
  const paginatedJobs = useMemo(
    () => filteredJobs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [filteredJobs, page]
  );

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge variant="success" className="gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t(`jobs.history.${status.toLowerCase()}`, status)}</span>
          </Badge>
        );
      case "ASSIGNED":
        return (
          <Badge variant="info" className="gap-1 font-medium">
            <Wrench className="w-3.5 h-3.5" />
            <span>{t(`jobs.history.${status.toLowerCase()}`, status)}</span>
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" className="gap-1 font-medium">
            <XCircle className="w-3.5 h-3.5" />
            <span>{t(`jobs.history.${status.toLowerCase()}`, status)}</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{t(`jobs.history.${status.toLowerCase()}`, status)}</span>
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-background">
      {/* Page Header */}
      <div className="px-4 md:px-8 py-6 border-b border-border/60 bg-card/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {t("jobs.history.title")}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Review and track all your past and active job commitments
            </p>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Filters Card */}
        <Card className="border-border/80 shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-8 relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  placeholder={t("jobs.history.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 h-10 text-sm"
                />
              </div>
              <div className="md:col-span-4">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="ALL">{t("jobs.history.allStatuses")}</option>
                  <option value="ASSIGNED">{t("jobs.history.assigned")}</option>
                  <option value="COMPLETED">{t("jobs.history.completed")}</option>
                  <option value="CANCELLED">{t("jobs.history.cancelled")}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm font-medium">{t("common.loading")}</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Card className="border-border/80 shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/60 bg-muted/30">
                    <TableHead className="font-semibold text-xs text-foreground w-[100px]">
                      {t("jobs.history.table.id")}
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground">
                      {t("jobs.history.table.car")}
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground">
                      {t("jobs.history.table.status")}
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground">
                      {t("jobs.history.table.date")}
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground text-center w-[100px]">
                      {t("jobs.history.table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedJobs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-32 text-center text-muted-foreground text-sm"
                      >
                        No history records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedJobs.map((job) => (
                      <TableRow key={job.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="font-bold text-primary">#{job.id}</TableCell>
                        <TableCell>
                          <div className="font-semibold text-sm text-foreground">
                            {job.carModel}
                          </div>
                          {job.licensePlate && (
                            <div className="text-xs text-muted-foreground">{job.licensePlate}</div>
                          )}
                        </TableCell>
                        <TableCell>{renderStatusBadge(job.status)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(job.deadline).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            title={t("jobs.history.table.actions")}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {filteredJobs.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground">
                <span>
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(page * ITEMS_PER_PAGE, filteredJobs.length)} of {filteredJobs.length}{" "}
                  records
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="px-2 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
