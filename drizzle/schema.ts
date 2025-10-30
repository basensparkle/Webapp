import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role-based access control for CMS.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  passwordSalt: varchar("passwordSalt", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "content_editor"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Pages table for dynamic content management.
 * Supports bilingual content (NL/EN) with rich text.
 */
export const pages = mysqlTable("pages", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  titleNL: text("titleNL").notNull(),
  titleEN: text("titleEN").notNull(),
  contentNL: text("contentNL").notNull(),
  contentEN: text("contentEN").notNull(),
  metaDescriptionNL: text("metaDescriptionNL"),
  metaDescriptionEN: text("metaDescriptionEN"),
  isPublished: boolean("isPublished").default(true).notNull(),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;

/**
 * Services table for the 4 core services.
 * Bilingual with icon support.
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  titleNL: text("titleNL").notNull(),
  titleEN: text("titleEN").notNull(),
  descriptionNL: text("descriptionNL").notNull(),
  descriptionEN: text("descriptionEN").notNull(),
  icon: varchar("icon", { length: 100 }).notNull(),
  order: int("order").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Menu items for header and footer navigation.
 * Supports nested menus and external links.
 */
export const menuItems = mysqlTable("menuItems", {
  id: int("id").autoincrement().primaryKey(),
  labelNL: text("labelNL").notNull(),
  labelEN: text("labelEN").notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  parentId: int("parentId"),
  order: int("order").notNull(),
  location: mysqlEnum("location", ["header", "footer"]).notNull(),
  isExternal: boolean("isExternal").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;

/**
 * Media library for uploaded files.
 * Stores metadata and S3 references.
 */
export const media = mysqlTable("media", {
  id: int("id").autoincrement().primaryKey(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  size: int("size").notNull(),
  url: text("url").notNull(),
  uploadedBy: int("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Media = typeof media.$inferSelect;
export type InsertMedia = typeof media.$inferInsert;

/**
 * Settings table for site-wide configuration.
 * Stores key-value pairs with JSON values.
 */
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

/**
 * Contact form submissions.
 * Stores messages from the contact form.
 */
export const contactSubmissions = mysqlTable("contactSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;
