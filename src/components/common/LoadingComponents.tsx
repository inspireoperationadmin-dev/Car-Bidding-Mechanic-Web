import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "../ui/skeleton";
import { TableRow, TableCell } from "../ui/table";

// ----------------------------------------------------------------------
// 1. FULL PAGE LOADER
// ----------------------------------------------------------------------
export const PageLoading = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background z-50">
      <Loader2 className="w-12 h-12 animate-spin text-primary mb-3" />
      <p className="text-base font-medium text-muted-foreground opacity-90">
        {t("common.loading")}
      </p>
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. TABLE SKELETON
// ----------------------------------------------------------------------
interface TableSkeletonProps {
  rows?: number;
}

export const TableSkeleton = ({ rows = 5 }: TableSkeletonProps) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRow key={i} className="h-16">
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-20 rounded-full" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-28" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-16" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-8 w-8 ml-auto rounded-lg" />
        </TableCell>
      </TableRow>
    ))}
  </>
);

// ----------------------------------------------------------------------
// 3. CARD SKELETON
// ----------------------------------------------------------------------
export const JobCardSkeleton = () => (
  <div className="p-4 rounded-xl border border-border/80 bg-card/60 shadow-sm space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
    </div>
    <Skeleton className="h-20 w-full rounded-lg" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-7 w-1/4 rounded-md" />
      <Skeleton className="h-7 w-1/4 rounded-md" />
    </div>
  </div>
);

// ----------------------------------------------------------------------
// 4. GRID SKELETON
// ----------------------------------------------------------------------
export const JobsGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <JobCardSkeleton key={i} />
    ))}
  </div>
);
