import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  ShieldCheck,
  Building2,
  CreditCard,
  UploadCloud,
  Trash2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { mechanicsApi } from "../../api/mechanicsApi";
import { useAppDispatch } from "../../store/hooks";
import { setUser } from "../../store/slices/authSlice";
import type { User } from "../../store/slices/authSlice";
import { useTranslation } from "react-i18next";

interface VerificationModalProps {
  open: boolean;
  user?: User | null;
  onClose: () => void;
}

const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_DOCUMENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

interface DocRowProps {
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  file: File | null;
  submitting: boolean;
  onPick: (file: File | null) => void;
  onRemove: () => void;
  uploadText: string;
  onError?: (msg: string | null) => void;
}

const VerificationModalDocRow: React.FC<DocRowProps> = ({
  label,
  desc,
  icon: Icon,
  file,
  submitting,
  onPick,
  onRemove,
  uploadText,
  onError,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all gap-3 ${
        file
          ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10"
          : "border-border/80 bg-background/50 hover:border-border hover:bg-muted/20"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        disabled={submitting}
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) {
            handleValidateAndPick(selected);
          }
          e.target.value = "";
        }}
      />
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
            file
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-muted border-border/80 text-muted-foreground"
          }`}
        >
          {file ? <FileCheck className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground truncate">{label}</span>
            {file ? (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-medium py-0 px-1.5 h-4">
                Ready
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] text-muted-foreground py-0 px-1.5 h-4"
              >
                Required
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {file ? file.name : desc}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        {file ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={submitting}
            onClick={onRemove}
            className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Remove</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={submitting}
            onClick={() => inputRef.current?.click()}
            className="h-7 px-2.5 text-xs gap-1.5 bg-background hover:bg-accent border-border font-medium cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-primary" />
            <span>{uploadText}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export const VerificationRequireModal: React.FC<VerificationModalProps> = ({
  open,
  user,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [files, setFiles] = useState<{
    businessLicense: File | null;
    insuranceCert: File | null;
    govtId: File | null;
  }>({
    businessLicense: null,
    insuranceCert: null,
    govtId: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [field]: e.target.files![0] }));
      setError(null);
    }
  };

  const handleRemoveFile = (field: keyof typeof files) => {
    setFiles((prev) => ({ ...prev, [field]: null }));
  };

  const handleSkip = () => {
    sessionStorage.setItem("hasShownVerificationPrompt", "true");
    localStorage.setItem("hasSkippedVerification", "true");
    onClose();
  };

  const handleSubmit = async () => {
    if (!files.businessLicense || !files.insuranceCert || !files.govtId) {
      setError(t("layout.verification.errorRequired", "All 3 documents are required."));
      return;
    }

    if (
      files.businessLicense.size > MAX_DOCUMENT_SIZE ||
      files.insuranceCert.size > MAX_DOCUMENT_SIZE ||
      files.govtId.size > MAX_DOCUMENT_SIZE
    ) {
      setError("One or more files exceed the 5MB limit. Please upload files under 5MB.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("businessLicense", files.businessLicense);
      formData.append("insuranceCert", files.insuranceCert);
      formData.append("govtId", files.govtId);

      await mechanicsApi.submitVerification(formData);

      localStorage.removeItem("hasSkippedVerification");

      if (user) {
        dispatch(
          setUser({
            ...user,
            verificationStatus: "PENDING",
            documentsUploaded: true,
          })
        );
      }

      onClose();
    } catch (err) {
      console.error("Verification submit error:", err);
      setError(
        t("layout.verification.errorGeneric", "Failed to upload documents. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const docConfig = [
    {
      key: "businessLicense" as const,
      label: t("layout.verification.businessLicense", "Business License"),
      desc: "Business registration or SIRET (PDF, JPG, PNG under 5MB)",
      icon: Building2,
    },
    {
      key: "insuranceCert" as const,
      label: t("layout.verification.insurance", "Insurance Certificate"),
      desc: "Workshop liability insurance (PDF, JPG, PNG under 5MB)",
      icon: ShieldCheck,
    },
    {
      key: "govtId" as const,
      label: t("layout.verification.govtId", "Government ID"),
      desc: "Passport, ID card, or license (PDF, JPG, PNG under 5MB)",
      icon: CreditCard,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleSkip()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl rounded-2xl">
        {/* Header with Icon */}
        <div className="px-6 pt-6 pb-4 border-b border-border/50 bg-muted/20">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  {t("layout.verification.title", "Identity Verification Required")}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {t(
                    "layout.verification.desc",
                    "To access jobs, please upload the following documents (PDF, JPG, PNG - Max 5MB each). Your address is fixed from registration."
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-3.5">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-destructive/10 border border-destructive/20 text-destructive animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {docConfig.map((doc) => (
              <VerificationModalDocRow
                key={doc.key}
                label={doc.label}
                desc={doc.desc}
                icon={doc.icon}
                file={files[doc.key]}
                submitting={submitting}
                onError={setError}
                onPick={(file) => {
                  setFiles((prev) => ({ ...prev, [doc.key]: file }));
                  setError(null);
                }}
                onRemove={() => handleRemoveFile(doc.key)}
                uploadText={t("layout.verification.uploadBtn", "Upload")}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-muted/20 border-t border-border/50 flex flex-row items-center justify-between sm:justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={submitting}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {t("layout.verification.skip", "Skip for now")}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={submitting}
            className="text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-500/20 gap-1.5 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t("layout.verification.submitting", "Uploading...")}</span>
              </>
            ) : (
              <span>{t("layout.verification.submit", "Submit Verification")}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
