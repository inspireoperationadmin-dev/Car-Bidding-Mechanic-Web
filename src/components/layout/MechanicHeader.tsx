import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, Search, Bell, Radio, User, Settings, LogOut, Globe, Check } from "lucide-react";
import { useAppSelector } from "../../store/hooks";
import { selectUser } from "../../store/slices/authSlice";
import { selectUnreadCount } from "../../store/slices/notificationsSlice";
import { ThemeToggle } from "../theme/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface MechanicHeaderProps {
  isMobile: boolean;
  onMenuClick: () => void;
  onLogoutClick: () => void;
}

export const MechanicHeader: React.FC<MechanicHeaderProps> = ({
  isMobile,
  onMenuClick,
  onLogoutClick,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const unreadCount = useAppSelector(selectUnreadCount);
  const [searchQuery, setSearchQuery] = useState("");

  const currentLang = i18n.language?.startsWith("fr") ? "fr" : "en";

  const toggleLanguage = () => {
    const next = currentLang === "fr" ? "en" : "fr";
    i18n.changeLanguage(next);
    localStorage.setItem("i18nextLng", next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-border/70 bg-card/85 px-4 md:px-8 backdrop-blur-xl transition-all">
      {/* Left: Hamburger & Global Search */}
      <div className="flex items-center gap-3.5">
        {isMobile && (
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <form onSubmit={handleSearchSubmit} className="relative hidden items-center sm:flex">
          <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search available cars, VIN, job ID..."
            className="h-10 w-72 md:w-96 rounded-full border border-border/70 bg-muted/30 pl-10 pr-4 text-xs md:text-sm font-medium text-foreground placeholder:text-muted-foreground/70 transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
          />
        </form>
      </div>

      {/* Right: Connectivity status, Language, Theme, Notifications, Profile */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        {/* Real-time Socket Live Status Badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Bidding Live</span>
        </div>

        {/* Language Switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="inline-flex h-10 px-3 items-center gap-1.5 rounded-xl border border-border/70 bg-card text-xs font-semibold text-foreground hover:bg-accent transition-colors shadow-xs cursor-pointer"
          title="Change language"
        >
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="uppercase tracking-wider">{currentLang}</span>
        </button>

        {/* Theme Toggle Button */}
        <ThemeToggle className="!h-10 !w-10 !rounded-xl" />

        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-card text-foreground transition-all hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-xs cursor-pointer"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-card animate-pulse" />
          )}
        </button>

        <div className="h-6 w-px bg-border/60 mx-0.5" />

        {/* Workshop Profile Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-full p-0.5 outline-none focus:ring-2 focus:ring-primary/40 hover:opacity-90 transition-opacity cursor-pointer">
              <Avatar className="h-9 w-9 border border-border/80 shadow-xs">
                <AvatarImage
                  src={user?.avatarUrl || "/images/default_mechanic_avatar.jpeg"}
                  alt={user?.name}
                />
                <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "ME"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col text-left mr-1">
                <span className="text-xs font-bold text-foreground leading-tight truncate max-w-[130px]">
                  {user?.fullName || user?.name || "Workshop Partner"}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {user?.businessName || "Mechanic"}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none text-foreground">
                  {user?.fullName || user?.name || "Mechanic Partner"}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user?.email || "workshop@thriio.com"}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2 cursor-pointer">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Workshop Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/settings")}
              className="gap-2 cursor-pointer"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={onLogoutClick}
              className="gap-2 text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
