import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export function Header() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: headerMenu = [] } = trpc.menu.getByLocation.useQuery({ location: "header" });

  const isActive = (path: string) => location === path;

  const navLinks = headerMenu.map(item => ({
    path: item.url,
    labelKey: item.labelEN.toLowerCase().replace(/\s+/g, ''),
    isExternal: item.isExternal
  }));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              {APP_LOGO && (
                <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10" />
              )}
              <span className="text-xl font-bold text-glow-primary">{APP_TITLE}</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              link.isExternal ? (
                <a
                  key={link.path}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary hover:bg-accent/10"
                >
                  {t(`nav.${link.labelKey}`)}
                </a>
              ) : (
                <Link key={link.path} href={link.path}>
                  <a
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary hover:bg-accent/10 ${
                      isActive(link.path) ? 'text-primary bg-accent/10' : ''
                    }`}
                  >
                    {t(`nav.${link.labelKey}`)}
                  </a>
                </Link>
              )
            ))}
          </nav>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-2">
            <LanguageSwitcher />
            {isAuthenticated && (user?.role === 'admin' || user?.role === 'content_editor') && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="glow-primary">
                  {t('nav.admin')}
                </Button>
              </Link>
            )}
            {!isAuthenticated && (
              <Button asChild size="sm" className="glow-primary">
                <a href={getLoginUrl()}>{t('nav.login')}</a>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-border/40">
            {navLinks.map((link) => (
              link.isExternal ? (
                <a
                  key={link.path}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary hover:bg-accent/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t(`nav.${link.labelKey}`)}
                </a>
              ) : (
                <Link key={link.path} href={link.path}>
                  <a
                    className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary hover:bg-accent/10 ${
                      isActive(link.path) ? 'text-primary bg-accent/10' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t(`nav.${link.labelKey}`)}
                  </a>
                </Link>
              )
            ))}
            <div className="flex items-center space-x-2 px-4 pt-2">
              <LanguageSwitcher />
              {isAuthenticated && (user?.role === 'admin' || user?.role === 'content_editor') && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="glow-primary" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.admin')}
                  </Button>
                </Link>
              )}
              {!isAuthenticated && (
                <Button asChild size="sm" className="glow-primary">
                  <a href={getLoginUrl()}>{t('nav.login')}</a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
