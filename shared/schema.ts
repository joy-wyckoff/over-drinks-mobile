import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User profiles for dating app functionality
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  username: varchar("username").unique().notNull(),
  phoneNumber: varchar("phone_number"),
  birthday: timestamp("birthday"),
  gender: varchar("gender"), // man, woman, non-binary, other
  sexualOrientation: varchar("sexual_orientation"), // straight, gay, lesbian, bisexual, pansexual, other
  interests: text("interests").array().default([]),
  bio: text("bio"),
  profilePhotoUrl: varchar("profile_photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Venues (bars/clubs)
export const venues = pgTable("venues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  address: varchar("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  venueType: varchar("venue_type"), // jazz_club, cocktail_bar, dance_club, speakeasy
  musicType: varchar("music_type"), // jazz, electronic, live, mixed
  vibe: varchar("vibe"), // upscale, casual, underground, rooftop
  createdAt: timestamp("created_at").defaultNow(),
});

// User check-ins to venues
export const checkIns = pgTable("check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  venueId: varchar("venue_id").notNull().references(() => venues.id, { onDelete: 'cascade' }),
  checkedInAt: timestamp("checked_in_at").defaultNow(),
  checkedOutAt: timestamp("checked_out_at"),
  mode: varchar("mode").notNull().default('dating'), // dating, friends
  aiRecommendations: boolean("ai_recommendations").default(true),
});

// Match requests and matches
export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetId: varchar("target_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  venueId: varchar("venue_id").notNull().references(() => venues.id, { onDelete: 'cascade' }),
  status: varchar("status").notNull().default('pending'), // pending, matched, rejected, expired
  createdAt: timestamp("created_at").defaultNow(),
  matchedAt: timestamp("matched_at"),
});

// Schema exports for validation
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
  createdAt: true,
});

export const insertCheckInSchema = createInsertSchema(checkIns).omit({
  id: true,
  checkedInAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
  matchedAt: true,
});

// Type exports
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type Venue = typeof venues.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
