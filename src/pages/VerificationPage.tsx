import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Wrench,
  ShieldCheck,
  Building2,
  CreditCard,
  UploadCloud,
  CheckCircle2,
  Clock,
  X,
  FileText,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
  Trash2,
  RefreshCw,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

// Redux Imports
import { useDispatch, useSelector } from "react-redux";
import { submitVerificationAsync, resetStatus } from "../store/slices/mechanicSlice";
import { setUser, selectUser } from "../store/slices/authSlice";
import type { AppDispatch, RootState } from "../store/store";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ThemeToggle } from "../components/theme/ThemeToggle";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { mechanicsApi } from "../api/mechanicsApi";

const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_DOCUMENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

interface DocumentUploadCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  file: File | null;
  onPick: (file: File | null) => void;
  previewUrl: string | null;
  disabled: boolean;
  required?: boolean;
  onError?: (msg: string | null) => void;
}

const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  title,
  description,
  icon,
  file,
  onPick,
  previewUrl,
  disabled,
  required = true,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isImage = file?.type?.startsWith("image/") ?? false;
  const isPdf = file?.type === "application/pdf" || file?.name?.toLowerCase().endsWith(".pdf");

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleValidateAndPick = (selectedFile: File) => {
    if (selectedFile.size > MAX_DOCUMENT_SIZE) {
      onError?.("File size exceeds 5MB limit. Please upload a file under 5MB.");
      return;
    }

    const isPdfFile =
      selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf");
    const isAllowed = ALLOWED_DOCUMENT_TYPES.includes(selectedFile.type) || isPdfFile;

    if (!isAllowed) {
      onError?.("Invalid file format. Only JPG, PNG, WEBP, and PDF documents are supported.");
      return;
    }

    onError?.(null);
    onPick(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleValidateAndPick(droppedFile);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl border transition-all duration-200 p-5 ${
        isDragging
          ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
          : file
            ? "bg-card/90 border-emerald-500/40 shadow-sm"
            : "bg-card/50 border-border/70 hover:border-primary/40"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        disabled={disabled}
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) {
            handleValidateAndPick(selected);
          }
          e.target.value = "";
        }}
      />
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Title & Icon Header */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              file
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-primary/10 text-primary"
            }`}
          >
            {file ? <CheckCircle2 className="w-5 h-5" /> : icon}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                {title}
                {required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              {file ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                  Ready
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Required
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>

        {/* Action Button / File Chooser */}
        <div className="flex items-center gap-2 self-end sm:self-start">
          {file ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => onPick(null)}
              className="text-xs h-8 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-border cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs h-8 gap-1.5 cursor-pointer bg-background hover:bg-accent border-border font-medium"
            >
              <UploadCloud className="w-3.5 h-3.5 text-primary" />
              Upload File
            </Button>
          )}
        </div>
      </div>

      {/* Selected File Details / Preview Bar */}
      {file && (
        <div className="mt-4 pt-3.5 border-t border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
              {isPdf ? (
                <FileText className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            <div className="truncate text-xs">
              <p className="font-semibold text-foreground truncate">{file.name}</p>
              <p className="text-[11px] text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>

          {previewUrl && isImage && (
            <div className="w-16 h-12 rounded-lg overflow-hidden border border-border/80 shrink-0 self-end sm:self-auto bg-muted">
              <img src={previewUrl} alt="Document preview" className="w-full h-full object-cover" />
            </div>
          )}

          {previewUrl && isPdf && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 self-end sm:self-auto px-2.5 py-1 rounded-lg border border-border/80 bg-background hover:bg-muted transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview PDF</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default function Verification() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector(selectUser);
  const { t, i18n } = useTranslation();

  const isStandalone = location.pathname === "/verification";

  const { loading, error, status: reduxStatus } = useSelector((state: RootState) => state.mechanic);

  const [businessLicense, setBusinessLicense] = useState<File | null>(null);
  const [insuranceCert, setInsuranceCert] = useState<File | null>(null);
  const [governmentId, setGovernmentId] = useState<File | null>(null);
  const [licenseNumber, setLicenseNumber] = useState<string>("");
  const [insurancePolicyNo, setInsurancePolicyNo] = useState<string>("");
  const [localSuccessMsg, setLocalSuccessMsg] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  // Prefill existing license & insurance numbers if on record
  useEffect(() => {
    mechanicsApi
      .getProfile()
      .then((profile) => {
        if (profile?.licenseNumber) setLicenseNumber(profile.licenseNumber);
        if (profile?.insurancePolicyNo) setInsurancePolicyNo(profile.insurancePolicyNo);
      })
      .catch(() => {});
  }, []);

  // Redirect if already approved
  useEffect(() => {
    if (authUser?.verificationStatus === "APPROVED") {
      navigate("/dashboard", { replace: true });
    }
  }, [authUser, navigate]);

  // Reset local pending state if user logged in but hasn't uploaded
  useEffect(() => {
    if (authUser && !authUser.documentsUploaded && reduxStatus === "PENDING") {
      dispatch(resetStatus());
    }
  }, [authUser, reduxStatus, dispatch]);

  const businessPreview = useMemo(
    () => (businessLicense ? URL.createObjectURL(businessLicense) : null),
    [businessLicense]
  );
  const insurancePreview = useMemo(
    () => (insuranceCert ? URL.createObjectURL(insuranceCert) : null),
    [insuranceCert]
  );
  const govPreview = useMemo(
    () => (governmentId ? URL.createObjectURL(governmentId) : null),
    [governmentId]
  );

  const isPending =
    (authUser?.verificationStatus === "PENDING" && authUser?.documentsUploaded) ||
    reduxStatus === "PENDING";

  const currentLang = i18n.language || "en";
  const toggleLanguage = () => {
    const next = currentLang.startsWith("en") ? "fr" : "en";
    i18n.changeLanguage(next);
  };

  const handleSkip = () => {
    sessionStorage.setItem("hasShownVerificationPrompt", "true");
    localStorage.setItem("hasSkippedVerification", "true");
    navigate("/dashboard");
  };

  const validate = () => {
    if (!businessLicense) return "Business registration / license is required.";
    if (!insuranceCert) return "Liability insurance certificate is required.";
    if (!governmentId) return "Government-issued photo ID is required.";

    if (businessLicense.size > MAX_DOCUMENT_SIZE) {
      return "Business license exceeds 5MB limit. Please upload a smaller file.";
    }
    if (insuranceCert.size > MAX_DOCUMENT_SIZE) {
      return "Insurance certificate exceeds 5MB limit. Please upload a smaller file.";
    }
    if (governmentId.size > MAX_DOCUMENT_SIZE) {
      return "Government ID exceeds 5MB limit. Please upload a smaller file.";
    }

    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    setLocalSuccessMsg(null);

    const validationError = validate();
    if (validationError) {
      setClientError(validationError);
      return;
    }

    const formData = new FormData();
    if (businessLicense) formData.append("businessLicense", businessLicense);
    if (insuranceCert) formData.append("insuranceCert", insuranceCert);
    if (governmentId) formData.append("govtId", governmentId);
    if (licenseNumber) formData.append("licenseNumber", licenseNumber.trim());
    if (insurancePolicyNo) formData.append("insurancePolicyNo", insurancePolicyNo.trim());

    try {
      await dispatch(submitVerificationAsync(formData)).unwrap();
      localStorage.removeItem("hasSkippedVerification");
      if (authUser) {
        dispatch(
          setUser({
            ...authUser,
            verificationStatus: "PENDING",
            documentsUploaded: true,
          })
        );
      }
      setLocalSuccessMsg(
        t("auth.verification.success", "Verification documents submitted successfully!")
      );
    } catch (err: any) {
      setClientError(err || "Failed to submit verification documents");
    }
  };

  const content = (
    <div className="space-y-6 max-w-3xl mx-auto w-full">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-primary" />
            {t("auth.verification.title", "Workshop Verification")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(
              "auth.verification.subtitle",
              "Verify your automotive workshop credentials to unlock verified bidding."
            )}
          </p>
        </div>

        <div>
          {isPending ? (
            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 gap-1.5 py-1 px-3">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              In Review
            </Badge>
          ) : authUser?.verificationStatus === "APPROVED" ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 gap-1.5 py-1 px-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Partner
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 py-1 px-3">
              <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
              Pending Submission
            </Badge>
          )}
        </div>
      </div>

      {/* Alerts */}
      {(clientError || error) && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{clientError || error}</AlertDescription>
        </Alert>
      )}

      {localSuccessMsg && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <AlertDescription>{localSuccessMsg}</AlertDescription>
        </Alert>
      )}

      {/* Main Condition: PENDING VIEW */}
      {isPending ? (
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm overflow-hidden text-center p-8 sm:p-10 shadow-lg">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl overflow-hidden shadow-xl border border-border/60 bg-muted">
            <img
              src="/images/badge_verified_shield.jpeg"
              alt="Verification Shield"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-3">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Documents Under Review</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t("auth.verification.pendingTitle", "Verification in Progress")}
          </h2>

          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2 leading-relaxed">
            {t(
              "auth.verification.pendingMessage",
              "Thank you for submitting your workshop documents. Our verification team is reviewing your credentials to ensure marketplace safety."
            )}
          </p>

          <div className="my-6 p-4 rounded-2xl bg-muted/40 border border-border/60 max-w-md mx-auto text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground font-medium">
              <span>Estimated Review Time:</span>
              <span className="font-semibold text-foreground">Within 24–48 Hours</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground font-medium">
              <span>Notification Method:</span>
              <span className="font-semibold text-foreground">Email & Dashboard Alert</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground font-medium">
              <span>What Unlocks Next:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Full Customer Bidding
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="default"
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto font-semibold gap-2"
            >
              <span>{t("auth.verification.returnToDashboard", "Return to Dashboard")}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/portfolio")}
              className="w-full sm:w-auto text-xs"
            >
              Showcase Portfolio Work
            </Button>
          </div>
        </Card>
      ) : (
        /* SUBMISSION FORM VIEW */
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Why Verification Matters Banner */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">
                    Why verify your workshop?
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Verified mechanics gain a certified badge on all bids, rank higher in customer
                    comparisons, and unlock direct appointment booking with vehicle owners.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Official Registration & Policy Numbers */}
          <Card className="border-border/70 bg-card/60 shadow-2xs">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                <FileText className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {t("profile.businessDetails.title", "Business Credentials & Policy Numbers")}
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="licenseNumber" className="text-xs font-medium text-foreground">
                    {t("profile.businessDetails.license", "License / Registration Number")}
                  </Label>
                  <Input
                    id="licenseNumber"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. FR-893420194"
                    className="h-9 text-xs"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="insurancePolicyNo" className="text-xs font-medium text-foreground">
                    {t("profile.businessDetails.insurance", "Insurance Policy Number")}
                  </Label>
                  <Input
                    id="insurancePolicyNo"
                    value={insurancePolicyNo}
                    onChange={(e) => setInsurancePolicyNo(e.target.value)}
                    placeholder="e.g. POL-AXA-2026-99124"
                    className="h-9 text-xs"
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Upload Sections */}
          <div className="space-y-4">
            <DocumentUploadCard
              title={t("auth.verification.businessLicense", "Commercial Business Registration")}
              description="Official business registration (e.g. SIRET, Kbis, or Trade License). Supports PDF, JPG, PNG (Max 5MB)."
              icon={<Building2 className="w-5 h-5" />}
              file={businessLicense}
              onPick={setBusinessLicense}
              previewUrl={businessPreview}
              disabled={loading}
              onError={setClientError}
              required
            />

            <DocumentUploadCard
              title={t("auth.verification.insuranceCert", "Professional Liability Insurance")}
              description="Valid automotive workshop liability insurance policy. Supports PDF, JPG, PNG (Max 5MB)."
              icon={<ShieldCheck className="w-5 h-5" />}
              file={insuranceCert}
              onPick={setInsuranceCert}
              previewUrl={insurancePreview}
              disabled={loading}
              onError={setClientError}
              required
            />

            <DocumentUploadCard
              title={t("auth.verification.govId", "Government-Issued Photo ID")}
              description="Passport, National ID card, or Driving License. Supports PDF, JPG, PNG (Max 5MB)."
              icon={<CreditCard className="w-5 h-5" />}
              file={governmentId}
              onPick={setGovernmentId}
              previewUrl={govPreview}
              disabled={loading}
              onError={setClientError}
              required
            />
          </div>

          {/* Privacy Guarantee */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>
              All uploaded documents are encrypted and securely stored strictly for compliance
              verification.
            </span>
          </div>

          {/* Form Actions */}
          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-500/20 gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Documents...</span>
                </>
              ) : (
                <>
                  <span>{t("auth.verification.submit", "Submit Documents for Verification")}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={loading}
              className="w-full text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {t("auth.verification.skip", "Skip for now and continue to Dashboard")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );

  // If standalone onboarding route (/verification), render with full-bleed container and header matching Login/Register
  if (isStandalone) {
    return (
      <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden font-sans bg-background">
        {/* Subtle Background Backdrop */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none"
          style={{ backgroundImage: "url('/images/auth_hero_workshop.jpeg')" }}
        />
        <div className="fixed inset-0 bg-background/90 backdrop-blur-[2px] pointer-events-none" />

        {/* Top Navbar */}
        <header className="relative z-20 w-full px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-foreground">THRIIO</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex h-9 px-3 items-center gap-1.5 rounded-xl border border-border bg-card/80 backdrop-blur-md text-xs font-semibold text-foreground hover:bg-accent transition-colors shadow-sm"
              title="Switch Language"
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="uppercase">{currentLang}</span>
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Center Content */}
        <main className="relative z-20 flex-1 px-4 py-8 flex items-center justify-center">
          {content}
        </main>

        {/* Footer */}
        <footer className="relative z-20 w-full py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Thriio Automotive Services. All rights reserved.
        </footer>
      </div>
    );
  }

  // Inside Dashboard (e.g. /account-verification with Sidebar & Header)
  return <div className="py-2 pb-12">{content}</div>;
}
