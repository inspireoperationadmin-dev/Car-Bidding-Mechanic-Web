import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import MapboxAddressPicker from "../components/common/MapboxAddressPicker";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Wrench,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Edit3,
  RotateCcw,
  Check,
  Building2,
  CreditCard,
  AlertCircle,
  X,
} from "lucide-react";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { registerAsync, sendOtpAsync } from "../store/slices/authSlice";
import { resetStatus } from "../store/slices/mechanicSlice";
import type { AppDispatch, RootState } from "../store/store";

import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ThemeToggle } from "../components/theme/ThemeToggle";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    siret: z
      .string()
      .min(1, "SIRET (siège) is mandatory")
      .refine(
        (val) => val.replace(/\s+/g, "").length === 14 && /^\d+$/.test(val.replace(/\s+/g, "")),
        "SIRET must contain exactly 14 digits (e.g. 123 456 789 00012)"
      ),
    vatNumber: z
      .string()
      .min(1, "Numéro de TVA is mandatory")
      .regex(
        /^(FR\s?[0-9A-Z]{2}\s?[0-9]{9}|[A-Z]{2}\s?[0-9A-Z\s]{4,14})$/i,
        "Valid Numéro de TVA is required (e.g. FR 12 345678901)"
      ),
    address: z.string().min(5, "Shop Address is required"),
    postalCode: z.string().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[0-9]/, "Include at least one number")
      .regex(/[^A-Za-z0-9]/, "Include at least one special character"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    otp: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();

  const { loading } = useSelector((state: RootState) => state.auth);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Floating Toast Notification
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" } | null>(null);

  const showToast = (message: string, severity: "success" | "error" = "success") => {
    setToast({ open: true, message, severity });
    setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  // OTP States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const currentLang = i18n.language || "en";
  const toggleLanguage = () => {
    const next = currentLang.startsWith("en") ? "fr" : "en";
    i18n.changeLanguage(next);
  };

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const watchPassword = watch("password", "");

  const passRequirements = [
    { label: "8+ characters", met: watchPassword.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(watchPassword) },
    { label: "Number", met: /[0-9]/.test(watchPassword) },
    { label: "Special symbol", met: /[^A-Za-z0-9]/.test(watchPassword) },
  ];

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    const fullOtp = newDigits.join("");
    setValue("otp", fullOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSendOtp = async () => {
    const isValid = await trigger([
      "firstName",
      "lastName",
      "email",
      "siret",
      "vatNumber",
      "address",
      "password",
      "confirmPassword",
    ]);
    if (!isValid) return;

    setRegisterError(null);
    setIsVerifying(true);

    try {
      const email = getValues("email");
      const phone = getValues("phone");
      const response: any = await dispatch(sendOtpAsync({ email, phone })).unwrap();

      setReceivedOtp(response.data.otp);
      setIsOtpSent(true);
      const success = t("auth.register.otpSentSuccess", "Verification code sent to your email.");
      setSuccessMsg(success);
      setRegisterError(null);
      showToast(success, "success");
    } catch (err: any) {
      const errorMsg =
        typeof err === "string"
          ? err
          : err?.message || err?.data?.message || "Failed to send verification code. Please try again.";
      setRegisterError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (!isOtpSent) {
      await handleSendOtp();
      return;
    }

    const currentOtp = otpDigits.join("");
    if (currentOtp.length < 6 || currentOtp !== receivedOtp) {
      const msg = "Incorrect 6-digit verification code. Please check your email.";
      setRegisterError(msg);
      showToast(msg, "error");
      return;
    }

    setRegisterError(null);
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      address: data.address,
      postalCode: data.postalCode,
      siret: data.siret.replace(/\s+/g, ""),
      vatNumber: data.vatNumber.trim().toUpperCase(),
      phone: data.phone === "" ? undefined : data.phone,
      role: "MECHANIC",
      otp: currentOtp,
    };

    try {
      await dispatch(registerAsync(payload as any)).unwrap();
      dispatch(resetStatus());
      navigate("/verification", { replace: true });
    } catch (err: unknown) {
      let message = t(
        "auth.register.errors.generic",
        "Registration failed. Please check your details."
      );
      if (typeof err === "string") {
        message = err;
      } else if (err && typeof err === "object" && "message" in err) {
        message = (err as any).message;
      }
      setRegisterError(message);
      showToast(message, "error");
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden font-sans transition-colors duration-300">
      {/* Floating Toast Notification */}
      {toast && toast.open && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all animate-in slide-in-from-top-4 duration-300 max-w-md w-[92%] sm:w-auto ${
            toast.severity === "success"
              ? "bg-emerald-950/90 text-emerald-100 border-emerald-500/40 shadow-emerald-500/20"
              : "bg-red-950/90 text-red-100 border-red-500/40 shadow-red-500/20"
          }`}
        >
          {toast.severity === "success" ? (
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          <p className="text-xs font-semibold">{toast.message}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Full-bleed Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-1000 ease-out"
        style={{ backgroundImage: "url('/images/auth_hero_garage.jpeg')" }}
      />

      {/* Translucent Backdrop Overlay */}
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

      {/* Main Center Register Container */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          {/* Frosted Transparent Glass Card */}
          <Card className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 dark:bg-black/35 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.45)]">
            <CardContent className="p-7 sm:p-9 space-y-6">
              {/* Header Title */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                  {t("auth.register.title", "Join Partner Network")}
                </h1>
                <p className="text-xs sm:text-sm text-slate-200">
                  Register your workshop to start bidding on vehicle repairs in your area
                </p>
              </div>

              {/* Progress Stepper Indicators */}
              <div className="flex items-center justify-center gap-2 pt-1 pb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isOtpSent
                        ? "bg-emerald-500 text-white"
                        : "bg-primary text-primary-foreground shadow-md"
                    }`}
                  >
                    {isOtpSent ? <Check className="w-4 h-4" /> : "1"}
                  </div>
                  <span
                    className={`text-xs font-medium ${isOtpSent ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}
                  >
                    Workshop Info
                  </span>
                </div>

                <div className="w-12 h-px bg-slate-300 dark:bg-white/20" />

                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isOtpSent
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`text-xs font-medium ${isOtpSent ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
                  >
                    Verification
                  </span>
                </div>
              </div>

              {/* Feedback Alerts */}
              {registerError && (
                <Alert
                  variant="destructive"
                  className="py-2.5 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-200"
                >
                  <AlertDescription className="text-xs font-medium">
                    {registerError}
                  </AlertDescription>
                </Alert>
              )}

              {successMsg && !registerError && (
                <Alert className="py-2.5 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200">
                  <AlertDescription className="text-xs font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {successMsg}
                  </AlertDescription>
                </Alert>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Step 1 Fields */}
                <div
                  className={`space-y-4 transition-all duration-300 ${isOtpSent ? "opacity-40 pointer-events-none" : "opacity-100"}`}
                >
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {t("auth.register.firstName", "First Name")} *
                      </Label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          placeholder="John"
                          className="pl-9 h-10 bg-white/80 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm rounded-xl"
                          disabled={isOtpSent}
                          {...register("firstName")}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-[11px] text-red-500">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {t("auth.register.lastName", "Last Name")} *
                      </Label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          placeholder="Doe"
                          className="pl-9 h-10 bg-white/80 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm rounded-xl"
                          disabled={isOtpSent}
                          {...register("lastName")}
                        />
                      </div>
                      {errors.lastName && (
                        <p className="text-[11px] text-red-500">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {t("auth.register.email", "Email Address")} *
                      </Label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          type="email"
                          placeholder="shop@domain.com"
                          className="pl-9 h-10 bg-white/80 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm rounded-xl"
                          disabled={isOtpSent}
                          {...register("email")}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-[11px] text-red-500">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {t("auth.register.phone", "Phone Number")}
                      </Label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          type="tel"
                          placeholder="+33 6 12 34 56 78"
                          className="pl-9 h-10 bg-white/80 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm rounded-xl"
                          disabled={isOtpSent}
                          {...register("phone")}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-[11px] text-red-500">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Business Registration Identifiers: SIRET (siège) & Numéro de TVA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {t("auth.register.siret", "SIRET (siège)")} *
                      </Label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          placeholder="123 456 789 00012"
                          maxLength={18}
                          className="pl-9 h-10 bg-white/80 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm rounded-xl font-mono"
                          disabled={isOtpSent}
                          {...register("siret")}
                        />
                      </div>
                      {errors.siret ? (
                        <p className="text-[11px] text-red-500">{errors.siret.message}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400">14-digit French establishment ID</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {t("auth.register.vatNumber", "Numéro de TVA")} *
                      </Label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          placeholder="FR 12 345678901"
                          maxLength={20}
                          className="pl-9 h-10 bg-white/80 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm rounded-xl font-mono uppercase"
                          disabled={isOtpSent}
                          {...register("vatNumber")}
                        />
                      </div>
                      {errors.vatNumber ? (
                        <p className="text-[11px] text-red-500">{errors.vatNumber.message}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400">Intra-community VAT (e.g. FR 12 345678901)</p>
                      )}
                    </div>
                  </div>

                  {/* Mapbox Address Picker */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {t("auth.register.address", "Workshop Location & Address")} *
                    </Label>
                    <div className="rounded-xl overflow-hidden [&_.MuiOutlinedInput-root]:bg-white/80 dark:[&_.MuiOutlinedInput-root]:bg-white/5 [&_.MuiOutlinedInput-root]:border-slate-300 dark:[&_.MuiOutlinedInput-root]:border-white/10 [&_.MuiInputBase-input]:text-slate-900 dark:[&_.MuiInputBase-input]:text-white">
                      <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                          <MapboxAddressPicker
                            value={field.value}
                            onChange={field.onChange}
                            postalCodeValue={getValues("postalCode")}
                            onPostalCodeChange={(val) =>
                              setValue("postalCode", val, { shouldValidate: true })
                            }
                            error={!!errors.address}
                            helperText={errors.address?.message}
                            disabled={isOtpSent}
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {t("auth.register.password", "Password")} *
                      </Label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-9 pr-9 h-10 bg-white/80 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm rounded-xl"
                          disabled={isOtpSent}
                          {...register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-[11px] text-red-500">{errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {t("auth.register.confirmPassword", "Confirm Password")} *
                      </Label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-9 pr-9 h-10 bg-white/80 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm rounded-xl"
                          disabled={isOtpSent}
                          {...register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-[11px] text-red-500">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Password Rules Indicators */}
                  {!isOtpSent && watchPassword.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {passRequirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px]">
                          <div
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                              req.met
                                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-200 dark:bg-white/10 text-slate-400"
                            }`}
                          >
                            <Check className="w-2.5 h-2.5" />
                          </div>
                          <span
                            className={
                              req.met
                                ? "text-emerald-700 dark:text-emerald-300 font-medium"
                                : "text-slate-500 dark:text-slate-400"
                            }
                          >
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 2: OTP Verification Section */}
                {isOtpSent && (
                  <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                          {t("auth.register.otpCode", "Enter 6-Digit Code")}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Sent to{" "}
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {getValues("email")}
                          </span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsOtpSent(false)}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Info
                      </button>
                    </div>

                    {/* Inline Feedback Alerts for OTP Step */}
                    {registerError && (
                      <Alert
                        variant="destructive"
                        className="py-2.5 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-200"
                      >
                        <AlertDescription className="text-xs font-medium">
                          {registerError}
                        </AlertDescription>
                      </Alert>
                    )}

                    {successMsg && !registerError && (
                      <Alert className="py-2.5 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200">
                        <AlertDescription className="text-xs font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          {successMsg}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* 6-Digit OTP Box Grid */}
                    <div className="flex justify-center gap-2 sm:gap-3 py-2">
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-11 h-13 text-center text-xl font-bold bg-white/80 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all shadow-sm"
                          autoComplete="off"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isVerifying}
                        className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
                        Resend Code
                      </button>
                    </div>
                  </div>
                )}

                {/* Main Action Button */}
                <Button
                  type="submit"
                  disabled={loading || isVerifying}
                  className="w-full h-11 rounded-xl font-semibold gap-2 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  {loading || isVerifying ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {isOtpSent
                          ? t("auth.register.submit", "Complete Registration")
                          : t("auth.register.sendOtp", "Verify Email & Proceed")}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Bottom Login Link */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Already have a workshop account?{" "}
                  <RouterLink
                    to="/login"
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-semibold hover:underline"
                  >
                    {t("auth.register.startLogin", "Sign In to Portal")}
                  </RouterLink>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full py-4 text-center text-xs text-slate-600 dark:text-slate-400 transition-colors">
        © {new Date().getFullYear()} Thriio Automotive Services. All rights reserved.
      </footer>
    </div>
  );
}
