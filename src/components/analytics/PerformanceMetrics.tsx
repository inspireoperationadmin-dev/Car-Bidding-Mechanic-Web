import React from "react";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Skeleton } from "../ui/skeleton";

interface MetricItem {
  label: string;
  value: string | number;
  description: string;
}

interface PerformanceMetricsProps {
  metrics?: MetricItem[];
  loading?: boolean;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  metrics = [],
  loading = false,
}) => {
  const { t } = useTranslation();

  const displayMetrics =
    metrics.length > 0
      ? metrics
      : [
          {
            label: t("analytics.metrics.avgCompletion", "Avg. Completion Time"),
            value: "2.5 Days",
            description: t(
              "analytics.metrics.avgCompletionDesc",
              "Average days to complete accepted repair orders"
            ),
          },
          {
            label: t("analytics.metrics.bidAcceptance", "Bid Acceptance Rate"),
            value: "75%",
            description: t(
              "analytics.metrics.bidAcceptanceDesc",
              "Percentage of your submitted bids accepted by car owners"
            ),
          },
          {
            label: t("analytics.metrics.cancellation", "Cancellation Rate"),
            value: "2%",
            description: t(
              "analytics.metrics.cancellationDesc",
              "Percentage of orders cancelled after assignment"
            ),
          },
          {
            label: t("analytics.metrics.repeatCustomers", "Repeat Customers"),
            value: "12",
            description: t(
              "analytics.metrics.repeatCustomersDesc",
              "Customers who booked with you more than once"
            ),
          },
        ];

  if (loading) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />;
  }

  return (
    <Card className="rounded-xl border border-border/80 shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
      <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/20">
        <CardTitle className="text-base font-bold text-foreground">
          {t("analytics.metrics.title", "Performance Metrics")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("analytics.metrics.name", "Metric")}</TableHead>
              <TableHead className="text-right">{t("analytics.metrics.value", "Value")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayMetrics.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <span>{row.label}</span>
                    <span
                      title={row.description}
                      className="text-muted-foreground/60 hover:text-muted-foreground cursor-help"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-base text-primary">
                  {row.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
