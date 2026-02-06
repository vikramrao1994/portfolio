import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb, getWriteDb } from "@/server/db";
import { protectedProcedure, router } from "@/trpc/init";

// Schema for a single about_me item
const AboutMeItemSchema = z.object({
  id: z.number(),
  sort_order: z.number(),
  en: z.string(),
  de: z.string(),
});

// Input schema for creating a new item
const CreateAboutMeInputSchema = z.object({
  en: z.string().min(1, "English text is required"),
  de: z.string().min(1, "German text is required"),
});

// Input schema for updating an item
const UpdateAboutMeInputSchema = z.object({
  id: z.number(),
  en: z.string().min(1, "English text is required"),
  de: z.string().min(1, "German text is required"),
});

// Input schema for deleting an item
const DeleteAboutMeInputSchema = z.object({
  id: z.number(),
});

// Input schema for reordering items
const ReorderAboutMeInputSchema = z.object({
  items: z.array(
    z.object({
      id: z.number(),
      sort_order: z.number(),
    }),
  ),
});

export const aboutMeRouter = router({
  /**
   * Get all about_me items ordered by sort_order
   * Protected - admin only
   */
  getAll: protectedProcedure.query(async () => {
    const db = getDb();
    const rows = db
      .query("SELECT id, sort_order, en, de FROM about_me ORDER BY sort_order ASC")
      .all() as z.infer<typeof AboutMeItemSchema>[];

    return rows;
  }),

  /**
   * Create a new about_me item
   * Protected - admin only
   */
  create: protectedProcedure.input(CreateAboutMeInputSchema).mutation(async ({ input }) => {
    const db = getWriteDb();

    // Get the max sort_order to append at the end
    const maxResult = db.query("SELECT MAX(sort_order) as max_order FROM about_me").get() as {
      max_order: number | null;
    };
    const nextOrder = (maxResult?.max_order ?? 0) + 1;

    const stmt = db.prepare("INSERT INTO about_me (sort_order, en, de) VALUES (?, ?, ?)");
    const result = stmt.run(nextOrder, input.en, input.de);

    revalidatePath("/", "layout");

    return { success: true, id: Number(result.lastInsertRowid) };
  }),

  /**
   * Update an existing about_me item
   * Protected - admin only
   */
  update: protectedProcedure.input(UpdateAboutMeInputSchema).mutation(async ({ input }) => {
    const db = getWriteDb();

    const stmt = db.prepare("UPDATE about_me SET en = ?, de = ? WHERE id = ?");
    stmt.run(input.en, input.de, input.id);

    revalidatePath("/", "layout");

    return { success: true };
  }),

  /**
   * Delete an about_me item
   * Protected - admin only
   */
  delete: protectedProcedure.input(DeleteAboutMeInputSchema).mutation(async ({ input }) => {
    const db = getWriteDb();

    const stmt = db.prepare("DELETE FROM about_me WHERE id = ?");
    stmt.run(input.id);

    revalidatePath("/", "layout");

    return { success: true };
  }),

  /**
   * Reorder about_me items
   * Protected - admin only
   */
  reorder: protectedProcedure.input(ReorderAboutMeInputSchema).mutation(async ({ input }) => {
    const db = getWriteDb();

    const stmt = db.prepare("UPDATE about_me SET sort_order = ? WHERE id = ?");
    for (const item of input.items) {
      stmt.run(item.sort_order, item.id);
    }

    revalidatePath("/", "layout");

    return { success: true };
  }),
});
