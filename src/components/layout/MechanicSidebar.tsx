import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Car,
  Gavel,
  Wrench,
  Store,
  Bell,
  Settings,
  Image,
  LogOut,
  X,
  Sparkles,
  ShieldCheck,
  Clock,
  Star,
  Briefcase,
} from "lucide-react";
import { useAppSelector } from "../../store/hooks";
import { selectUser } from "../../store/slices/authSlice";
import { selectUnreadCount } from "../../store/slices/notificationsSlice";
import { selectAllJobs } from "../../store/slices/jobsSlice";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

interface MechanicSidebarProps {
  isMobile: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  onLogoutClick: () => void;
}

export const MechanicSidebar: React.FC<MechanicSidebarProps> = ({
  isMobile,
  mobileOpen,
  onClose,
  onLogoutClick,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const unreadCount = useAppSelector(selectUnreadCount);
  const availableJobs = useAppSelector(selectAllJobs);

  const openJobsCount = availableJobs.filter((j) => j.status === "OPEN").length;

  const navItems = [
    {
      label: t("sidebar.dashboard", "Dashboard"),
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: t("sidebar.availableJobs", "Available Jobs"),
      path: "/jobs",
      icon: Car,
      badge: openJobsCount > 0 ? `${openJobsCount} New` : undefined,
      badgeVariant: "default" as const,
    },
    {
      label: t("sidebar.myBids", "My Bids"),
      path: "/my-bids",
      icon: Gavel,
    },
    {
      label: t("sidebar.workHistory", "Work History"),
      path: "/work-history",
      icon: Briefcase,
    },
    {
      label: t("sidebar.profile", "Workshop Profile"),
      path: "/profile",
      icon: Store,
    },
    {
      label: t("sidebar.portfolio", "Portfolio Showcase"),
      path: "/portfolio",
      icon: Image,
    },
    {
      label: t("sidebar.notifications", "Notifications"),
      path: "/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? String(unreadCount) : undefined,
      badgeVariant: "destructive" as const,
    },
    {
      label: t("sidebar.settings", "Settings"),
      path: "/settings",
      icon: Settings,
    },
  ];

  const verificationStatus = user?.verificationStatus || "PENDING";
  const isApproved = verificationStatus === "APPROVED";

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-border/70 bg-card/95 backdrop-blur-xl transition-transform duration-300 ease-in-out md:translate-x-0 shadow-xl md:shadow-none",
          isMobile ? (mobileOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-md shadow-blue-500/25 text-white">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-foreground">
                  Thriio
                </span>
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                  Workshop
                </span>
              </div>
              <p className="text-[11px] font-medium text-muted-foreground">Mechanic & Repair Hub</p>
            </div>
          </div>

          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Verification Status Pill Banner */}
        <div className="px-4 py-3 border-b border-border/40 bg-muted/20">
          <div
            onClick={() => navigate("/account-verification")}
            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
              isApproved
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15"
                : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/15"
            }`}
          >
            <div className="flex items-center gap-2">
              {isApproved ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
              )}
              <div className="text-left">
                <div className="text-xs font-bold leading-none">
                  {isApproved ? "Verified Partner" : "Verification In Review"}
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">
                  {isApproved ? "All bidding privileges active" : "Click to view docs"}
                </div>
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider opacity-70">
              {verificationStatus}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Main Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold transition-transform",
                          isActive
                            ? "bg-background text-foreground"
                            : item.badgeVariant === "destructive"
                              ? "bg-destructive text-destructive-foreground animate-pulse"
                              : "bg-primary/15 text-primary"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Workshop Account Card */}
        <div className="border-t border-border/60 p-3 bg-muted/10">
          <div className="flex items-center justify-between p-2 rounded-xl border border-border/50 bg-card/60">
            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2.5 cursor-pointer overflow-hidden flex-1 mr-2"
            >
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage
                  src={user?.avatarUrl || "/images/default_mechanic_avatar.jpeg"}
                  alt={user?.name}
                />
                <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "ME"}
                </AvatarFallback>
              </Avatar>
              <div className="truncate">
                <div className="text-xs font-bold text-foreground truncate">
                  {user?.fullName || user?.name || "Mechanic Shop"}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>4.8</span>
                  <span>·</span>
                  <span>Workshop</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogoutClick}
              title="Sign out"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
