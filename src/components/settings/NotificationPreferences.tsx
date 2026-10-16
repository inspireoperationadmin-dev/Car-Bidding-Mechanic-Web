import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Bell, Mail, Smartphone, Award, DollarSign, Activity, Check, Loader2 } from "lucide-react";

export interface NotificationPrefs {
  push: boolean;
  email: boolean;
  jobSelected: boolean;
  newBid: boolean;
  payment: boolean;
}

interface NotificationPreferencesProps {
  initialData?: NotificationPrefs;
  onSave?: (prefs: NotificationPrefs) => Promise<void>;
}

export const NotificationPreferences = ({ initialData, onSave }: NotificationPreferencesProps) => {
  const { t } = useTranslation();

  const [prefs, setPrefs] = useState<NotificationPrefs>(
    initialData || {
      push: true,
      email: true,
      jobSelected: true,
      newBid: false,
      payment: true,
    }
  );

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPrefs(initialData);
    }
  }, [initialData]);

  const handleChange = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      if (onSave) {
        await onSave(prefs);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const areChannelsActive = prefs.push || prefs.email;

  return (
    <div className="space-y-5">
      {/* 1. CHANNELS SECTION */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("settings.channels", "Notification Channels")}
        </div>

        <div className="space-y-2">
          {/* Push Notifications */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {t("settings.preferences.push", "Push Notifications")}
                </div>
                <div className="text-xs text-muted-foreground">
                  Receive browser notifications when online
                </div>
              </div>
            </div>
            <Switch checked={prefs.push} onCheckedChange={() => handleChange("push")} />
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {t("settings.preferences.email", "Email Notifications")}
                </div>
                <div className="text-xs text-muted-foreground">
                  Daily digests and critical alert summaries
                </div>
              </div>
            </div>
            <Switch checked={prefs.email} onCheckedChange={() => handleChange("email")} />
          </div>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* 2. ALERT TYPES SECTION */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("settings.alertTypes", "Alert Triggers")}
        </div>

        <div className="space-y-2">
          {/* Job Selected */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Job Selected</div>
                <div className="text-xs text-muted-foreground">
                  When a customer awards you their repair request
                </div>
              </div>
            </div>
            <Switch
              checked={prefs.jobSelected}
              onCheckedChange={() => handleChange("jobSelected")}
              disabled={!areChannelsActive}
            />
          </div>

          {/* New Bid Activity */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">New Bid Activity</div>
                <div className="text-xs text-muted-foreground">
                  Competitor bid updates and auction deadlines
                </div>
              </div>
            </div>
            <Switch
              checked={prefs.newBid}
              onCheckedChange={() => handleChange("newBid")}
              disabled={!areChannelsActive}
            />
          </div>

          {/* Payment Updates */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Payment & Payouts</div>
                <div className="text-xs text-muted-foreground">
                  Deposit confirmations and final payout releases
                </div>
              </div>
            </div>
            <Switch
              checked={prefs.payment}
              onCheckedChange={() => handleChange("payment")}
              disabled={!areChannelsActive}
            />
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="pt-2">
        <Button onClick={handleSave} disabled={loading} className="w-full shadow-xs">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t("settings.saving", "Saving...")}</span>
            </span>
          ) : saved ? (
            <span className="flex items-center gap-2 text-primary-foreground">
              <Check className="w-4 h-4" />
              <span>{t("settings.saved", "Saved!")}</span>
            </span>
          ) : (
            <span>{t("settings.save", "Save Notification Preferences")}</span>
          )}
        </Button>
      </div>
    </div>
  );
};
