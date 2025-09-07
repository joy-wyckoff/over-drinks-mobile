import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertUserProfileSchema, 
  insertCheckInSchema, 
  insertMatchSchema,
  insertVenueSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Also get the user's profile if it exists
      const profile = await storage.getUserProfile(userId);
      
      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertUserProfileSchema.parse({
        ...req.body,
        userId,
      });
      
      const profile = await storage.createUserProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertUserProfileSchema.partial().parse(req.body);
      
      const profile = await storage.updateUserProfile(userId, profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Venue routes
  app.get('/api/venues', isAuthenticated, async (req: any, res) => {
    try {
      const { type } = req.query;
      let venues;
      
      if (type) {
        venues = await storage.getVenuesByType(type as string);
      } else {
        venues = await storage.getVenues();
      }
      
      // Add popularity count to each venue
      const venuesWithPopularity = await Promise.all(
        venues.map(async (venue) => {
          const popularity = await storage.getVenuePopularity(venue.id);
          return { ...venue, currentUsers: popularity };
        })
      );
      
      res.json(venuesWithPopularity);
    } catch (error) {
      console.error("Error fetching venues:", error);
      res.status(500).json({ message: "Failed to fetch venues" });
    }
  });

  app.get('/api/venues/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const venue = await storage.getVenue(id);
      
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      
      const popularity = await storage.getVenuePopularity(id);
      res.json({ ...venue, currentUsers: popularity });
    } catch (error) {
      console.error("Error fetching venue:", error);
      res.status(500).json({ message: "Failed to fetch venue" });
    }
  });

  // Initialize sample venues if none exist
  app.post('/api/venues/initialize', isAuthenticated, async (req: any, res) => {
    try {
      const existingVenues = await storage.getVenues();
      if (existingVenues.length > 0) {
        return res.json({ message: "Venues already initialized" });
      }

      const sampleVenues = [
        {
          name: "The Gatsby Lounge",
          description: "Upscale cocktail bar with live jazz",
          address: "123 Speakeasy St, Downtown",
          latitude: "40.7589",
          longitude: "-73.9851",
          venueType: "cocktail_bar",
          musicType: "jazz",
          vibe: "upscale"
        },
        {
          name: "Moonshine & Melodies",
          description: "Underground speakeasy with craft cocktails",
          address: "456 Hidden Ave, Underground",
          latitude: "40.7505",
          longitude: "-73.9934",
          venueType: "speakeasy",
          musicType: "live",
          vibe: "underground"
        },
        {
          name: "Prohibition Paradise",
          description: "Classic cocktails in vintage atmosphere",
          address: "789 Vintage Blvd, Midtown",
          latitude: "40.7614",
          longitude: "-73.9776",
          venueType: "cocktail_bar",
          musicType: "mixed",
          vibe: "casual"
        }
      ];

      const createdVenues = [];
      for (const venueData of sampleVenues) {
        const venue = await storage.createVenue(venueData);
        createdVenues.push(venue);
      }

      res.json(createdVenues);
    } catch (error) {
      console.error("Error initializing venues:", error);
      res.status(500).json({ message: "Failed to initialize venues" });
    }
  });

  // Check-in routes
  app.post('/api/checkin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const checkInData = insertCheckInSchema.parse({
        ...req.body,
        userId,
      });
      
      const checkIn = await storage.checkInToVenue(checkInData);
      res.json(checkIn);
    } catch (error) {
      console.error("Error checking in:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid check-in data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to check in" });
    }
  });

  app.post('/api/checkout', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { venueId } = req.body;
      
      await storage.checkOutFromVenue(userId, venueId);
      res.json({ message: "Checked out successfully" });
    } catch (error) {
      console.error("Error checking out:", error);
      res.status(500).json({ message: "Failed to check out" });
    }
  });

  app.get('/api/checkin/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const checkIn = await storage.getCurrentCheckIn(userId);
      
      if (!checkIn) {
        return res.status(404).json({ message: "No current check-in" });
      }
      
      res.json(checkIn);
    } catch (error) {
      console.error("Error fetching current check-in:", error);
      res.status(500).json({ message: "Failed to fetch current check-in" });
    }
  });

  // Get users at venue
  app.get('/api/venues/:venueId/users', isAuthenticated, async (req: any, res) => {
    try {
      const { venueId } = req.params;
      const currentUserId = req.user.claims.sub;
      
      const users = await storage.getUsersAtVenue(venueId);
      
      // Filter out current user and users who don't match preferences
      const currentUserProfile = await storage.getUserProfile(currentUserId);
      if (!currentUserProfile) {
        return res.status(400).json({ message: "Profile not found" });
      }
      
      const filteredUsers = users.filter(user => 
        user.id !== currentUserId &&
        user.checkIn.mode === currentUserProfile.sexualOrientation || 
        user.checkIn.mode === 'friends'
      );
      
      res.json(filteredUsers);
    } catch (error) {
      console.error("Error fetching users at venue:", error);
      res.status(500).json({ message: "Failed to fetch users at venue" });
    }
  });

  // Match routes
  app.post('/api/matches', isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.user.claims.sub;
      const matchData = insertMatchSchema.parse({
        ...req.body,
        requesterId,
      });
      
      // Check if there's already a match request
      const existingMatch = await storage.getMatchRequest(
        matchData.requesterId, 
        matchData.targetId, 
        matchData.venueId
      );
      
      if (existingMatch) {
        return res.status(400).json({ message: "Match request already exists" });
      }
      
      // Check if the target user already sent a request to this user
      const reverseMatch = await storage.getMatchRequest(
        matchData.targetId, 
        matchData.requesterId, 
        matchData.venueId
      );
      
      if (reverseMatch && reverseMatch.status === 'pending') {
        // It's a match! Update the reverse match
        const updatedMatch = await storage.updateMatchStatus(reverseMatch.id, 'matched');
        return res.json({ match: updatedMatch, isMatch: true });
      }
      
      // Create new match request
      const match = await storage.createMatchRequest(matchData);
      res.json({ match, isMatch: false });
    } catch (error) {
      console.error("Error creating match:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid match data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create match" });
    }
  });

  app.get('/api/matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await storage.getUserMatches(userId);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
