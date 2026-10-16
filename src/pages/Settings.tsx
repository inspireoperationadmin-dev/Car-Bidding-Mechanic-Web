import { useState, useEffect } from "react";
import {
  User,
  ShieldCheck,
  KeyRound,
  Sparkles,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  HelpCircle,
  Clock,
  Images,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- REDUX IMPORTS ---
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store/store";
import { logout, selectUser } from "../store/slices/authSlice";
import {
  updatePreferences,
  fetchPreferences,
  type NotificationPrefs,
} from "../store/slices/notificationsSlice";

// --- CUSTOM COMPONENTS ---
import { NotificationPreferences } from "../components/settings/NotificationPreferences";
import { LanguageSelector } from "../components/settings/LanguageSelector";
import { LogoutDialog } from "../components/common/LogoutDialog";
import { ChangePasswordDialog } from "../components/settings/ChangePasswordDialog";

import { useTranslation } from "react-i18next";
import { useAppTheme } from "../theme/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";

export const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const user = useSelector(selectUser);
  const { mode, toggleTheme } = useAppTheme();

  // Get preferences and fetch on mount
  const preferences = useSelector((state: any) => state.notifications.preferences);

  // --- LOCAL STATE ---
  const [language, setLanguage] = useState(i18n.language || "en");
  const [availableForWork, setAvailableForWork] = useState(true);

  useEffect(() => {
    dispatch(fetchPreferences());
  }, [dispatch]);

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // --- VERIFICATION STATUS HELPER ---
  const status = user?.verificationStatus || "NOT_SUBMITTED";

  let verificationBadge = (
    <Badge
      variant="outline"
      className="border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10"
    >
      {t("settings.status.notSubmitted", "Action Required")}
    </Badge>
  );
  let verificationSecondaryText = t(
    "settings.verifyAccountDesc",
    "Submit documents for verification"
  );
  let isVerificationActionable = true;

  if (status === "APPROVED") {
    verificationBadge = (
      <Badge
        variant="outline"
        className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
      >
        {t("settings.status.verified", "Verified")}
      </Badge>
    );
    verificationSecondaryText = t(
      "settings.status.verifiedSuccess",
      "Account Verified Successfully"
    );
    isVerificationActionable = false;
  } else if (status === "PENDING") {
    verificationBadge = (
      <Badge
        variant="outline"
        className="border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10"
      >
        {t("settings.status.pending", "Under Review")}
      </Badge>
    );
    verificationSecondaryText = t("settings.status.pendingApproval", "Pending Admin Approval");
    isVerificationActionable = false;
  }

  // --- HANDLERS ---
  const handleLogoutClick = () => {
    setLogoutOpen(true);
  };

  const handleConfirmLogout = () => {
    setLogoutOpen(false);
    dispatch(logout());
    navigate("/login");
  };

  const handleSaveNotifications = async (prefs: NotificationPrefs) => {
    try {
      await dispatch(updatePreferences(prefs)).unwrap();
      showToast(t("settings.saveSuccess", "Notification settings saved successfully!"));
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-card border border-border shadow-lg text-foreground text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Profile & Verification */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              {t("settings.account", "Account & Workshop")}
            </CardTitle>
            <CardDescription className="text-xs">
              Manage your workshop presence and verification credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {/* Profile Link */}
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border/40 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {t("settings.profile", "Workshop Profile")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("settings.editProfileDesc", "Update contact info, address, and credentials")}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Portfolio Link */}
            <button
              onClick={() => navigate("/portfolio")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border/40 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Images className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {t("portfolio.title", "Portfolio & Gallery")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("portfolio.subtitle", "Showcase completed repair jobs and garage photos")}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Verification Link */}
            <button
              disabled={!isVerificationActionable}
              onClick={() => navigate("/verification")}
              className={`w-full flex items-center justify-between p-3 rounded-xl border border-border/40 transition-colors text-left ${
                isVerificationActionable
                  ? "bg-muted/30 hover:bg-muted/60 cursor-pointer group"
                  : "bg-muted/20 opacity-90 cursor-default"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground flex items-center gap-2">
                    {t("settings.verifyAccount", "Verification Status")}
                    {verificationBadge}
                  </div>
                  <div className="text-xs text-muted-foreground">{verificationSecondaryText}</div>
                </div>
              </div>
              {isVerificationActionable && (
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>
          </CardContent>
        </Card>

        {/* 2. Security & Credentials */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              {t("settings.security", "Security & Access")}
            </CardTitle>
            <CardDescription className="text-xs">
              Keep your credentials protected and availability updated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {/* Change Password */}
            <button
              onClick={() => setPasswordDialogOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border/40 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {t("settings.changePassword", "Change Password")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("settings.changePasswordDescShort", "Securely update your account password")}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Availability Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {t("settings.availableForWork", "Available for New Jobs")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("settings.availabilityDesc", "Pause incoming job opportunities when busy")}
                  </div>
                </div>
              </div>
              <Switch checked={availableForWork} onCheckedChange={setAvailableForWork} />
            </div>
          </CardContent>
        </Card>

        {/* 3. Appearance & Language */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {t("settings.preferences.title", "Appearance & Regional")}
            </CardTitle>
            <CardDescription className="text-xs">
              Customize interface display language and color scheme.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {mode === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {t("settings.theme", "Theme Mode")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {mode === "dark"
                      ? t("settings.dark", "Dark Mode active")
                      : t("settings.light", "Light Mode active")}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2 text-xs">
                {mode === "dark" ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
                {mode === "dark" ? "Switch to Light" : "Switch to Dark"}
              </Button>
            </div>

            {/* Language Selector */}
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={async (newLang) => {
                setLanguage(newLang);
                await i18n.changeLanguage(newLang);
                localStorage.setItem("i18nextLng", newLang);
                const tNew = i18n.getFixedT(newLang);
                showToast(
                  tNew("settings.languageChanged", {
                    lng: newLang === "fr" ? "Français" : "English",
                  })
                );
              }}
            />
          </CardContent>
        </Card>

        {/* 4. Notifications */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              {t("notifications.title", "Notifications")}
            </CardTitle>
            <CardDescription className="text-xs">
              Choose how you receive bids, chat, and status updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <NotificationPreferences
              initialData={preferences || undefined}
              onSave={handleSaveNotifications}
            />
          </CardContent>
        </Card>
      </div>

      {/* Support & Logout Bar */}
      <Card className="border-border/60 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {t("common.help.title", "Need Assistance?")}
              </div>
              <div className="text-xs text-muted-foreground">
                Thriio Mechanic Platform • Version 1.0.0
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/help")}
              className="flex-1 sm:flex-none"
            >
              {t("common.help.subtitle", "Help Center")}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogoutClick}
              className="flex-1 sm:flex-none gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t("settings.logout", "Sign Out")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout Dialog */}
      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        onSuccess={() => {
          showToast(t("settings.updateSuccess", "Password updated successfully!"));
        }}
      />
    </div>
  );
};

export default Settings;
