import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  Bell,
  BellOff,
  CheckCheck,
  Check,
  Clock,
  Gavel,
  ShieldCheck,
  Car,
  Star,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { fetchNotifications, markAsRead, markAllAsRead } from "../store/slices/notificationsSlice";
import { socketManager } from "../utils/socket";

import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

type ReadFilter = "ALL" | "UNREAD" | "READ";

export const Notifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: notifications,
    loading,
    error,
  } = useSelector((state: RootState) => state.notifications);
  const { t } = useTranslation();

  const [readFilter, setReadFilter] = useState<ReadFilter>("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    dispatch(fetchNotifications());

    const socket = socketManager.connect();
    const handleNewBidNotification = (data: any) => {
      console.log("New bid notification received:", data);
      dispatch(fetchNotifications());
    };
    socket.on("bid_notification", handleNewBidNotification);

    return () => {
      socket.off("bid_notification", handleNewBidNotification);
    };
  }, [dispatch]);

  const handleMarkAsRead = (id: number) => dispatch(markAsRead(id));
  const handleMarkAllRead = () => dispatch(markAllAsRead());

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const readCount = useMemo(() => notifications.filter((n) => n.isRead).length, [notifications]);

  const filteredNotifs = useMemo(() => {
    return notifications.filter((n) => {
      const typeMatch = filterType === "ALL" || n.type === filterType;
      const readMatch =
        readFilter === "ALL" ||
        (readFilter === "UNREAD" && !n.isRead) ||
        (readFilter === "READ" && n.isRead);
      return typeMatch && readMatch;
    });
  }, [notifications, filterType, readFilter]);

  const totalPages = Math.ceil(filteredNotifs.length / rowsPerPage) || 1;
  const paginatedNotifs = useMemo(() => {
    return filteredNotifs.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [filteredNotifs, page, rowsPerPage]);

  const getBadgeAndIcon = (type: string) => {
    switch (type) {
      case "BID_ACCEPTED":
        return {
          icon: Gavel,
          label: t("notifications.type.bidAccepted", "Bid Accepted"),
          badgeClass:
            "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        };
      case "BID_REJECTED":
        return {
          icon: Gavel,
          label: t("notifications.type.bidRejected", "Bid Rejected"),
          badgeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
          iconBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
        };
      case "JOB_AVAILABLE":
        return {
          icon: Car,
          label: t("notifications.type.jobAvailable", "New Job Available"),
          badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
          iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
        };
      case "ACCOUNT_VERIFIED":
        return {
          icon: ShieldCheck,
          label: t("notifications.type.accountVerified", "Account Verified"),
          badgeClass: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
          iconBg: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
        };
      case "JOB_COMPLETED":
        return {
          icon: CheckCheck,
          label: t("notifications.type.jobCompleted", "Job Completed"),
          badgeClass:
            "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        };
      case "NEW_REVIEW":
        return {
          icon: Star,
          label: t("notifications.type.newReview", "New Review"),
          badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
          iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        };
      default:
        return {
          icon: Bell,
          label: t("notifications.type.system", "System"),
          badgeClass: "bg-muted text-muted-foreground border-border",
          iconBg: "bg-muted text-muted-foreground",
        };
    }
  };

  const translateMessage = (title: string, message: string) => {
    if (title === "New Bid Received") return t("notifications.type.NEW_BID", "New Bid Received");
    if (title === "Account Verified")
      return t("notifications.type.ACCOUNT_VERIFIED", "Account Verified");

    if (message.includes("A new bid of")) {
      const match = message.match(/A new bid of ([\d.,]+) has been placed for your request: (.+)/);
      if (match) return t("notifications.type.newBidMessage", { amount: match[1], car: match[2] });
    }
    if (message.includes("Your bid for") && message.includes("has been accepted")) {
      const match = message.match(/Your bid for (.+) has been accepted/);
      if (match) return t("notifications.type.bidAcceptedMessage", { car: match[1] });
    }

    return message;
  };

  const translateTitle = (title: string) => {
    if (title === "New Bid Received") return t("notifications.type.NEW_BID", "New Bid Received");
    if (title === "Account Verified")
      return t("notifications.type.ACCOUNT_VERIFIED", "Account Verified");
    return title;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Toolbar: Filter Pills, Type Select & Mark All Read ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setReadFilter("ALL");
              setPage(0);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              readFilter === "ALL"
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card/70 border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <span>{t("notifications.filterAll", "All Notifications")}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                readFilter === "ALL"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {notifications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setReadFilter("UNREAD");
              setPage(0);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              readFilter === "UNREAD"
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card/70 border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <span>{t("notifications.filterUnread", "Unread")}</span>
            {unreadCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-500 text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setReadFilter("READ");
              setPage(0);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              readFilter === "READ"
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card/70 border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <span>{t("notifications.filterRead", "Read")}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                readFilter === "READ"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {readCount}
            </span>
          </button>
        </div>

        {/* Right Controls: Type Dropdown & Mark All Read */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="w-48">
            <Select
              value={filterType}
              onValueChange={(val) => {
                setFilterType(val);
                setPage(0);
              }}
            >
              <SelectTrigger className="h-9 text-xs rounded-xl bg-card border-border/80">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Filter by type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">
                  {t("notifications.filterAll", "All Notifications")}
                </SelectItem>
                <SelectItem value="JOB_AVAILABLE" className="text-xs">
                  {t("notifications.type.jobAvailable", "New Job")}
                </SelectItem>
                <SelectItem value="BID_ACCEPTED" className="text-xs">
                  {t("notifications.type.bidAccepted", "Bid Accepted")}
                </SelectItem>
                <SelectItem value="BID_REJECTED" className="text-xs">
                  {t("notifications.type.bidRejected", "Bid Rejected")}
                </SelectItem>
                <SelectItem value="ACCOUNT_VERIFIED" className="text-xs">
                  {t("notifications.type.accountVerified", "Verified")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="h-9 text-xs gap-1.5 rounded-xl border-border/80 bg-card hover:bg-accent font-medium cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-500" />
            <span>{t("notifications.markAllRead", "Mark all as read")}</span>
          </Button>
        </div>
      </div>

      {/* ── Subtitle Count Hint ── */}
      <div className="text-xs text-muted-foreground font-medium flex items-center justify-between">
        <span>
          {t("notifications.showing", {
            count: filteredNotifs.length,
            plural: filteredNotifs.length !== 1 ? "s" : "",
          })}
        </span>
        {unreadCount > 0 && (
          <span className="text-xs text-primary font-semibold">
            {unreadCount} unread alert{unreadCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* ── Notifications Content List ── */}
      <Card className="bg-card/70 backdrop-blur-md border-border/80 overflow-hidden shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredNotifs.length === 0 ? (
            /* Modern Empty State */
            <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-inner">
                {readFilter === "UNREAD" ? (
                  <CheckCheck className="w-8 h-8 text-emerald-500" />
                ) : (
                  <BellOff className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {readFilter === "UNREAD"
                  ? t("notifications.allCaughtUp", "All caught up!")
                  : t("notifications.noNotifications", "No Notifications")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {readFilter === "UNREAD"
                  ? t("notifications.noUnread", "You have read all your notifications.")
                  : t(
                      "notifications.empty",
                      "No notifications found matching your current filter selection."
                    )}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {paginatedNotifs.map((notif) => {
                const { icon: Icon, label, badgeClass, iconBg } = getBadgeAndIcon(notif.type);
                return (
                  <div
                    key={notif.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3.5 transition-colors ${
                      notif.isRead
                        ? "hover:bg-muted/20"
                        : "bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/15"
                    }`}
                  >
                    {/* Left: Indicator, Icon, Text Details */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Unread Status Dot */}
                      <div className="pt-2.5 shrink-0">
                        {!notif.isRead ? (
                          <span className="flex h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20 animate-pulse" />
                        ) : (
                          <span className="block h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                        )}
                      </div>

                      {/* Notification Category Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${iconBg}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Text Content */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4
                            className={`text-sm tracking-tight truncate ${
                              notif.isRead
                                ? "font-medium text-foreground"
                                : "font-bold text-foreground"
                            }`}
                          >
                            {translateTitle(notif.title)}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold py-0.5 px-2 rounded-md ${badgeClass}`}
                          >
                            {label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {translateMessage(notif.title, notif.message)}
                        </p>
                      </div>
                    </div>

                    {/* Right: Timestamp & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-6 sm:pl-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {notif.createdAt
                            ? format(new Date(notif.createdAt), "MMM dd, hh:mm a")
                            : "-"}
                        </span>
                      </div>

                      {!notif.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="h-8 px-2.5 text-xs text-primary hover:bg-primary/10 gap-1.5 rounded-lg cursor-pointer"
                          title={t("notifications.markRead", "Mark as read")}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">
                            {t("notifications.markRead", "Mark as read")}
                          </span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>

        {/* ── Pagination Bar ── */}
        {filteredNotifs.length > rowsPerPage && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border/60 bg-muted/20">
            <div className="text-xs text-muted-foreground">
              Page <span className="font-bold text-foreground">{page + 1}</span> of{" "}
              <span className="font-bold text-foreground">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-8 px-2.5 text-xs rounded-lg border-border"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                <span>Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="h-8 px-2.5 text-xs rounded-lg border-border"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Notifications;
