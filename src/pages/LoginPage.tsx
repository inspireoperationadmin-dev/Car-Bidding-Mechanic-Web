import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Wrench, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Globe } from "lucide-react";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { loginAsync } from "../store/slices/authSlice";
import type { AppDispatch, RootState } from "../store/store";

import { ForgotPasswordDialog } from "../components/auth/ForgotPasswordDialog";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ThemeToggle } from "../components/theme/ThemeToggle";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();

  const { loading, error, token } = useSelector((state: RootState) => state.auth);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const currentLang = i18n.language || "en";
  const toggleLanguage = () => {
    const next = currentLang.startsWith("en") ? "fr" : "en";
    i18n.changeLanguage(next);
  };

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    try {
      await dispatch(loginAsync({ email: data.email, password: data.password })).unwrap();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = (err as string) || t("auth.login.errorGeneric", "Invalid email or password");
      setLoginError(message);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Full-bleed Cinematic Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-1000 ease-out"
        style={{ backgroundImage: "url('/images/auth_hero_workshop.jpeg')" }}
      />

      {/* Translucent Backdrop Overlay (Allows background to be clearly visible) */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/40 to-slate-950/70 backdrop-blur-[1.5px]" />

      {/* Top Floating Navbar */}
      <header className="relative z-20 w-full px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white drop-shadow-md">
              THRIIO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex h-9 px-3 items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-xs font-semibold text-white hover:bg-white/20 transition-colors shadow-sm"
            title="Switch Language"
          >
            <Globe className="h-3.5 w-3.5 text-slate-300" />
            <span className="uppercase">{currentLang}</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Center Auth Container */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Frosted Transparent Glass Card */}
          <Card className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 dark:bg-black/35 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.45)]">
            <CardContent className="p-8 sm:p-9 space-y-6">
              {/* Header Title */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                  {t("auth.login.title", "Welcome Back")}
                </h1>
                <p className="text-xs sm:text-sm text-slate-200">
                  Sign in to view vehicle repair requests and manage bids
                </p>
              </div>

              {/* Error Banner */}
              {(loginError || error) && (
                <Alert
                  variant="destructive"
                  className="py-2.5 bg-red-950/70 border-red-500/40 text-red-200 backdrop-blur-md"
                >
                  <AlertDescription className="text-xs font-medium">
                    {loginError || error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-slate-200">
                    {t("auth.login.email", "Email Address")}
                  </Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="mechanic@workshop.com"
                      className="pl-10 h-11 bg-black/25 dark:bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus-visible:ring-emerald-500/50 text-sm rounded-xl backdrop-blur-md transition-colors"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-red-400 font-medium">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-medium text-slate-200">
                      {t("auth.login.password", "Password")}
                    </Label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline font-medium"
                    >
                      {t("auth.login.forgotPassword", "Forgot password?")}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 bg-black/25 dark:bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus-visible:ring-emerald-500/50 text-sm rounded-xl backdrop-blur-md transition-colors"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-red-400 font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl font-semibold gap-2 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{t("auth.login.submit", "Sign In to Portal")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Bottom Registration Link */}
              <div className="pt-4 border-t border-white/15 text-center">
                <p className="text-xs text-slate-200">
                  Don&apos;t have a workshop account?{" "}
                  <RouterLink
                    to="/register"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
                  >
                    {t("auth.login.register", "Apply as Partner Mechanic")}
                  </RouterLink>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Guarantee Pill */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Encrypted Workshop Connection</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full py-4 text-center text-xs text-slate-300">
        © {new Date().getFullYear()} Thriio Automotive Services. All rights reserved.
      </footer>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        initialEmail={getValues("email")}
      />
    </div>
  );
}
