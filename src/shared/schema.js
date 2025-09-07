import { z } from 'zod';

// User Profile Schema
export const insertUserProfileSchema = z.object({
  userId: z.string(),
  username: z.string().min(3).max(20),
  phoneNumber: z.string().optional(),
  birthday: z.date().optional(),
  gender: z.enum(['man', 'woman', 'non-binary', 'other']).optional(),
  sexualOrientation: z.enum(['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'other']).optional(),
  interests: z.array(z.string()).default([]),
  bio: z.string().optional(),
  profilePhotoUrl: z.string().optional(),
});

// Venue Schema
export const insertVenueSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().min(1),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  venueType: z.enum(['jazz_club', 'cocktail_bar', 'dance_club', 'speakeasy']).optional(),
  musicType: z.enum(['jazz', 'electronic', 'live', 'mixed']).optional(),
  vibe: z.enum(['upscale', 'casual', 'underground', 'rooftop']).optional(),
});

// Check-in Schema
export const insertCheckInSchema = z.object({
  userId: z.string(),
  venueId: z.string(),
  mode: z.enum(['dating', 'friends']).default('dating'),
  aiRecommendations: z.boolean().default(true),
});

// Match Schema
export const insertMatchSchema = z.object({
  requesterId: z.string(),
  targetId: z.string(),
  venueId: z.string(),
  status: z.enum(['pending', 'matched', 'rejected', 'expired']).default('pending'),
});

// Type exports
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
