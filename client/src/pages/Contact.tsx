import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: settings = [] } = trpc.settings.list.useQuery();
  const submitMutation = trpc.contact.submit.useMutation();

  const getSettingValue = (key: string) => {
    const setting = settings.find(s => s.key === key);
    return setting ? JSON.parse(setting.value) : '';
  };

  const companyAddress = getSettingValue('company_address');
  const companyPhone = getSettingValue('company_phone');
  const companyEmail = getSettingValue('company_email');
  const coordinates = getSettingValue('google_maps_coordinates');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync(data);
      toast.success(t('contact.form.success'));
      reset();
    } catch (error) {
      toast.error(t('contact.form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleMapsUrl = coordinates 
    ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(companyAddress)}&output=embed`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-glow-primary">
                {t('contact.title')}
              </h1>
              <p className="text-xl text-muted-foreground">
                {t('contact.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">
                    {t('contact.form.submit')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                      <Label htmlFor="name">{t('contact.form.name')}</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        className="mt-2"
                        placeholder={t('contact.form.name')}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">{t('contact.form.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        className="mt-2"
                        placeholder={t('contact.form.email')}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">{t('contact.form.phone')}</Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        className="mt-2"
                        placeholder={t('contact.form.phone')}
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">{t('contact.form.subject')}</Label>
                      <Input
                        id="subject"
                        {...register('subject')}
                        className="mt-2"
                        placeholder={t('contact.form.subject')}
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="message">{t('contact.form.message')}</Label>
                      <Textarea
                        id="message"
                        {...register('message')}
                        className="mt-2 min-h-32"
                        placeholder={t('contact.form.message')}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full glow-primary" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="space-y-6">
                <Card className="glass">
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{t('contact.info.address')}</h3>
                          <p className="text-muted-foreground">{companyAddress}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{t('contact.info.phone')}</h3>
                          <a 
                            href={`tel:${companyPhone}`}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            {companyPhone}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{t('contact.info.email')}</h3>
                          <a 
                            href={`mailto:${companyEmail}`}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            {companyEmail}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{t('contact.info.hours')}</h3>
                          <p className="text-muted-foreground">{t('contact.info.hoursValue')}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Google Maps */}
                <Card className="glass overflow-hidden">
                  <CardContent className="p-0">
                    <iframe
                      src={googleMapsUrl}
                      width="100%"
                      height="400"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="ICT Eerbeek Location"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
