import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { authApi } from "../../api/authApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { KeyRound, Eye, EyeOff, Loader2, AlertCircle, Check } from "lucide-react";

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const user = useSelector(selectUser);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError(t("auth.register.errors.passwordMatch", "Passwords do not match"));
      return;
    }

    if (newPassword.length < 8) {
      setError(t("auth.register.errors.passwordLength", "Password must be at least 8 characters"));
      return;
    }

    if (!user) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Password change failed:", err);
      setError(
        err.response?.data?.message ||
          "Failed to change password. Please check your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader className="gap-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              {t("settings.changePassword", "Change Password")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            {t(
              "settings.changePasswordDesc",
              "Enter your current password and pick a strong new password with at least 8 characters."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <Alert variant="destructive" className="py-2 px-3 text-xs">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="current-pass" className="text-xs font-medium text-foreground">
              {t("settings.currentPassword", "Current Password")}
            </Label>
            <div className="relative">
              <Input
                id="current-pass"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="new-pass" className="text-xs font-medium text-foreground">
              {t("settings.newPassword", "New Password")}
            </Label>
            <div className="relative">
              <Input
                id="new-pass"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="pr-10"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm-pass" className="text-xs font-medium text-foreground">
              {t("settings.confirmPassword", "Confirm New Password")}
            </Label>
            <div className="relative">
              <Input
                id="confirm-pass"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pr-10"
                placeholder="Repeat new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("common.saving", "Saving...")}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t("settings.save", "Save Changes")}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
