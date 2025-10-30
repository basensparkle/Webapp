import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Briefcase } from "lucide-react";

export default function Portfolio() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-accent/10 via-background to-primary/10">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-glow-accent">
                {t('portfolio.title')}
              </h1>
              <p className="text-xl text-muted-foreground">
                {t('portfolio.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-20">
          <div className="container">
            <div className="max-w-2xl mx-auto">
              <Card className="glass">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="h-20 w-20 rounded-lg bg-accent/10 flex items-center justify-center mb-6 glow-accent mx-auto">
                    <Briefcase className="h-10 w-10 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-accent">
                    {t('portfolio.comingSoon')}
                  </h2>
                  <p className="text-muted-foreground">
                    We are currently working on showcasing our recent projects and success stories.
                    Check back soon to see examples of our work in IT support, network security,
                    IoT solutions, and AI applications.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
