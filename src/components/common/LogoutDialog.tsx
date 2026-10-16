import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { AlertTriangle, LogOut } from "lucide-react";

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutDialog: React.FC<LogoutDialogProps> = ({ open, onClose, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader className="gap-2">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto sm:mx-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {t("common.logout.title", "Logout Confirmation")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t(
              "common.logout.message",
              "Are you sure you want to log out? Any unsaved bids will be saved in your drafts."
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            {t("common.logout.cancel", "Cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="gap-2">
            <LogOut className="w-4 h-4" />
            <span>{t("common.logout.confirm", "Logout")}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutDialog;
