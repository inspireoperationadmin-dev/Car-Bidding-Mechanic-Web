import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Check, Globe } from "lucide-react";
import { cn } from "../../lib/utils";

interface LanguageSelectorProps {
  currentLanguage?: string;
  onLanguageChange: (lang: string) => void;
}

export const LanguageSelector = ({
  currentLanguage = "en",
  onLanguageChange,
}: LanguageSelectorProps) => {
  const [selectedLang, setSelectedLang] = useState(currentLanguage);
  const { t } = useTranslation();

  useEffect(() => {
    setSelectedLang(currentLanguage);
  }, [currentLanguage]);

  const handleSelect = (lang: string) => {
    setSelectedLang(lang);
    onLanguageChange(lang);
  };

  const languages = [
    { code: "en", label: "English", sub: "Default platform language", flag: "🇬🇧" },
    { code: "fr", label: "Français", sub: "Langue de la plateforme", flag: "🇫🇷" },
  ];

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5 text-primary" />
        <span>{t("settings.language", "Language")}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {languages.map((lang) => {
          const isSelected = selectedLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 text-foreground shadow-xs ring-1 ring-primary/30"
                  : "border-border/60 bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg leading-none">{lang.flag}</span>
                <div>
                  <div
                    className={cn(
                      "text-sm font-medium leading-none",
                      isSelected ? "text-foreground font-semibold" : ""
                    )}
                  >
                    {lang.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 leading-none">
                    {lang.sub}
                  </div>
                </div>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
