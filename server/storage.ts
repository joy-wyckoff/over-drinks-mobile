import {
  users,
  userProfiles,
  venues,
  checkIns,
  matches,
  type User,
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
  type Venue,
  type InsertVenue,
  type CheckIn,
  type InsertCheckIn,
  type Match,
  type InsertMatch,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Venue operations
  getVenues(): Promise<Venue[]>;
  getVenue(id: string): Promise<Venue | undefined>;
  getVenuesByType(venueType: string): Promise<Venue[]>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  
  // Check-in operations
  checkInToVenue(checkIn: InsertCheckIn): Promise<CheckIn>;
  checkOutFromVenue(userId: string, venueId: string): Promise<void>;
  getCurrentCheckIn(userId: string): Promise<CheckIn | undefined>;
  getUsersAtVenue(venueId: string): Promise<Array<User & { profile: UserProfile; checkIn: CheckIn }>>;
  getVenuePopularity(venueId: string): Promise<number>;
  
  // Match operations
  createMatchRequest(match: InsertMatch): Promise<Match>;
  getMatchRequest(requesterId: string, targetId: string, venueId: string): Promise<Match | undefined>;
  updateMatchStatus(id: string, status: string): Promise<Match>;
  getUserMatches(userId: string): Promise<Array<Match & { requester: User; target: User; venue: Venue }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, profileData: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [profile] = await db
      .update(userProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile;
  }

  // Venue operations
  async getVenues(): Promise<Venue[]> {
    return await db.select().from(venues).orderBy(venues.name);
  }

  async getVenue(id: string): Promise<Venue | undefined> {
    const [venue] = await db.select().from(venues).where(eq(venues.id, id));
    return venue;
  }

  async getVenuesByType(venueType: string): Promise<Venue[]> {
    return await db
      .select()
      .from(venues)
      .where(eq(venues.venueType, venueType))
      .orderBy(venues.name);
  }

  async createVenue(venue: InsertVenue): Promise<Venue> {
    const [newVenue] = await db.insert(venues).values(venue).returning();
    return newVenue;
  }

  // Check-in operations
  async checkInToVenue(checkInData: InsertCheckIn): Promise<CheckIn> {
    // First check out from any current venue
    await db
      .update(checkIns)
      .set({ checkedOutAt: new Date() })
      .where(
        and(
          eq(checkIns.userId, checkInData.userId),
          sql`checked_out_at IS NULL`
        )
      );

    const [checkIn] = await db.insert(checkIns).values(checkInData).returning();
    return checkIn;
  }

  async checkOutFromVenue(userId: string, venueId: string): Promise<void> {
    await db
      .update(checkIns)
      .set({ checkedOutAt: new Date() })
      .where(
        and(
          eq(checkIns.userId, userId),
          eq(checkIns.venueId, venueId),
          sql`checked_out_at IS NULL`
        )
      );
  }

  async getCurrentCheckIn(userId: string): Promise<CheckIn | undefined> {
    const [checkIn] = await db
      .select()
      .from(checkIns)
      .where(
        and(
          eq(checkIns.userId, userId),
          sql`checked_out_at IS NULL`
        )
      )
      .orderBy(desc(checkIns.checkedInAt))
      .limit(1);
    return checkIn;
  }

  async getUsersAtVenue(venueId: string): Promise<Array<User & { profile: UserProfile; checkIn: CheckIn }>> {
    const result = await db
      .select({
        user: users,
        profile: userProfiles,
        checkIn: checkIns,
      })
      .from(checkIns)
      .innerJoin(users, eq(checkIns.userId, users.id))
      .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(
        and(
          eq(checkIns.venueId, venueId),
          sql`check_ins.checked_out_at IS NULL`
        )
      )
      .orderBy(desc(checkIns.checkedInAt));

    return result.map(row => ({
      ...row.user,
      profile: row.profile,
      checkIn: row.checkIn,
    }));
  }

  async getVenuePopularity(venueId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(checkIns)
      .where(
        and(
          eq(checkIns.venueId, venueId),
          sql`checked_out_at IS NULL`
        )
      );
    return result?.count || 0;
  }

  // Match operations
  async createMatchRequest(matchData: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values(matchData).returning();
    return match;
  }

  async getMatchRequest(requesterId: string, targetId: string, venueId: string): Promise<Match | undefined> {
    const [match] = await db
      .select()
      .from(matches)
      .where(
        and(
          eq(matches.requesterId, requesterId),
          eq(matches.targetId, targetId),
          eq(matches.venueId, venueId)
        )
      );
    return match;
  }

  async updateMatchStatus(id: string, status: string): Promise<Match> {
    const [match] = await db
      .update(matches)
      .set({ 
        status,
        ...(status === 'matched' ? { matchedAt: new Date() } : {})
      })
      .where(eq(matches.id, id))
      .returning();
    return match;
  }

  async getUserMatches(userId: string): Promise<Array<Match & { requester: User; target: User; venue: Venue }>> {
    const result = await db
      .select({
        match: matches,
        requester: users,
        target: { ...users },
        venue: venues,
      })
      .from(matches)
      .innerJoin(users, eq(matches.requesterId, users.id))
      .innerJoin({ targetUser: users }, eq(matches.targetId, sql`target_user.id`))
      .innerJoin(venues, eq(matches.venueId, venues.id))
      .where(
        and(
          sql`(matches.requester_id = ${userId} OR matches.target_id = ${userId})`,
          eq(matches.status, 'matched')
        )
      )
      .orderBy(desc(matches.matchedAt));

    return result.map(row => ({
      ...row.match,
      requester: row.requester,
      target: row.target,
      venue: row.venue,
    }));
  }
}

export const storage = new DatabaseStorage();
