import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Building,
  User,
  Phone,
  FileText,
  Trash2,
  Upload,
  Eye,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { mechanicsApi } from "../api/mechanicsApi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectUser, setUser } from "../store/slices/authSlice";
import MapboxAddressPicker from "../components/common/MapboxAddressPicker";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

export default function EditProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    firstName: "",
    lastName: "",
    phoneNo: "",
    businessAddress: "",
    postalCode: "",
    description: "",
    googlePlaceId: "",
    licenseNumber: "",
    insurancePolicyNo: "",
  });
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [removePhoto, setRemovePhoto] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mechanicsApi.getProfile();
      setFormData({
        businessName: data.businessName || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phoneNo: data.phoneNo || "",
        businessAddress: data.businessAddress || "",
        postalCode: "",
        description: data.description || "",
        googlePlaceId: data.googlePlaceId || "",
        licenseNumber: data.licenseNumber || "",
        insurancePolicyNo: data.insurancePolicyNo || "",
      });
      setPreviewUrl(data.profilePic || null);
    } catch (err: any) {
      console.error("Profile Load Error", err);
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRemovePhoto(false);
    }
    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    setProfilePicFile(null);
    setPreviewUrl(null);
    setRemovePhoto(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const data = new FormData();
      data.append("businessName", formData.businessName);
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("phoneNo", formData.phoneNo);
      data.append("licenseNumber", formData.licenseNumber);
      data.append("insurancePolicyNo", formData.insurancePolicyNo);

      const finalAddress = formData.postalCode
        ? `${formData.businessAddress}${
            formData.businessAddress.includes(formData.postalCode)
              ? ""
              : " (" + formData.postalCode + ")"
          }`
        : formData.businessAddress;

      data.append("businessAddress", finalAddress);
      data.append("description", formData.description);
      if (formData.googlePlaceId) {
        data.append("googlePlaceId", formData.googlePlaceId);
      }

      if (profilePicFile) {
        data.append("profilePic", profilePicFile);
      } else if (removePhoto) {
        data.append("removeProfilePic", "true");
      }

      const updated = await mechanicsApi.updateProfile(data);

      if (currentUser) {
        dispatch(
          setUser({
            ...currentUser,
            name: updated.firstName || currentUser.name,
            fullName:
              updated.firstName && updated.lastName
                ? `${updated.firstName} ${updated.lastName}`
                : updated.businessName || currentUser.fullName,
            avatarUrl: updated.profilePic || currentUser.avatarUrl,
          })
        );
      }

      setSuccess(true);
      setTimeout(() => navigate("/profile"), 1200);
    } catch (err: any) {
      console.error("Save Error", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">
          {t("common.loading", "Loading profile details...")}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/profile")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("profile.editDialog.backToProfile", "Back to Profile")}</span>
          </Button>
          <div className="h-4 w-px bg-border/60" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t("profile.editDialog.title", "Edit Workshop Profile")}
          </h1>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-sm">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t("common.saving", "Saving Changes...")}</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{t("common.save", "Save Changes")}</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("common.error", "Error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>{t("common.success", "Success")}</AlertTitle>
          <AlertDescription>
            {t("settings.saveSuccess", "Profile updated successfully! Redirecting...")}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Avatar & Primary Identity */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                {t("profile.avatarSection", "Profile Photo & Identity")}
              </CardTitle>
              <CardDescription className="text-xs">
                Your workshop avatar is visible to customers across active bids.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              {/* Avatar Preview */}
              <div className="flex flex-col items-center text-center">
                <div
                  onClick={() => previewUrl && setViewerOpen(true)}
                  className={`relative group rounded-full p-1 border-2 border-dashed border-border transition-colors ${
                    previewUrl ? "cursor-pointer hover:border-primary" : ""
                  }`}
                >
                  <Avatar className="w-28 h-28 border-2 border-background shadow-md">
                    <AvatarImage src={previewUrl || ""} alt="Profile preview" />
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                      {formData.firstName ? formData.firstName[0] : <User className="w-12 h-12" />}
                    </AvatarFallback>
                  </Avatar>

                  {previewUrl && (
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Eye className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <input
                    ref={photoInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => photoInputRef.current?.click()}
                    className="h-8 px-3 text-xs gap-1.5 cursor-pointer font-medium"
                  >
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    <span>{t("profile.editDialog.changePhoto", "Upload Photo")}</span>
                  </Button>

                  {previewUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      <span>{t("common.remove", "Remove")}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4 pt-2 border-t border-border/40">
                {/* Business Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="businessName" className="text-xs font-medium text-foreground">
                    {t("profile.businessName", "Company / Garage Name *")}
                  </Label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="e.g. Apex Performance Auto"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                {/* Contact Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-medium text-foreground">
                    {t("profile.contactName", "Contact Representative Name *")}
                  </Label>
                  <div className="relative">
                    <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter primary contact name"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="phoneNo" className="text-xs font-medium text-foreground">
                    {t("profile.phone", "Phone Number *")}
                  </Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="phoneNo"
                      name="phoneNo"
                      value={formData.phoneNo}
                      onChange={handleChange}
                      placeholder="+33 6 12 34 56 78"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                {/* Google Place ID */}
                <div className="space-y-1.5 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="googlePlaceId" className="text-xs font-medium text-foreground">
                      Google Place ID
                    </Label>
                    <Badge variant="outline" className="text-[10px] py-0">
                      Optional
                    </Badge>
                  </div>
                  <Input
                    id="googlePlaceId"
                    name="googlePlaceId"
                    value={formData.googlePlaceId}
                    onChange={handleChange}
                    placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Connect your Google Maps Business profile to display verified reviews.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Location & Bio */}
        <div className="lg:col-span-7 space-y-6">
          {/* Location Picker */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{t("profile.location", "Business Location & Map")}</span>
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  Interactive Map
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Accurate address helps match nearby drivers within your bidding radius.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <MapboxAddressPicker
                value={formData.businessAddress}
                onChange={(addr) => setFormData((prev) => ({ ...prev, businessAddress: addr }))}
                onPostalCodeChange={(code) =>
                  setFormData((prev) => ({ ...prev, postalCode: code }))
                }
                postalCodeValue={formData.postalCode}
              />
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>{t("profile.description", "Workshop Overview & Specializations")}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Describe your certifications, garage equipment, warranty offers, and repair
                specializations.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detail your workshop experience, repair specializations, diagnostic tools, and customer satisfaction commitments..."
                rows={6}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Business Credentials & Compliance */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{t("profile.businessDetails.title", "Business Credentials & Verification")}</span>
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  Official Numbers
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {t(
                  "profile.credentialsDesc",
                  "Official registration numbers and active garage insurance policy"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="licenseNumber" className="text-xs font-medium text-foreground">
                  {t("profile.businessDetails.license", "License Number / SIRET / Trade ID")}
                </Label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="e.g. FR-893420194"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="insurancePolicyNo" className="text-xs font-medium text-foreground">
                  {t("profile.businessDetails.insurance", "Insurance Policy Number")}
                </Label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="insurancePolicyNo"
                    name="insurancePolicyNo"
                    value={formData.insurancePolicyNo}
                    onChange={handleChange}
                    placeholder="e.g. POL-AXA-2026-99124"
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Lightbox Viewer Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black/95 border-none">
          <div className="relative flex items-center justify-center min-h-[50vh] p-4">
            <button
              onClick={() => setViewerOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewUrl || ""}
              alt="Profile Preview"
              className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
