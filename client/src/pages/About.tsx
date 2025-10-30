import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MapPin, Target } from "lucide-react";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-secondary/10 via-background to-primary/10">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-glow-secondary">
                {t('about.title')}
              </h1>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Mission Card */}
              <Card className="glass hover:glow-primary transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 glow-primary">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-primary">
                    {t('about.mission.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('about.mission.description')}
                  </p>
                </CardContent>
              </Card>

              {/* Location Card */}
              <Card className="glass hover:glow-secondary transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 glow-secondary">
                    <MapPin className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-2xl text-secondary">
                    {t('about.location.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('about.location.description')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Company Details */}
            <div className="mt-16 max-w-3xl mx-auto">
              <Card className="glass">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-primary">Locatie</h3>
                      <p className="text-muted-foreground">
                        Odinkerf 18<br />
                        6961 MA Eerbeek<br />
                        Gelderland, Veluwe
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-primary">Contact</h3>
                      <p className="text-muted-foreground">
                        Telefoon: 06-43138103<br />
                        Email: info@icteerbeek.nl
                      </p>
                    </div>
                  </div>
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
