import { 
  upsertSetting, 
  createPage, 
  updateService,
  createMenuItem,
  getDb
} from "./db";
import { services } from "../drizzle/schema";

/**
 * Seed script to populate initial data for ICT Eerbeek
 * Run with: pnpm tsx server/seed.ts
 */

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ Database connection failed");
      return;
    }

    // ============================================
    // SEED SETTINGS
    // ============================================
    console.log("📝 Seeding settings...");
    
    await upsertSetting({
      key: "company_name",
      value: JSON.stringify("ICT Eerbeek"),
      description: "Company name"
    });

    await upsertSetting({
      key: "company_address",
      value: JSON.stringify("Odinkerf 18, 6961 MA Eerbeek"),
      description: "Company address"
    });

    await upsertSetting({
      key: "company_phone",
      value: JSON.stringify("06-43138103"),
      description: "Company phone number"
    });

    await upsertSetting({
      key: "company_email",
      value: JSON.stringify("info@icteerbeek.nl"),
      description: "Company email"
    });

    await upsertSetting({
      key: "company_location",
      value: JSON.stringify({ city: "Eerbeek", region: "Veluwe", province: "Gelderland" }),
      description: "Company location details"
    });

    await upsertSetting({
      key: "google_maps_coordinates",
      value: JSON.stringify({ lat: 52.0583, lng: 6.0639 }),
      description: "Google Maps coordinates for Eerbeek"
    });

    console.log("✅ Settings seeded");

    // ============================================
    // SEED SERVICES
    // ============================================
    console.log("📝 Seeding services...");

    const servicesData = [
      {
        id: 1,
        titleNL: "Alround computerondersteuning",
        titleEN: "All-round computer assistance",
        descriptionNL: "Professionele IT-ondersteuning voor MKB en particulieren. Van hardware problemen tot software installaties, wij staan voor u klaar met snelle en betrouwbare oplossingen.",
        descriptionEN: "Professional IT support for SMEs and private individuals. From hardware issues to software installations, we provide fast and reliable solutions.",
        icon: "Monitor",
        order: 1,
        isActive: true
      },
      {
        id: 2,
        titleNL: "Netwerken en Beveiliging",
        titleEN: "Networks and Security",
        descriptionNL: "Beveilig uw bedrijfsnetwerk met onze geavanceerde oplossingen. VPN-configuratie, firewall-beheer en complete infrastructuur voor optimale beveiliging.",
        descriptionEN: "Secure your business network with our advanced solutions. VPN configuration, firewall management, and complete infrastructure for optimal security.",
        icon: "Shield",
        order: 2,
        isActive: true
      },
      {
        id: 3,
        titleNL: "Maatwerk IoT-oplossingen",
        titleEN: "Customized IoT solutions",
        descriptionNL: "Slimme oplossingen voor uw huis of kantoor. Van domotica tot industriële IoT-toepassingen, wij realiseren uw visie op maat.",
        descriptionEN: "Smart solutions for your home or office. From home automation to industrial IoT applications, we bring your vision to life.",
        icon: "Cpu",
        order: 3,
        isActive: true
      },
      {
        id: 4,
        titleNL: "AI-toepassingen",
        titleEN: "AI Applications",
        descriptionNL: "Integratie van AI-tools en ontwikkeling van aangepaste AI-oplossingen om uw bedrijfsprocessen te optimaliseren en innoveren.",
        descriptionEN: "Integration of AI tools and development of custom AI solutions to optimize and innovate your business processes.",
        icon: "Brain",
        order: 4,
        isActive: true
      }
    ];

    // Insert services directly
    for (const service of servicesData) {
      await db.insert(services).values(service).onDuplicateKeyUpdate({
        set: {
          titleNL: service.titleNL,
          titleEN: service.titleEN,
          descriptionNL: service.descriptionNL,
          descriptionEN: service.descriptionEN,
          icon: service.icon,
          order: service.order,
          isActive: service.isActive
        }
      });
    }

    console.log("✅ Services seeded");

    // ============================================
    // SEED MENU ITEMS
    // ============================================
    console.log("📝 Seeding menu items...");

    const headerMenuItems = [
      { labelNL: "Home", labelEN: "Home", url: "/", order: 1 },
      { labelNL: "Diensten", labelEN: "Services", url: "/services", order: 2 },
      { labelNL: "Over ons", labelEN: "About Us", url: "/about", order: 3 },
      { labelNL: "Portfolio", labelEN: "Portfolio", url: "/portfolio", order: 4 },
      { labelNL: "Contact", labelEN: "Contact", url: "/contact", order: 5 },
    ];

    for (const item of headerMenuItems) {
      await createMenuItem({
        ...item,
        location: "header",
        isExternal: false
      });
    }

    const footerMenuItems = [
      { labelNL: "Privacy", labelEN: "Privacy", url: "/privacy", order: 1 },
      { labelNL: "Voorwaarden", labelEN: "Terms", url: "/terms", order: 2 },
    ];

    for (const item of footerMenuItems) {
      await createMenuItem({
        ...item,
        location: "footer",
        isExternal: false
      });
    }

    console.log("✅ Menu items seeded");

    // ============================================
    // SEED INITIAL PAGES
    // ============================================
    console.log("📝 Seeding initial pages...");

    await createPage({
      slug: "privacy",
      titleNL: "Privacy Policy",
      titleEN: "Privacy Policy",
      contentNL: "<h2>Privacy Policy</h2><p>Deze pagina wordt binnenkort toegevoegd.</p>",
      contentEN: "<h2>Privacy Policy</h2><p>This page will be added soon.</p>",
      metaDescriptionNL: "Privacy policy van ICT Eerbeek",
      metaDescriptionEN: "Privacy policy of ICT Eerbeek",
      isPublished: true,
      order: 100
    });

    await createPage({
      slug: "terms",
      titleNL: "Algemene Voorwaarden",
      titleEN: "Terms and Conditions",
      contentNL: "<h2>Algemene Voorwaarden</h2><p>Deze pagina wordt binnenkort toegevoegd.</p>",
      contentEN: "<h2>Terms and Conditions</h2><p>This page will be added soon.</p>",
      metaDescriptionNL: "Algemene voorwaarden van ICT Eerbeek",
      metaDescriptionEN: "Terms and conditions of ICT Eerbeek",
      isPublished: true,
      order: 101
    });

    console.log("✅ Initial pages seeded");

    console.log("🎉 Database seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

// Run seed if called directly
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
