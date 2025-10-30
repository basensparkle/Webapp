import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { z } from "zod";
import { nanoid } from "nanoid";

// Simple password hashing using Node.js crypto
import { createHash, randomBytes, pbkdf2Sync } from "crypto";

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const passwordSalt = salt || randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, passwordSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: passwordSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: newHash } = hashPassword(password, salt);
  return hash === newHash;
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export function registerLocalAuthRoutes(app: Express) {
  // Register new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        res.status(400).json({ error: "User already exists" });
        return;
      }

      // Hash password
      const { hash, salt } = hashPassword(password);

      // Generate unique openId for local users
      const openId = `local_${nanoid(32)}`;

      // Create user
      await db.createLocalUser({
        openId,
        email,
        name,
        passwordHash: hash,
        passwordSalt: salt,
        loginMethod: "local",
        role: "user",
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, message: "User registered successfully" });
    } catch (error) {
      console.error("[LocalAuth] Registration failed", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid input", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login with email and password
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      // Get user by email
      const user = await db.getUserByEmail(email);
      if (!user || !user.passwordHash || !user.passwordSalt) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Verify password
      if (!verifyPassword(password, user.passwordHash, user.passwordSalt)) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Update last signed in
      await db.upsertUser({
        openId: user.openId,
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, message: "Login successful" });
    } catch (error) {
      console.error("[LocalAuth] Login failed", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid input", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Create first admin user (only if no users exist)
  app.post("/api/auth/init-admin", async (req: Request, res: Response) => {
    try {
      const users = await db.getAllUsers();
      if (users.length > 0) {
        res.status(400).json({ error: "Admin user already exists" });
        return;
      }

      const { email, password, name } = registerSchema.parse(req.body);

      // Hash password
      const { hash, salt } = hashPassword(password);

      // Generate unique openId for local users
      const openId = `local_${nanoid(32)}`;

      // Create admin user
      await db.createLocalUser({
        openId,
        email,
        name,
        passwordHash: hash,
        passwordSalt: salt,
        loginMethod: "local",
        role: "admin",
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, message: "Admin user created successfully" });
    } catch (error) {
      console.error("[LocalAuth] Init admin failed", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid input", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create admin user" });
    }
  });
}
