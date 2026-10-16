import React, { useState, useMemo } from "react";
import {
  Eye,
  MapPin,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// TYPES
import { type Job } from "../../store/slices/jobsSlice";

// UI
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

interface JobTableProps {
  jobs: Job[];
  loading: boolean;
  onView: (id: number) => void;
}

type Order = "asc" | "desc";

function descendingComparator(a: Job, b: Job, orderBy: keyof Job) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aValue = (a as any)[orderBy] ?? "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bValue = (b as any)[orderBy] ?? "";

  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;
  return 0;
}

function getComparator(order: Order, orderBy: keyof Job): (a: Job, b: Job) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export const JobTable = ({ jobs, loading, onView }: JobTableProps) => {
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Job>("deadline");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { t } = useTranslation();

  const handleRequestSort = (property: keyof Job) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedRows = useMemo(
    () => [...jobs].sort(getComparator(order, orderBy)),
    [jobs, order, orderBy]
  );

  const visibleRows = useMemo(
    () => sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedRows, page, rowsPerPage]
  );

  const totalPages = Math.ceil(jobs.length / rowsPerPage) || 1;

  const renderSortIcon = (property: keyof Job) => {
    if (orderBy !== property) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 ml-1.5 inline" />;
    }
    return order === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary ml-1.5 inline" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary ml-1.5 inline" />
    );
  };

  return (
    <Card className="w-full mb-4 rounded-xl border border-border/80 shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/60 bg-muted/30 hover:bg-muted/30">
              <TableHead
                className="font-semibold text-xs text-foreground cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleRequestSort("carModel")}
              >
                <div className="flex items-center">
                  <span>{t("jobs.table.vehicle")}</span>
                  {renderSortIcon("carModel")}
                </div>
              </TableHead>

              <TableHead className="font-semibold text-xs text-foreground">
                {t("jobs.table.damageType")}
              </TableHead>

              <TableHead className="font-semibold text-xs text-foreground">
                {t("jobs.table.location")}
              </TableHead>

              <TableHead
                className="font-semibold text-xs text-foreground cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleRequestSort("maxPrice")}
              >
                <div className="flex items-center">
                  <span>{t("jobs.table.budget")}</span>
                  {renderSortIcon("maxPrice")}
                </div>
              </TableHead>

              <TableHead
                className="font-semibold text-xs text-foreground cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleRequestSort("deadline")}
              >
                <div className="flex items-center">
                  <span>{t("jobs.table.deadline")}</span>
                  {renderSortIcon("deadline")}
                </div>
              </TableHead>

              <TableHead className="font-semibold text-xs text-foreground text-right">
                {t("jobs.table.action")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center text-muted-foreground">
                  <p className="text-sm font-medium">{t("jobs.table.noJobs")}</p>
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((job) => (
                <TableRow key={job.id} className="transition-colors hover:bg-muted/40">
                  <TableCell>
                    <div className="font-bold text-sm text-foreground">{job.carModel}</div>
                    <div className="text-xs text-muted-foreground">{job.year}</div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-primary/30 text-primary bg-primary/5"
                    >
                      {job.damageType}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-foreground">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-primary mt-0.5">
                      {job.distance ? `${job.distance} away` : "In range"} · Max{" "}
                      {job.biddingRadiusKm || 25}km
                    </div>
                  </TableCell>

                  <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                    €{job.maxPrice}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(job.id)}
                      className="h-8 w-8 text-primary hover:bg-primary/10"
                      title={t("jobs.table.viewDetails")}
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

      {/* Pagination Footer */}
      {!loading && jobs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              className="h-7 rounded border border-border bg-background px-2 py-0 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {[5, 10, 25].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span>
              {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, jobs.length)} of{" "}
              {jobs.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
