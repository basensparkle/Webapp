import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'nl' ? 'en' : 'nl';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="font-semibold uppercase hover:text-primary transition-colors"
    >
      {i18n.language === 'nl' ? 'EN' : 'NL'}
    </Button>
  );
}
