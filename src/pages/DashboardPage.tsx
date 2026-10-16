import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Gavel,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  Wrench,
  Search,
  Bell,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Car,
  ChevronRight,
  Zap,
} from "lucide-react";
import { mechanicsApi } from "../api/mechanicsApi";
import { useAppSelector } from "../store/hooks";
import { selectUser } from "../store/slices/authSlice";
import { selectAllJobs } from "../store/slices/jobsSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Skeleton } from "../components/ui/skeleton";

interface DashboardData {
  stats: {
    activeBids: number;
    wonJobs: number;
  };
  recentActivity: {
    id: number;
    text: string;
    params?: any;
    date: string;
    type: string;
    subtitle?: string;
  }[];
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const availableJobs = useAppSelector(selectAllJobs);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    stats: { activeBids: 0, wonJobs: 0 },
    recentActivity: [],
  });

  const openJobsCount = availableJobs.filter((j) => j.status === "OPEN").length;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await mechanicsApi.getDashboardData();
        setData({
          stats: {
            activeBids: result?.stats?.activeBidsCount ?? 0,
            wonJobs: result?.stats?.selectedJobsCount ?? 0,
          },
          recentActivity: (result?.recentActivity || []).map((activity: any) => ({
            id: activity.id,
            text: activity.title || activity.text || "System event",
            subtitle: activity.subtitle,
            date: new Date(activity.createdAt || Date.now()).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }),
            type: activity.type || "BID",
          })),
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const isApproved = user?.verificationStatus === "APPROVED";

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Welcome Workshop Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-cyan-500/10 p-6 md:p-8 backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={isApproved ? "success" : "warning"}
                className="gap-1.5 py-1 px-3 text-xs font-semibold"
              >
                {isApproved ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Workshop
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    Verification In Review
                  </>
                )}
              </Badge>

              <Badge variant="outline" className="gap-1 py-1 px-2.5 bg-card/60 text-xs">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>4.8 Rating</span>
              </Badge>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back, {user?.fullName || user?.name || "Mechanic Partner"}!
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              There are currently{" "}
              <span className="font-bold text-foreground">{openJobsCount} vehicles</span> available
              for bidding within your service radius.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => navigate("/jobs")}
              className="gap-2 font-semibold shadow-md bg-primary hover:bg-primary/90"
            >
              <Search className="w-4 h-4" />
              Browse Jobs ({openJobsCount})
            </Button>
            <Button
              onClick={() => navigate("/my-bids")}
              variant="outline"
              className="gap-2 font-semibold bg-card/80"
            >
              <Gavel className="w-4 h-4" />
              My Proposals
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Four Modern KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Bids */}
        <Card className="border-border/80 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active Bids
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Gavel className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{data.stats.activeBids}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>In active auctions</span>
            </p>
          </CardContent>
        </Card>

        {/* Won Jobs */}
        <Card className="border-border/80 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Jobs Won
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{data.stats.wonJobs}</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>Selected by customers</span>
            </p>
          </CardContent>
        </Card>

        {/* Available in Radius */}
        <Card className="border-border/80 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Open Near You
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{openJobsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Within 25-50 km radius</p>
          </CardContent>
        </Card>

        {/* Workshop Reputation */}
        <Card className="border-border/80 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Reputation
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">4.8 ★</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Google verified rating</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Grid: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Timeline (Col span 2) */}
        <Card className="lg:col-span-2 border-border/80 bg-card/70 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Recent Activity & Events
              </CardTitle>
              <CardDescription>Latest updates on your bids and job assignments</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/notifications")}
              className="text-xs gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>

          <CardContent className="pt-5">
            {data.recentActivity.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl border border-dashed border-border/60 bg-muted/10">
                <Clock className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm font-semibold text-foreground">No recent activity yet</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 mb-3">
                  As you submit bids and win repairs, real-time activity notifications will appear
                  here.
                </p>
                <Button onClick={() => navigate("/jobs")} size="sm" variant="outline">
                  Browse Available Jobs
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between p-3.5 rounded-xl border border-border/50 bg-card/40 hover:bg-card/80 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Gavel className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {activity.params
                            ? `${t(activity.text)} "${activity.params.item}"`
                            : t(activity.text) || activity.text}
                        </div>
                        {activity.subtitle && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {activity.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-xs text-muted-foreground font-mono shrink-0 ml-2">
                      {activity.date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Workshop Shortcuts (Col span 1) */}
        <Card className="border-border/80 bg-card/70 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Workshop Shortcuts
            </CardTitle>
            <CardDescription>Fast access to your core operations</CardDescription>
          </CardHeader>

          <CardContent className="pt-5 space-y-3 flex-1">
            <button
              onClick={() => navigate("/jobs")}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-card/40 hover:bg-card/80 hover:border-primary/40 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    Find New Jobs
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {openJobsCount} requests ready for bids
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate("/my-bids")}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-card/40 hover:bg-card/80 hover:border-primary/40 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Gavel className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    My Bids & Quotes
                  </div>
                  <div className="text-xs text-muted-foreground">Check active auctions status</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-card/40 hover:bg-card/80 hover:border-primary/40 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    Google Reviews & Rating
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Sync live Google business profile
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate("/account-verification")}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-card/40 hover:bg-card/80 hover:border-primary/40 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    License & Verification
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Manage insurance & business docs
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
