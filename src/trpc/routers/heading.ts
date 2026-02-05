import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb, getWriteDb } from "@/server/db";
import { protectedProcedure, router } from "@/trpc/init";

// Input schema for updating heading (all fields optional for partial updates)
const UpdateHeadingInputSchema = z.object({
  name: z.string().min(1).optional(),
  subheadline_en: z.string().min(1).optional(),
  subheadline_de: z.string().min(1).optional(),
  headline_en: z.string().min(1).optional(),
  headline_de: z.string().min(1).optional(),
  address_en: z.string().min(1).optional(),
  address_de: z.string().min(1).optional(),
  email: z.string().email().or(z.literal("")).optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().url().or(z.literal("")).optional().nullable(),
  linkedin: z.string().url().or(z.literal("")).optional().nullable(),
  github: z.string().url().or(z.literal("")).optional().nullable(),
  instagram: z.string().url().or(z.literal("")).optional().nullable(),
  age: z.string().optional().nullable(),
  years_of_experience: z.string().optional().nullable(),
  open_to_opportunities: z.boolean().optional(),
});

export type UpdateHeadingInput = z.infer<typeof UpdateHeadingInputSchema>;

export const headingRouter = router({
  /**
   * Get raw heading data (all columns, both languages)
   * Protected - admin only
   */
  getRaw: protectedProcedure.query(async () => {
    const db = getDb();
    const row = db
      .query(
        `SELECT
        name,
        subheadline_en, subheadline_de,
        headline_en, headline_de,
        address_en, address_de,
        email, phone, website, linkedin, github, instagram,
        age, years_of_experience, open_to_opportunities
      FROM heading
      WHERE id = 1`,
      )
      .get() as Record<string, unknown> | null;

    if (!row) {
      return null;
    }

    return {
      name: row.name as string,
      subheadline_en: row.subheadline_en as string,
      subheadline_de: row.subheadline_de as string,
      headline_en: row.headline_en as string,
      headline_de: row.headline_de as string,
      address_en: row.address_en as string,
      address_de: row.address_de as string,
      email: row.email as string | null,
      phone: row.phone as string | null,
      website: row.website as string | null,
      linkedin: row.linkedin as string | null,
      github: row.github as string | null,
      instagram: row.instagram as string | null,
      age: row.age as string | null,
      years_of_experience: row.years_of_experience as string | null,
      open_to_opportunities: Boolean(row.open_to_opportunities),
    };
  }),

  /**
   * Update heading - partial updates supported
   * Protected - admin only
   */
  update: protectedProcedure.input(UpdateHeadingInputSchema).mutation(async ({ input }) => {
    const db = getWriteDb();

    // Build dynamic UPDATE statement from provided fields
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        // Convert boolean to integer for SQLite
        let sqlValue: string | number | null;
        if (key === "open_to_opportunities") {
          sqlValue = value ? 1 : 0;
        } else if (value === null) {
          sqlValue = null;
        } else {
          sqlValue = value as string;
        }
        updates.push(`${key} = ?`);
        values.push(sqlValue);
      }
    }

    if (updates.length === 0) {
      return { success: false, message: "No fields to update" };
    }

    const stmt = db.prepare(`
        UPDATE heading
        SET ${updates.join(", ")}
        WHERE id = 1
      `);

    stmt.run(...values);

    // Revalidate all pages since heading appears across the site
    revalidatePath("/", "layout");

    return { success: true };
  }),
});
