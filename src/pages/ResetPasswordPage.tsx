import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { authApi } from "../api/authApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])/;
    if (newPassword.length < 8 || !passwordRegex.test(newPassword)) {
      setError(
        "Password must be at least 8 characters long and contain at least one uppercase letter and one number."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authApi.resetPassword(token, {
        newPassword: newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err: any) {
      console.error("Reset failed:", err);
      setError(
        err.response?.data?.message || "Failed to reset password. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md border-border/80 p-6 text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("common.error", "Error")}</AlertTitle>
            <AlertDescription>
              Invalid or missing password reset link. Please check your email or request a new reset
              link.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/forgot-password")} className="mt-4 w-full">
            Request New Reset Link
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border/80 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 shadow-2xs">
            <Lock className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            {t("auth.resetPassword.title", "Set New Password")}
          </CardTitle>
          <CardDescription className="text-xs max-w-sm mx-auto">
            {t("auth.resetPassword.desc", "Enter your new strong password below to regain access.")}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          {!success ? (
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2.5 px-3 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle className="text-xs font-semibold">
                    {t("common.error", "Error")}
                  </AlertTitle>
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="new-pass" className="text-xs font-medium text-foreground">
                  {t("auth.resetPassword.newPassword", "New Password")}
                </Label>
                <div className="relative">
                  <Input
                    id="new-pass"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-10"
                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm-pass" className="text-xs font-medium text-foreground">
                  {t("auth.resetPassword.confirmPassword", "Confirm New Password")}
                </Label>
                <Input
                  id="confirm-pass"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat new password"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-2 shadow-xs font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("common.loading", "Updating Password...")}</span>
                  </span>
                ) : (
                  <span>{t("auth.resetPassword.submit", "Reset Password")}</span>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {t("auth.resetPassword.successTitle", "Password Successfully Reset!")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {t(
                    "auth.resetPassword.successDesc",
                    "Your password has been updated. You will be redirected to login momentarily."
                  )}
                </p>
              </div>
              <Button onClick={() => navigate("/login")} className="w-full font-semibold">
                {t("auth.login.title", "Go to Login")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
