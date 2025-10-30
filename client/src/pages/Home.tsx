import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Monitor, Shield, Cpu, Brain, ArrowRight } from "lucide-react";

const iconMap: Record<string, any> = {
  Monitor,
  Shield,
  Cpu,
  Brain
};

export default function Home() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const { data: services = [], isLoading } = trpc.services.list.useQuery();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold text-glow-primary">
                {t('home.hero.title')}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="glow-primary text-lg">
                  <Link href="/services">
                    <a className="flex items-center gap-2">
                      {t('home.hero.cta')}
                      <ArrowRight size={20} />
                    </a>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg">
                  <Link href="/contact">
                    <a>{t('home.hero.contact')}</a>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-card/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-glow-primary">
                {t('home.services.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('home.services.subtitle')}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="glass animate-pulse">
                    <CardHeader>
                      <div className="h-12 w-12 bg-muted rounded-lg mb-4" />
                      <div className="h-6 bg-muted rounded w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded w-5/6" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service) => {
                  const Icon = iconMap[service.icon] || Monitor;
                  return (
                    <Card 
                      key={service.id} 
                      className="glass hover:glow-primary transition-all duration-300 hover:scale-105"
                    >
                      <CardHeader>
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">
                          {currentLang === 'nl' ? service.titleNL : service.titleEN}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-muted-foreground">
                          {currentLang === 'nl' ? service.descriptionNL : service.descriptionEN}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="text-center mt-12">
              <Button asChild size="lg" variant="outline">
                <Link href="/services">
                  <a>{t('home.services.viewAll')}</a>
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-glow-secondary">
                {t('home.about.title')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('home.about.description')}
              </p>
              <div className="mt-8">
                <Button asChild size="lg" variant="outline">
                  <Link href="/about">
                    <a>{t('nav.about')}</a>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
