import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const { data: footerMenu = [] } = trpc.menu.getByLocation.useQuery({ location: "footer" });
  const { data: settings = [] } = trpc.settings.list.useQuery();

  const getSettingValue = (key: string) => {
    const setting = settings.find(s => s.key === key);
    return setting ? JSON.parse(setting.value) : '';
  };

  const companyAddress = getSettingValue('company_address');
  const companyPhone = getSettingValue('company_phone');
  const companyEmail = getSettingValue('company_email');

  return (
    <footer className="border-t border-border/40 bg-card/50 backdrop-blur">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">{t('footer.company')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {footerMenu.map((item) => (
                <li key={item.id}>
                  {item.isExternal ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {currentLang === 'nl' ? item.labelNL : item.labelEN}
                    </a>
                  ) : (
                    <Link href={item.url}>
                      <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {currentLang === 'nl' ? item.labelNL : item.labelEN}
                      </a>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">{t('footer.contactInfo')}</h3>
            <ul className="space-y-3">
              {companyAddress && (
                <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                  <MapPin size={16} className="mt-1 flex-shrink-0 text-primary" />
                  <span>{companyAddress}</span>
                </li>
              )}
              {companyPhone && (
                <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone size={16} className="flex-shrink-0 text-primary" />
                  <a href={`tel:${companyPhone}`} className="hover:text-primary transition-colors">
                    {companyPhone}
                  </a>
                </li>
              )}
              {companyEmail && (
                <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail size={16} className="flex-shrink-0 text-primary" />
                  <a href={`mailto:${companyEmail}`} className="hover:text-primary transition-colors">
                    {companyEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {t('footer.company')}. {t('footer.rights')}.</p>
        </div>
      </div>
    </footer>
  );
}
