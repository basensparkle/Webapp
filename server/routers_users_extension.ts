import { z } from "zod";
import { router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { hashPassword } from "./_core/localAuth";
import { nanoid } from "nanoid";

// This extends the users router with create functionality
export const usersExtensionRouter = router({
  create: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
    role: z.enum(["user", "admin", "content_editor"]).default("user"),
  }).mutation(async ({ input }) => {
    // Check if user already exists
    const existingUser = await db.getUserByEmail(input.email);
    if (existingUser) {
      throw new TRPCError({ 
        code: 'BAD_REQUEST', 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const { hash, salt } = hashPassword(input.password);

    // Generate unique openId for local users
    const openId = `local_${nanoid(32)}`;

    // Create user
    const user = await db.createLocalUser({
      openId,
      email: input.email,
      name: input.name,
      passwordHash: hash,
      passwordSalt: salt,
      loginMethod: "local",
      role: input.role,
      lastSignedIn: new Date(),
    });

    return user;
  }),
});
