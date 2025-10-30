import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  pages, 
  InsertPage, 
  services, 
  InsertService,
  menuItems,
  InsertMenuItem,
  media,
  InsertMedia,
  settings,
  InsertSetting,
  contactSubmissions,
  InsertContactSubmission
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(users).set(data).where(eq(users.id, id));
  return getUserById(id);
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(users).where(eq(users.id, id));
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLocalUser(user: InsertUser) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user: database not available");
    return;
  }

  try {
    const result = await db.insert(users).values(user);
    return getUserById(Number(result[0].insertId));
  } catch (error) {
    console.error("[Database] Failed to create user:", error);
    throw error;
  }
}

// ============================================
// PAGES MANAGEMENT
// ============================================

export async function getAllPages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pages).orderBy(pages.order);
}

export async function getPublishedPages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pages).where(eq(pages.isPublished, true)).orderBy(pages.order);
}

export async function getPageBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPageById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPage(data: InsertPage) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(pages).values(data);
  return getPageById(Number(result[0].insertId));
}

export async function updatePage(id: number, data: Partial<InsertPage>) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(pages).set(data).where(eq(pages.id, id));
  return getPageById(id);
}

export async function deletePage(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(pages).where(eq(pages.id, id));
}

// ============================================
// SERVICES MANAGEMENT
// ============================================

export async function getAllServices() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(services).orderBy(services.order);
}

export async function getActiveServices() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(services).where(eq(services.isActive, true)).orderBy(services.order);
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateService(id: number, data: Partial<InsertService>) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(services).set(data).where(eq(services.id, id));
  return getServiceById(id);
}

// ============================================
// MENU MANAGEMENT
// ============================================

export async function getMenuItemsByLocation(location: "header" | "footer") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).where(eq(menuItems.location, location)).orderBy(menuItems.order);
}

export async function getMenuItemById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMenuItem(data: InsertMenuItem) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(menuItems).values(data);
  return getMenuItemById(Number(result[0].insertId));
}

export async function updateMenuItem(id: number, data: Partial<InsertMenuItem>) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(menuItems).set(data).where(eq(menuItems.id, id));
  return getMenuItemById(id);
}

export async function deleteMenuItem(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(menuItems).where(eq(menuItems.id, id));
}

// ============================================
// MEDIA MANAGEMENT
// ============================================

export async function getAllMedia() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(media).orderBy(desc(media.createdAt));
}

export async function getMediaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(media).where(eq(media.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMedia(data: InsertMedia) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(media).values(data);
  return getMediaById(Number(result[0].insertId));
}

export async function deleteMedia(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(media).where(eq(media.id, id));
}

// ============================================
// SETTINGS MANAGEMENT
// ============================================

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(settings);
}

export async function getSettingByKey(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertSetting(data: InsertSetting) {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.insert(settings).values(data).onDuplicateKeyUpdate({
    set: { value: data.value, description: data.description },
  });
  
  return getSettingByKey(data.key);
}

// ============================================
// CONTACT SUBMISSIONS
// ============================================

export async function getAllContactSubmissions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
}

export async function getUnreadContactSubmissions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contactSubmissions).where(eq(contactSubmissions.isRead, false)).orderBy(desc(contactSubmissions.createdAt));
}

export async function createContactSubmission(data: InsertContactSubmission) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(contactSubmissions).values(data);
  return result[0].insertId;
}

export async function markContactSubmissionAsRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(contactSubmissions).set({ isRead: true }).where(eq(contactSubmissions.id, id));
}
