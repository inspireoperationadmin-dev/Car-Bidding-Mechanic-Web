import React from "react";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, loading = false }) => {
  return (
    <Card className="rounded-xl border border-border/80 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-3/4 rounded-lg" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
              <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
