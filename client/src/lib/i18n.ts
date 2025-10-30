import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        services: 'Services',
        about: 'About Us',
        portfolio: 'Portfolio',
        contact: 'Contact',
        login: 'Login',
        logout: 'Logout',
        admin: 'Admin Panel'
      },
      
      // Home Page
      home: {
        hero: {
          title: 'Professional IT Solutions in Eerbeek',
          subtitle: 'Your trusted IT partner in the Veluwe region',
          cta: 'Discover our services',
          contact: 'Contact us'
        },
        services: {
          title: 'Our Services',
          subtitle: 'Comprehensive IT solutions for businesses and individuals',
          viewAll: 'View all services'
        },
        about: {
          title: 'About ICT Eerbeek',
          description: 'We are a local IT service provider in Eerbeek, serving the Veluwe region with professional IT solutions. From computer support to advanced AI applications, we help businesses and individuals with all their technology needs.'
        }
      },
      
      // Services Page
      services: {
        title: 'Our Services',
        subtitle: 'Professional IT solutions tailored to your needs',
        learnMore: 'Learn more'
      },
      
      // About Page
      about: {
        title: 'About Us',
        mission: {
          title: 'Our Mission',
          description: 'At ICT Eerbeek, we believe in providing accessible, professional IT solutions to businesses and individuals in the Veluwe region. Our local presence in Eerbeek allows us to offer personalized service and quick response times.'
        },
        location: {
          title: 'Our Location',
          description: 'Based in Eerbeek, Gelderland, we proudly serve the entire Veluwe region with on-site and remote IT support.'
        }
      },
      
      // Portfolio Page
      portfolio: {
        title: 'Portfolio',
        subtitle: 'Our recent projects and success stories',
        comingSoon: 'Project showcase coming soon'
      },
      
      // Contact Page
      contact: {
        title: 'Contact Us',
        subtitle: 'Get in touch with our team',
        form: {
          name: 'Name',
          email: 'Email',
          phone: 'Phone (optional)',
          subject: 'Subject',
          message: 'Message',
          submit: 'Send message',
          sending: 'Sending...',
          success: 'Message sent successfully! We will get back to you soon.',
          error: 'Failed to send message. Please try again.'
        },
        info: {
          address: 'Address',
          phone: 'Phone',
          email: 'Email',
          hours: 'Business Hours',
          hoursValue: 'Monday - Friday: 9:00 - 17:00'
        }
      },
      
      // Footer
      footer: {
        company: 'ICT Eerbeek',
        tagline: 'Your trusted IT partner in the Veluwe region',
        rights: 'All rights reserved',
        quickLinks: 'Quick Links',
        contactInfo: 'Contact Information'
      },
      
      // Common
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        notFound: 'Page not found',
        backHome: 'Back to home'
      }
    }
  },
  nl: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        services: 'Diensten',
        about: 'Over ons',
        portfolio: 'Portfolio',
        contact: 'Contact',
        login: 'Inloggen',
        logout: 'Uitloggen',
        admin: 'Admin Paneel'
      },
      
      // Home Page
      home: {
        hero: {
          title: 'Professionele IT-oplossingen in Eerbeek',
          subtitle: 'Uw vertrouwde IT-partner in de Veluwe',
          cta: 'Ontdek onze diensten',
          contact: 'Neem contact op'
        },
        services: {
          title: 'Onze Diensten',
          subtitle: 'Uitgebreide IT-oplossingen voor bedrijven en particulieren',
          viewAll: 'Bekijk alle diensten'
        },
        about: {
          title: 'Over ICT Eerbeek',
          description: 'Wij zijn een lokale IT-dienstverlener in Eerbeek, die de Veluwe-regio bedient met professionele IT-oplossingen. Van computerondersteuning tot geavanceerde AI-toepassingen, wij helpen bedrijven en particulieren met al hun technologiebehoeften.'
        }
      },
      
      // Services Page
      services: {
        title: 'Onze Diensten',
        subtitle: 'Professionele IT-oplossingen op maat',
        learnMore: 'Meer informatie'
      },
      
      // About Page
      about: {
        title: 'Over Ons',
        mission: {
          title: 'Onze Missie',
          description: 'Bij ICT Eerbeek geloven we in het bieden van toegankelijke, professionele IT-oplossingen aan bedrijven en particulieren in de Veluwe-regio. Onze lokale aanwezigheid in Eerbeek stelt ons in staat om persoonlijke service en snelle responstijden te bieden.'
        },
        location: {
          title: 'Onze Locatie',
          description: 'Gevestigd in Eerbeek, Gelderland, bedienen wij met trots de gehele Veluwe-regio met on-site en remote IT-ondersteuning.'
        }
      },
      
      // Portfolio Page
      portfolio: {
        title: 'Portfolio',
        subtitle: 'Onze recente projecten en succesverhalen',
        comingSoon: 'Projectoverzicht komt binnenkort'
      },
      
      // Contact Page
      contact: {
        title: 'Contact',
        subtitle: 'Neem contact op met ons team',
        form: {
          name: 'Naam',
          email: 'E-mail',
          phone: 'Telefoon (optioneel)',
          subject: 'Onderwerp',
          message: 'Bericht',
          submit: 'Verstuur bericht',
          sending: 'Verzenden...',
          success: 'Bericht succesvol verzonden! We nemen spoedig contact met u op.',
          error: 'Bericht verzenden mislukt. Probeer het opnieuw.'
        },
        info: {
          address: 'Adres',
          phone: 'Telefoon',
          email: 'E-mail',
          hours: 'Openingstijden',
          hoursValue: 'Maandag - Vrijdag: 9:00 - 17:00'
        }
      },
      
      // Footer
      footer: {
        company: 'ICT Eerbeek',
        tagline: 'Uw vertrouwde IT-partner in de Veluwe',
        rights: 'Alle rechten voorbehouden',
        quickLinks: 'Snelle Links',
        contactInfo: 'Contactinformatie'
      },
      
      // Common
      common: {
        loading: 'Laden...',
        error: 'Er is een fout opgetreden',
        notFound: 'Pagina niet gevonden',
        backHome: 'Terug naar home'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'nl',
    supportedLngs: ['en', 'nl'],
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
