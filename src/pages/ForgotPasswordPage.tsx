import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiClient } from "../api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.post("/auth/password-reset", { email });
      setSuccess(true);
    } catch (err: any) {
      console.error("Forgot password request failed:", err);
      setError(
        err.response?.data?.message || "Failed to send reset email. Please verify and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border/80 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 shadow-2xs">
            <Mail className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            {t("auth.forgotPassword.title", "Forgot Password")}
          </CardTitle>
          <CardDescription className="text-xs max-w-sm mx-auto">
            {t(
              "auth.forgotPassword.desc",
              "Enter your registered garage email address and we'll send you a password reset link."
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2.5 px-3 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle className="text-xs font-semibold">
                    {t("common.error", "Error")}
                  </AlertTitle>
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">
                  {t("auth.forgotPassword.email", "Email Address")}
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="garage@example.com"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-2 shadow-xs font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("common.loading", "Sending Link...")}</span>
                  </span>
                ) : (
                  <span>{t("auth.forgotPassword.submit", "Send Password Reset Link")}</span>
                )}
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t("auth.forgotPassword.backToLogin", "Back to Login")}</span>
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {t("auth.forgotPassword.success", "Check Your Email")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto leading-relaxed">
                  {t(
                    "auth.forgotPassword.successDesc",
                    "We've sent a password reset link to your email address. Please follow the instructions to set your new password."
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full font-semibold"
              >
                {t("auth.login.title", "Return to Login")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
