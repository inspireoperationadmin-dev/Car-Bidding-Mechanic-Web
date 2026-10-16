import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { KeyRound, Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({
  open,
  onClose,
  initialEmail = "",
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setError(t("auth.register.errors.emailRequired", "Email is required"));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authApi.changePassword({
        email: email,
      });
      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset request failed:", err);
      setError(
        err.response?.data?.message || t("common.errorBoundary.subtitle", "Failed to request reset")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    if (!success) {
      setEmail(initialEmail);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader className="gap-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              {t("auth.login.forgotPassword", "Reset Password")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            {t(
              "auth.forgotPassword.desc",
              "Enter your registered account email and we'll send you reset instructions."
            )}
          </DialogDescription>
        </DialogHeader>

        {!success ? (
          <form onSubmit={handleRequestReset} className="space-y-4 mt-2">
            {error && (
              <Alert variant="destructive" className="py-2 px-3 text-xs">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="reset-email" className="text-xs font-medium text-foreground">
                {t("auth.login.email", "Email Address")}
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  placeholder="name@workshop.com"
                  className="pl-9"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("common.loading", "Sending...")}</span>
                  </>
                ) : (
                  <span>{t("auth.forgotPassword.submit", "Send Reset Link")}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">
                {t("auth.forgotPassword.success", "Reset Link Sent")}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                {t(
                  "auth.forgotPassword.successDesc",
                  "Please check your email inbox for your password reset link."
                )}
              </p>
            </div>
            <DialogFooter className="pt-2 sm:justify-center">
              <Button onClick={handleClose} className="w-full">
                {t("common.close", "Close")}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
