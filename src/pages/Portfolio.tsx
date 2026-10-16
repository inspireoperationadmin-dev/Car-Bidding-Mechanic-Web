import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { mechanicsApi, type PortfolioItem } from "../api/mechanicsApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";

const PortfolioPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Modern Toast state
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message: string, severity: "success" | "error" = "success") => {
    setToast({ open: true, message, severity });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 3500);
  };

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mechanicsApi.getPortfolio();
      setItems(data || []);
    } catch (error) {
      console.error("Failed to load portfolio:", error);
      showToast(t("common.errorBoundary.subtitle", "Failed to load portfolio"), "error");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast(t("portfolio.errorFile", "File size exceeds 5MB limit"), "error");
      return;
    }

    if (items.length >= 2) {
      showToast(t("portfolio.errorLimit", "Maximum of 2 portfolio photos allowed"), "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const newItem = await mechanicsApi.uploadPortfolioPhoto(formData);
      setItems((prev) => [newItem, ...prev]);
      showToast(t("portfolio.uploadSuccess", "Photo uploaded successfully!"), "success");
    } catch (error: any) {
      console.error("Upload failed:", error);
      showToast(error.response?.data?.message || t("common.errorBoundary.subtitle"), "error");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await mechanicsApi.deletePortfolioPhoto(itemToDelete);
      setItems((prev) => prev.filter((item) => item.id !== itemToDelete));
      showToast(t("portfolio.deleteSuccess", "Photo removed successfully"), "success");
    } catch (error: any) {
      console.error("Delete failed:", error);
      showToast(error.response?.data?.message || "Failed to delete photo", "error");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl">
      {/* Toast Notification */}
      {toast.open && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-card border border-border shadow-lg text-foreground text-sm font-medium">
            {toast.severity === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast((prev) => ({ ...prev, open: false }))}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Banner / Card */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>{t("portfolio.uploadTitle", "Upload Workshop Photos")}</span>
            </CardTitle>
            <Badge variant="outline" className="text-xs font-mono">
              {items.length} / 2 {t("portfolio.slotsUsed", "Slots Used")}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            {t(
              "portfolio.uploadHint",
              "Upload up to 2 high-resolution photos (max 5MB each). Supported formats: JPG, PNG, WEBP."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-dashed border-border/80 bg-muted/20 gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {items.length >= 2
                    ? t("portfolio.limitReached", "Photo limit reached (2/2)")
                    : t("portfolio.addPhoto", "Add a new workshop or repair photo")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {items.length >= 2
                    ? t("portfolio.removeToUpload", "Delete an existing photo to upload a new one")
                    : t(
                        "portfolio.guidelines",
                        "High quality garage, paint booth, or finished vehicle repair images"
                      )}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={items.length >= 2 || uploading}
              />
              <Button
                type="button"
                disabled={items.length >= 2 || uploading}
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 cursor-pointer shadow-xs"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("common.uploading", "Uploading...")}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>{t("portfolio.uploadButton", "Upload Photo")}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span>{t("portfolio.galleryTitle", "Current Portfolio")}</span>
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPortfolio}
            disabled={loading}
            className="gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{t("common.refresh", "Refresh")}</span>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-muted/40 animate-pulse border border-border/40"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="border-border/60 p-8 text-center bg-muted/10">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              {t("portfolio.noPhotosTitle", "No Portfolio Photos Yet")}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
              {t(
                "portfolio.noPhotosDesc",
                "Upload images of your repair shop, specialized tools, and successful automotive projects to attract customers."
              )}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden border-border/60 group shadow-xs">
                <div className="relative aspect-video bg-black/5 overflow-hidden">
                  <img
                    src={item.photoUrl}
                    alt="Portfolio item"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <span className="text-xs text-white/90">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(item.id)}
                      className="h-8 px-2.5 gap-1.5 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-xs">{t("common.delete", "Delete")}</span>
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Photo ID #{item.id}</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10"
                  >
                    Published
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span>{t("portfolio.confirmDeleteTitle", "Remove Portfolio Photo?")}</span>
            </DialogTitle>
            <DialogDescription>
              {t(
                "portfolio.confirmDeleteDesc",
                "This photo will be permanently deleted from your public workshop profile."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("common.delete", "Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioPage;
