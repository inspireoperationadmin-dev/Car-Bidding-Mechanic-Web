import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser, fetchCurrentUser } from "../../store/slices/authSlice";
import { fetchNotifications, selectUnreadCount } from "../../store/slices/notificationsSlice";
import { useTranslation } from "react-i18next";
import { MechanicSidebar } from "./MechanicSidebar";
import { MechanicHeader } from "./MechanicHeader";
import { VerificationRequireModal } from "../common/VerificationRequireModal";
import { LogoutDialog } from "../common/LogoutDialog";
import { socketManager } from "../../utils/socket";
import { Bell, X, Settings, Pencil } from "lucide-react";
import { Button } from "../ui/button";

export const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const user = useSelector(selectUser);
  const [verifying, setVerifying] = useState(!user && !!localStorage.getItem("authToken"));
  const [globalSnackbar, setGlobalSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  useEffect(() => {
    if (globalSnackbar.open) {
      const timer = setTimeout(() => {
        setGlobalSnackbar({ open: false, message: "" });
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [globalSnackbar.open]);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // --- RESPONSIVE MOBILE CHECK ---
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- 1. RESTORE SESSION & PERIODIC NOTIFICATIONS ---
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("authToken");
      if (token && !user) {
        try {
          dispatch(fetchCurrentUser() as any);
        } catch (err) {
          console.error("Session restoration failed:", err);
          dispatch(logout());
          navigate("/login");
        }
      }
      setVerifying(false);
    };
    checkToken();

    const token = localStorage.getItem("authToken");
    const interval = token
      ? setInterval(() => {
          dispatch(fetchNotifications() as any);

          if (user?.verificationStatus === "PENDING") {
            dispatch(fetchCurrentUser() as any);
          }
        }, 20000)
      : null;

    // Real-time Socket Integration
    const socket = socketManager.connect();

    socket.on("bid_notification", (data) => {
      console.log("Global bid notification received:", data);
      if (!location.pathname.includes(`/jobs/${data.requestId}`)) {
        setGlobalSnackbar({ open: true, message: data.message });
      }
      dispatch(fetchNotifications() as any);
    });

    return () => {
      if (interval) clearInterval(interval);
      socket.off("bid_notification");
    };
  }, [dispatch, navigate, user, location.pathname]);

  // --- 2. VERIFICATION CHECK PROMPT ---
  useEffect(() => {
    if (!verifying && user) {
      const hasShownSession = sessionStorage.getItem("hasShownVerificationPrompt");
      const hasSkipped = localStorage.getItem("hasSkippedVerification");
      if (hasShownSession || hasSkipped) return;

      const isMechanic = user.role === "MECHANIC";
      const needsDocs = isMechanic && !user.documentsUploaded;
      const shouldShow =
        (!user.verificationStatus || needsDocs) &&
        location.pathname !== "/verification" &&
        location.pathname !== "/account-verification" &&
        location.pathname !== "/settings";

      if (shouldShow) {
        setVerifyModalOpen(true);
        sessionStorage.setItem("hasShownVerificationPrompt", "true");
      }
    }
  }, [user, location.pathname, verifying]);

  const handleConfirmLogout = () => {
    setLogoutOpen(false);
    dispatch(logout());
    navigate("/login");
  };

  // --- 3. DYNAMIC HEADER CONTENT ---
  const getHeaderContent = () => {
    switch (location.pathname) {
      case "/dashboard":
        return {
          title: t("dashboard.overview", "Dashboard Overview"),
          subtitle: t(
            "dashboard.welcomeMessage",
            "Welcome back! Here's your workshop activity today."
          ),
        };
      case "/jobs":
        return {
          title: t("jobs.title", "Available Jobs Marketplace"),
          subtitle: t("jobs.description", "Browse and bid on repair requests near your workshop."),
        };
      case "/my-bids":
        return {
          title: t("bids.title", "My Bids & Proposals"),
          subtitle: t("bids.description", "Manage and track all your active, won, and past bids."),
        };
      case "/work-history":
        return {
          title: t("workHistory.title", "Work History & Orders"),
          subtitle: t(
            "workHistory.subtitle",
            "Track accepted repair jobs, customer bookings, and completed vehicle service records."
          ),
        };
      case "/notifications":
        return {
          title: t("notifications.title", "Notifications Center"),
          subtitle: t(
            "notifications.subtitle",
            "Live auction updates, outbid alerts, and customer messages."
          ),
        };
      case "/settings":
        return {
          title: t("settings.title", "Workshop Settings"),
          subtitle: t(
            "settings.description",
            "Manage account details, security, and notification preferences."
          ),
        };
      case "/account-verification":
        return {
          title: t("layout.verification.title", "Account Verification"),
          subtitle: t(
            "layout.verification.subtitle",
            "Submit your license and insurance documents for verification."
          ),
        };
      case "/portfolio":
        return {
          title: t("portfolio.title", "Workshop Portfolio"),
          subtitle: t(
            "portfolio.subtitle",
            "Showcase before & after repair photos to win more jobs."
          ),
        };
      case "/profile":
        return {
          title: t("profile.title", "My Profile"),
          subtitle: t(
            "profile.subtitle",
            "Manage your business information and verification status"
          ),
          actions: (
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/settings")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span>{t("sidebar.settings", "Settings")}</span>
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/profile/edit")}
                className="flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Pencil className="w-4 h-4" />
                <span>{t("profile.editInfo", "Edit Info")}</span>
              </Button>
            </div>
          ),
        };
      case "/profile/edit":
        return {
          title: t("settings.editProfile", "Edit Profile"),
          subtitle: t("settings.editProfileDesc", "Update business contact and address details."),
        };
      default:
        if (location.pathname.startsWith("/jobs/")) {
          return {
            title: t("jobs.detail.title", "Job Details & Bidding"),
            subtitle: t(
              "jobs.detail.subtitle",
              "Inspect damage photos and submit your price estimate."
            ),
          };
        }
        return { title: "Workshop Portal", subtitle: "" };
    }
  };

  const headerContent: { title: string; subtitle?: string; actions?: React.ReactNode } = getHeaderContent();

  return (
    <div className="min-h-screen bg-background text-foreground flex antialiased">
      {/* Sleek Fixed Glass Sidebar */}
      <MechanicSidebar
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogoutClick={() => setLogoutOpen(true)}
      />

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col transition-all duration-300 md:pl-72">
        {/* Top Header Bar */}
        <MechanicHeader
          isMobile={isMobile}
          onMenuClick={() => setMobileOpen(!mobileOpen)}
          onLogoutClick={() => setLogoutOpen(true)}
        />

        {/* Main Content Body */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {/* Dynamic Page Header */}
            {headerContent.title && (
              <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                    {headerContent.title}
                  </h1>
                  {headerContent.subtitle && (
                    <p className="text-sm text-muted-foreground mt-1">{headerContent.subtitle}</p>
                  )}
                </div>
                {headerContent.actions && (
                  <div className="flex items-center gap-2.5">
                    {headerContent.actions}
                  </div>
                )}
              </div>
            )}

            {/* Active Route Content */}
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <VerificationRequireModal
        open={verifyModalOpen}
        user={user}
        onClose={() => {
          setVerifyModalOpen(false);
          sessionStorage.setItem("hasShownVerificationPrompt", "true");
          localStorage.setItem("hasSkippedVerification", "true");
        }}
      />

      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />

      {globalSnackbar.open && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl bg-card/95 border border-border shadow-2xl text-foreground max-w-sm backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium flex-1 leading-snug">{globalSnackbar.message}</p>
          <button
            onClick={() => setGlobalSnackbar({ open: false, message: "" })}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
