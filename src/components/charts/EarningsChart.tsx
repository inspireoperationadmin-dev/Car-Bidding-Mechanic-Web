import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import { Skeleton } from "../ui/skeleton";

interface EarningsChartProps {
  data?: { date: string; amount: number }[];
  loading?: boolean;
}

export const EarningsChart: React.FC<EarningsChartProps> = ({ data = [], loading = false }) => {
  const { t } = useTranslation();

  if (loading) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/10 text-muted-foreground text-sm">
        {t("analytics.earnings.noData", "No earnings data available yet")}
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
          <XAxis
            dataKey="date"
            className="text-xs text-muted-foreground fill-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            className="text-xs text-muted-foreground fill-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.75rem",
              color: "hsl(var(--foreground))",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ r: 5, fill: "hsl(var(--primary))" }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
