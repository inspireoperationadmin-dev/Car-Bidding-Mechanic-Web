import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "../ui/skeleton";

interface SuccessRateChartProps {
  data?: { name: string; value: number }[];
  loading?: boolean;
}

const COLORS = ["#0ea5e9", "#ef4444"];

export const SuccessRateChart: React.FC<SuccessRateChartProps> = ({
  data = [],
  loading = false,
}) => {
  if (loading) {
    return <Skeleton className="w-48 h-48 rounded-full mx-auto" />;
  }

  return (
    <div className="h-60 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.75rem",
              color: "hsl(var(--foreground))",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
