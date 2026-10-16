import React from "react";
import { StatCard } from "./StatCard";
import { Wallet, Star, CheckCircle, Gavel } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StatsGridProps {
  data?: {
    earnings: string;
    rating: string;
    winRate: string;
    activeBids: number;
  };
  loading?: boolean;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ data, loading = false }) => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t("stats.totalEarnings", "Total Earnings"),
      value: data?.earnings || "$0",
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      title: t("stats.avgRating", "Avg Rating"),
      value: data?.rating || "0/5",
      icon: <Star className="w-5 h-5 text-amber-500" />,
    },
    {
      title: t("stats.winRate", "Win Rate"),
      value: data?.winRate || "0%",
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: t("stats.activeBids", "Active Bids"),
      value: data?.activeBids || 0,
      icon: <Gavel className="w-5 h-5 text-sky-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          loading={loading}
        />
      ))}
    </div>
  );
};
