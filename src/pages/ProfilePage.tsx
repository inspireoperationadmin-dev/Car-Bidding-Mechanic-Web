import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Clock,
  Pencil,
  FileText,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Settings,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { type MechanicProfile, mechanicsApi } from "../api/mechanicsApi";
// Redux
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectUser, setUser } from "../store/slices/authSlice";
import { GoogleReviewsSection } from "../components/profile/GoogleReviewsSection";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { useTranslation } from "react-i18next";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<MechanicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mechanicsApi.getProfile();
      setProfile(data);

      // Sync with global auth store
      if (currentUser) {
        dispatch(
          setUser({
            ...currentUser,
            name: data.firstName || currentUser.name,
            fullName:
              data.firstName && data.lastName
                ? `${data.firstName} ${data.lastName}`
                : data.businessName || currentUser.fullName,
            avatarUrl: data.profilePic || currentUser.avatarUrl,
          })
        );
      }
    } catch (err: any) {
      console.error("Profile Load Error", err);
      setError(err.response?.data?.message || err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">
          {t("common.loading", "Loading profile...")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>{t("common.error", "Error")}</AlertTitle>
          <AlertDescription className="mt-1">{error}</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-end">
          <Button onClick={loadProfile} variant="outline">
            {t("common.retry", "Retry")}
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl text-center">
        <h2 className="text-xl font-semibold mb-2">{t("profile.notFound", "Profile not found")}</h2>
        <Button onClick={loadProfile} variant="outline">
          {t("common.retry", "Retry")}
        </Button>
      </div>
    );
  }

  const isApproved = profile.verificationStatus === "APPROVED";
  const isPending = profile.verificationStatus === "PENDING";

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Identity & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Profile Card */}
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary/15 via-primary/5 to-background border-b border-border/40" />
            <CardContent className="pt-0 relative px-6 pb-6">
              <div className="flex flex-col items-center text-center -mt-12 mb-4">
                <Avatar className="w-24 h-24 border-4 border-background shadow-md">
                  <AvatarImage src={profile.profilePic} alt={profile.businessName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                    {profile.firstName ? profile.firstName[0] : <User className="w-10 h-10" />}
                  </AvatarFallback>
                </Avatar>

                <h2 className="text-xl font-bold text-foreground mt-3">
                  {profile.businessName || `${profile.firstName} ${profile.lastName}`}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : t("role.mechanic", "Certified Mechanic")}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <Badge
                    variant={isApproved ? "default" : isPending ? "secondary" : "destructive"}
                    className={`gap-1 px-3 py-1 font-medium ${
                      isApproved
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : isPending
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : ""
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{profile.verificationStatus}</span>
                  </Badge>

                  <Badge
                    variant="outline"
                    className={
                      profile.isActive
                        ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20"
                        : "text-muted-foreground"
                    }
                  >
                    {profile.isActive
                      ? t("profile.active", "Active")
                      : t("profile.inactive", "Inactive")}
                  </Badge>
                </div>
              </div>

              {/* Contact Details List */}
              <div className="space-y-3 pt-4 border-t border-border/50 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate text-foreground font-medium">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground font-medium">{profile.phoneNo || "N/A"}</span>
                </div>
                <div className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground leading-snug">
                    {profile.businessAddress ||
                      t("profile.businessDetails.notProvided", "No address registered")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-border/50 space-y-2">
                <Button
                  onClick={() => navigate("/profile/edit")}
                  variant="outline"
                  className="w-full justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>{t("profile.editInfo", "Edit Workshop Details")}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Button>

                <Button
                  onClick={() => navigate("/work-history")}
                  variant="ghost"
                  className="w-full justify-between group hover:bg-muted/50"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>{t("nav.workHistory", "View Work History")}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Button>

                {!isApproved && (
                  <Button
                    onClick={() => navigate("/verification")}
                    variant="outline"
                    className="w-full justify-between text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t("verification.completeVerification", "Complete Verification")}</span>
                    </span>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Availability & Work Status Card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{t("profile.availability.title", "Job Availability")}</span>
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {profile.isActive
                    ? t("profile.active", "Open for Bids")
                    : t("profile.inactive", "Paused")}
                </Badge>
              </div>
              <CardDescription className="text-xs mt-1">
                {t(
                  "profile.availability.description",
                  "Manage your working hours, notification triggers, and bidding availability."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/settings")}
                className="w-full flex items-center justify-center gap-2 shadow-xs"
              >
                <Settings className="w-4 h-4" />
                <span>{t("profile.availability.manage", "Manage Availability in Settings")}</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Business Credentials, Description & Reviews (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Workshop Description */}
          {profile.description && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>{t("profile.aboutWorkshop", "About Workshop")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {profile.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Business Credentials & Compliance */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  <span>
                    {t("profile.businessDetails.title", "Business Credentials & Verification")}
                  </span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/profile/edit")}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" />
                  <span>{t("common.edit", "Edit")}</span>
                </Button>
              </div>
              <CardDescription className="text-xs">
                {t(
                  "profile.credentialsDesc",
                  "Official registration numbers and active garage insurance policy"
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg border border-border/50 bg-muted/20">
                  <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span>{t("profile.businessDetails.license", "License Number")}</span>
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {profile.licenseNumber || (
                      <span className="text-muted-foreground font-normal italic">
                        {t("profile.businessDetails.notProvided", "Not provided")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-border/50 bg-muted/20">
                  <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t("profile.businessDetails.insurance", "Insurance Policy")}</span>
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {profile.insurancePolicyNo || (
                      <span className="text-muted-foreground font-normal italic">
                        {t("profile.businessDetails.notProvided", "Not provided")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Google Business Reviews Section */}
          <GoogleReviewsSection
            profile={profile}
            onProfileUpdated={(updated) => setProfile(updated)}
          />
        </div>
      </div>
    </div>
  );
}
