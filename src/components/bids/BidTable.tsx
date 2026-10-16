import React, { useState, useMemo } from "react";
import {
  Eye,
  Edit2,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// TYPES
import { type Bid, BidStatus } from "../../store/slices/bidSlice";

// UI
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

interface BidTableProps {
  bids: Bid[];
  loading: boolean;
  onView: (requestId: number) => void;
  onEdit?: (bid: Bid) => void;
}

type Order = "asc" | "desc";

function descendingComparator(a: Bid, b: Bid, orderBy: keyof Bid) {
  const aValue = a[orderBy] ?? "";
  const bValue = b[orderBy] ?? "";
  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;
  return 0;
}

function getComparator(order: Order, orderBy: keyof Bid): (a: Bid, b: Bid) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export const BidTable = ({ bids, loading, onView, onEdit }: BidTableProps) => {
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof Bid>("updatedAt");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { t } = useTranslation();

  const handleRequestSort = (property: keyof Bid) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return (
      new Date(dateString).toLocaleDateString() +
      " " +
      new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case BidStatus.SELECTED:
        return <Badge variant="success">{t(`bids.status.${status.toLowerCase()}`, status)}</Badge>;
      case BidStatus.REJECTED:
        return (
          <Badge variant="destructive">{t(`bids.status.${status.toLowerCase()}`, status)}</Badge>
        );
      case BidStatus.WITHDRAWN:
        return <Badge variant="warning">{t(`bids.status.${status.toLowerCase()}`, status)}</Badge>;
      case BidStatus.ACTIVE:
        return <Badge variant="info">{t(`bids.status.${status.toLowerCase()}`, status)}</Badge>;
      default:
        return (
          <Badge variant="secondary">{t(`bids.status.${status.toLowerCase()}`, status)}</Badge>
        );
    }
  };

  const sortedRows = useMemo(
    () => [...bids].sort(getComparator(order, orderBy)),
    [bids, order, orderBy]
  );

  const visibleRows = useMemo(
    () => sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedRows, page, rowsPerPage]
  );

  const totalPages = Math.ceil(bids.length / rowsPerPage) || 1;

  const renderSortIcon = (property: keyof Bid) => {
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
              <TableHead className="font-semibold text-xs text-foreground">
                {t("bids.table.jobInfo")}
              </TableHead>

              <TableHead
                className="font-semibold text-xs text-foreground cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleRequestSort("price")}
              >
                <div className="flex items-center">
                  <span>{t("bids.table.price")}</span>
                  {renderSortIcon("price")}
                </div>
              </TableHead>

              <TableHead className="font-semibold text-xs text-foreground">
                {t("bids.table.duration")}
              </TableHead>

              <TableHead
                className="font-semibold text-xs text-foreground cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleRequestSort("status")}
              >
                <div className="flex items-center">
                  <span>{t("bids.table.status")}</span>
                  {renderSortIcon("status")}
                </div>
              </TableHead>

              <TableHead
                className="font-semibold text-xs text-foreground cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleRequestSort("updatedAt")}
              >
                <div className="flex items-center">
                  <span>{t("bids.table.lastUpdated")}</span>
                  {renderSortIcon("updatedAt")}
                </div>
              </TableHead>

              <TableHead className="font-semibold text-xs text-foreground text-right">
                {t("bids.table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody
            role={loading ? "progressbar" : undefined}
            aria-label={loading ? "Loading bids" : undefined}
          >
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-16 ml-auto rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : bids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center text-muted-foreground">
                  <p className="text-sm font-medium">{t("bids.table.noBids", "No bids found")}</p>
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((bid) => (
                <TableRow key={bid.id} className="transition-colors hover:bg-muted/40">
                  <TableCell className="font-bold text-primary">
                    {t("bids.table.requestPrefix", "Request #")}
                    {bid.requestId}
                  </TableCell>
                  <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                    €{bid.price}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {bid.durationDays > 0 ? `${bid.durationDays}d ` : ""}
                    {bid.durationHours > 0 ? `${bid.durationHours}h` : ""}
                  </TableCell>
                  <TableCell>{getStatusBadge(bid.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(bid.updatedAt || bid.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(bid.requestId)}
                        className="h-8 w-8 text-primary hover:bg-primary/10"
                        title={t("bids.table.viewJob")}
                        aria-label={`View bid for request ${bid.requestId}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {onEdit && bid.status === BidStatus.ACTIVE && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(bid)}
                          className="h-8 w-8 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                          title={t("bids.table.editBid")}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {!loading && bids.length > 0 && (
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
              {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, bids.length)} of{" "}
              {bids.length}
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
