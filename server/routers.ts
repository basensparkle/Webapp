import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";
import { hashPassword } from "./_core/localAuth";
import { nanoid } from "nanoid";

// ============================================
// RBAC MIDDLEWARE
// ============================================

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin' && ctx.user.role !== 'content_editor') {
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'Admin or content editor access required'
    });
  }
  return next({ ctx });
});

const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'Admin access required'
    });
  }
  return next({ ctx });
});

// ============================================
// APP ROUTER
// ============================================

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================
  // PAGES API
  // ============================================
  pages: router({
    list: publicProcedure.query(async () => {
      return db.getPublishedPages();
    }),
    
    listAll: adminProcedure.query(async () => {
      return db.getAllPages();
    }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const page = await db.getPageBySlug(input.slug);
        if (!page) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Page not found' });
        }
        return page;
      }),
    
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const page = await db.getPageById(input.id);
        if (!page) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Page not found' });
        }
        return page;
      }),
    
    create: adminProcedure
      .input(z.object({
        slug: z.string(),
        titleNL: z.string(),
        titleEN: z.string(),
        contentNL: z.string(),
        contentEN: z.string(),
        metaDescriptionNL: z.string().optional(),
        metaDescriptionEN: z.string().optional(),
        isPublished: z.boolean().default(true),
        order: z.number().default(0)
      }))
      .mutation(async ({ input }) => {
        return db.createPage(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().optional(),
        titleNL: z.string().optional(),
        titleEN: z.string().optional(),
        contentNL: z.string().optional(),
        contentEN: z.string().optional(),
        metaDescriptionNL: z.string().optional(),
        metaDescriptionEN: z.string().optional(),
        isPublished: z.boolean().optional(),
        order: z.number().optional()
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updatePage(id, data);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePage(input.id);
        return { success: true };
      })
  }),

  // ============================================
  // SERVICES API
  // ============================================
  services: router({
    list: publicProcedure.query(async () => {
      return db.getActiveServices();
    }),
    
    listAll: adminProcedure.query(async () => {
      return db.getAllServices();
    }),
    
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const service = await db.getServiceById(input.id);
        if (!service) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found' });
        }
        return service;
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        titleNL: z.string().optional(),
        titleEN: z.string().optional(),
        descriptionNL: z.string().optional(),
        descriptionEN: z.string().optional(),
        icon: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional()
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateService(id, data);
      })
  }),

  // ============================================
  // MENU API
  // ============================================
  menu: router({
    getByLocation: publicProcedure
      .input(z.object({ location: z.enum(["header", "footer"]) }))
      .query(async ({ input }) => {
        return db.getMenuItemsByLocation(input.location);
      }),
    
    create: adminProcedure
      .input(z.object({
        labelNL: z.string(),
        labelEN: z.string(),
        url: z.string(),
        parentId: z.number().optional(),
        order: z.number(),
        location: z.enum(["header", "footer"]),
        isExternal: z.boolean().default(false)
      }))
      .mutation(async ({ input }) => {
        return db.createMenuItem(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        labelNL: z.string().optional(),
        labelEN: z.string().optional(),
        url: z.string().optional(),
        parentId: z.number().optional(),
        order: z.number().optional(),
        location: z.enum(["header", "footer"]).optional(),
        isExternal: z.boolean().optional()
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateMenuItem(id, data);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteMenuItem(input.id);
        return { success: true };
      })
  }),

  // ============================================
  // MEDIA API
  // ============================================
  media: router({
    list: adminProcedure.query(async () => {
      return db.getAllMedia();
    }),
    
    upload: adminProcedure
      .input(z.object({
        filename: z.string(),
        originalName: z.string(),
        mimeType: z.string(),
        size: z.number(),
        base64Data: z.string()
      }))
      .mutation(async ({ input, ctx }) => {
        // Convert base64 to buffer
        const buffer = Buffer.from(input.base64Data, 'base64');
        
        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileKey = `media/${ctx.user.id}/${timestamp}-${randomSuffix}-${input.filename}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        // Save metadata to database
        const media = await db.createMedia({
          fileKey,
          filename: input.filename,
          originalName: input.originalName,
          mimeType: input.mimeType,
          size: input.size,
          url,
          uploadedBy: ctx.user.id
        });
        
        return media;
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteMedia(input.id);
        return { success: true };
      })
  }),

  // ============================================
  // USER MANAGEMENT API (Admin only)
  // ============================================
  users: router({
    list: superAdminProcedure.query(async () => {
      return db.getAllUsers();
    }),
    
    create: superAdminProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1),
        role: z.enum(["user", "admin", "content_editor"]).default("user"),
      }))
      .mutation(async ({ input }) => {
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
    
    getById: superAdminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getUserById(input.id);
        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }
        return user;
      }),
    
    update: superAdminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(["user", "admin", "content_editor"]).optional()
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateUser(id, data);
      }),
    
    delete: superAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Prevent deleting self
        if (input.id === ctx.user.id) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Cannot delete your own account' 
          });
        }
        await db.deleteUser(input.id);
        return { success: true };
      })
  }),

  // ============================================
  // SETTINGS API
  // ============================================
  settings: router({
    list: publicProcedure.query(async () => {
      return db.getAllSettings();
    }),
    
    getByKey: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const setting = await db.getSettingByKey(input.key);
        if (!setting) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Setting not found' });
        }
        return setting;
      }),
    
    upsert: superAdminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
        description: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        return db.upsertSetting(input);
      })
  }),

  // ============================================
  // CONTACT SUBMISSIONS API
  // ============================================
  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        subject: z.string().min(1),
        message: z.string().min(1)
      }))
      .mutation(async ({ input }) => {
        const id = await db.createContactSubmission(input);
        return { success: true, id };
      }),
    
    list: adminProcedure.query(async () => {
      return db.getAllContactSubmissions();
    }),
    
    listUnread: adminProcedure.query(async () => {
      return db.getUnreadContactSubmissions();
    }),
    
    markAsRead: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markContactSubmissionAsRead(input.id);
        return { success: true };
      })
  })
});

export type AppRouter = typeof appRouter;
