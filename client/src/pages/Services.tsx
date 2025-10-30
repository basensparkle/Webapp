import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Monitor, Shield, Cpu, Brain } from "lucide-react";

const iconMap: Record<string, any> = {
  Monitor,
  Shield,
  Cpu,
  Brain
};

export default function Services() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const { data: services = [], isLoading } = trpc.services.list.useQuery();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-glow-primary">
                {t('services.title')}
              </h1>
              <p className="text-xl text-muted-foreground">
                {t('services.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20">
          <div className="container">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="glass animate-pulse">
                    <CardHeader>
                      <div className="h-12 w-12 bg-muted rounded-lg mb-4" />
                      <div className="h-8 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-5/6" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {services.map((service) => {
                  const Icon = iconMap[service.icon] || Monitor;
                  return (
                    <Card 
                      key={service.id} 
                      className="glass hover:glow-primary transition-all duration-300"
                    >
                      <CardHeader>
                        <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center mb-6 glow-primary">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl mb-4">
                          {currentLang === 'nl' ? service.titleNL : service.titleEN}
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground leading-relaxed">
                          {currentLang === 'nl' ? service.descriptionNL : service.descriptionEN}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="pt-4 border-t border-border/40">
                          <p className="text-sm text-muted-foreground">
                            {t('services.learnMore')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
