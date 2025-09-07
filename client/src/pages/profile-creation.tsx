import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertUserProfileSchema, type UserProfile } from "@shared/schema";
import { z } from "zod";

const interests = [
  // Nightlife & Entertainment
  { value: "jazz", label: "🎷 Jazz Music", emoji: "🎷" },
  { value: "cocktails", label: "🍸 Cocktails", emoji: "🍸" },
  { value: "dancing", label: "💃 Dancing", emoji: "💃" },
  { value: "wine", label: "🍷 Wine", emoji: "🍷" },
  { value: "live-music", label: "🎵 Live Music", emoji: "🎵" },
  { value: "whiskey", label: "🥃 Whiskey", emoji: "🥃" },
  { value: "karaoke", label: "🎤 Karaoke", emoji: "🎤" },
  { value: "clubbing", label: "🕺 Clubbing", emoji: "🕺" },
  { value: "concerts", label: "🎸 Concerts", emoji: "🎸" },
  { value: "comedy", label: "😂 Comedy", emoji: "😂" },
  { value: "trivia", label: "🧠 Trivia", emoji: "🧠" },
  
  // Arts & Culture
  { value: "art", label: "🎨 Art", emoji: "🎨" },
  { value: "literature", label: "📚 Literature", emoji: "📚" },
  { value: "museums", label: "🏛️ Museums", emoji: "🏛️" },
  { value: "theater", label: "🎭 Theater", emoji: "🎭" },
  { value: "photography", label: "📷 Photography", emoji: "📷" },
  { value: "writing", label: "✍️ Writing", emoji: "✍️" },
  { value: "poetry", label: "📝 Poetry", emoji: "📝" },
  { value: "film", label: "🎬 Film & Movies", emoji: "🎬" },
  { value: "vintage", label: "⏰ Vintage", emoji: "⏰" },
  
  // Food & Drink
  { value: "cooking", label: "👨‍🍳 Cooking", emoji: "👨‍🍳" },
  { value: "foodie", label: "🍽️ Foodie", emoji: "🍽️" },
  { value: "coffee", label: "☕ Coffee", emoji: "☕" },
  { value: "craft-beer", label: "🍺 Craft Beer", emoji: "🍺" },
  { value: "brunch", label: "🥞 Brunch", emoji: "🥞" },
  { value: "baking", label: "🧁 Baking", emoji: "🧁" },
  
  // Lifestyle
  { value: "travel", label: "✈️ Travel", emoji: "✈️" },
  { value: "fashion", label: "👗 Fashion", emoji: "👗" },
  { value: "wellness", label: "🧘 Wellness", emoji: "🧘" },
  { value: "spirituality", label: "🙏 Spirituality", emoji: "🙏" },
  { value: "astrology", label: "⭐ Astrology", emoji: "⭐" },
  { value: "meditation", label: "🧘‍♀️ Meditation", emoji: "🧘‍♀️" },
  { value: "yoga", label: "🧘‍♂️ Yoga", emoji: "🧘‍♂️" },
  
  // Social & Personality
  { value: "socializing", label: "🗣️ Socializing", emoji: "🗣️" },
  { value: "networking", label: "🤝 Networking", emoji: "🤝" },
  { value: "debates", label: "💬 Debates", emoji: "💬" },
  { value: "volunteering", label: "❤️ Volunteering", emoji: "❤️" },
  { value: "activism", label: "✊ Activism", emoji: "✊" },
  
  // Hobbies
  { value: "reading", label: "📖 Reading", emoji: "📖" },
  { value: "gaming", label: "🎮 Gaming", emoji: "🎮" },
  { value: "board-games", label: "🎲 Board Games", emoji: "🎲" },
  { value: "chess", label: "♟️ Chess", emoji: "♟️" },
  { value: "collecting", label: "🏺 Collecting", emoji: "🏺" },
  { value: "crafts", label: "🧵 Arts & Crafts", emoji: "🧵" },
  { value: "gardening", label: "🌱 Gardening", emoji: "🌱" },
  
  // Music & Performance  
  { value: "music", label: "🎶 Music", emoji: "🎶" },
  { value: "singing", label: "🎤 Singing", emoji: "🎤" },
  { value: "piano", label: "🎹 Piano", emoji: "🎹" },
  { value: "guitar", label: "🎸 Guitar", emoji: "🎸" },
  { value: "violin", label: "🎻 Violin", emoji: "🎻" },
  
  // Business & Career
  { value: "entrepreneurship", label: "💼 Entrepreneurship", emoji: "💼" },
  { value: "investing", label: "📈 Investing", emoji: "📈" },
  { value: "real-estate", label: "🏠 Real Estate", emoji: "🏠" },
  { value: "technology", label: "💻 Technology", emoji: "💻" },
  { value: "crypto", label: "₿ Cryptocurrency", emoji: "₿" },
];

export default function ProfileCreation() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user already has a profile
  const { data: existingProfile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    enabled: !!user && !authLoading,
    retry: false,
  });

  const form = useForm({
    resolver: zodResolver(insertUserProfileSchema.omit({ userId: true }).extend({
      birthday: z.string().optional(),
      interests: z.array(z.string()).default([]),
    })),
    defaultValues: {
      username: "",
      phoneNumber: "",
      birthday: "",
      gender: "",
      sexualOrientation: "",
      interests: [] as string[],
      bio: "",
      profilePhotoUrl: "",
    },
  });

  // If user has existing profile, populate form
  useEffect(() => {
    if (existingProfile) {
      const profileData = {
        username: existingProfile.username || "",
        phoneNumber: existingProfile.phoneNumber || "",
        birthday: existingProfile.birthday ? new Date(existingProfile.birthday).toISOString().split('T')[0] : "",
        gender: existingProfile.gender || "",
        sexualOrientation: existingProfile.sexualOrientation || "",
        interests: existingProfile.interests || [],
        bio: existingProfile.bio || "",
        profilePhotoUrl: existingProfile.profilePhotoUrl || "",
      };
      form.reset(profileData);
      setSelectedInterests(existingProfile.interests || []);
      setProfilePhoto(existingProfile.profilePhotoUrl || "");
    }
  }, [existingProfile, form]);

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Created!",
        description: "Welcome to the speakeasy. Time to find your scene!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setLocation("/venues");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated!",
        description: "Your changes have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setLocation("/venues");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      const newInterests = prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest];
      form.setValue("interests", newInterests);
      return newInterests;
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePhoto(result);
        form.setValue("profilePhotoUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = (data: any) => {
    const profileData = {
      ...data,
      interests: selectedInterests,
      birthday: data.birthday ? new Date(data.birthday) : null,
    };

    if (existingProfile) {
      updateProfileMutation.mutate(profileData);
    } else {
      createProfileMutation.mutate(profileData);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-secondary text-2xl mb-4"></i>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-bold text-secondary vintage-glow" data-testid="title-profile">
              {existingProfile ? "Update Your Profile" : "Complete Your Profile"}
            </h2>
            <p className="text-muted-foreground mt-2" data-testid="text-subtitle">
              Make a great first impression
            </p>
          </div>

          {/* Profile Creation Form */}
          <Card className="bg-card rounded-lg p-6 speakeasy-shadow space-y-6">
            {/* Photo Upload */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-muted border-4 border-secondary/30 flex items-center justify-center overflow-hidden cursor-pointer"
                     onClick={triggerFileInput}>
                  {profilePhoto || form.watch("profilePhotoUrl") ? (
                    <img 
                      src={profilePhoto || form.watch("profilePhotoUrl")} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fas fa-camera text-muted-foreground text-2xl"></i>
                  )}
                </div>
                <button 
                  type="button"
                  onClick={triggerFileInput}
                  className="absolute -bottom-2 -right-2 bg-secondary text-secondary-foreground w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary/90 transition-colors"
                  data-testid="button-photo-upload"
                >
                  <i className="fas fa-plus text-sm"></i>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                data-testid="input-photo-file"
              />
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-photo-instruction">
                Click to add your best photo
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="YourUsername" 
                          {...field} 
                          data-testid="input-username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="+1 (555) 123-4567" 
                          {...field} 
                          data-testid="input-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birthday</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          data-testid="input-birthday"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-gender">
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="man">Man</SelectItem>
                          <SelectItem value="woman">Woman</SelectItem>
                          <SelectItem value="non-binary">Non-Binary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sexualOrientation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexual Orientation</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-orientation">
                            <SelectValue placeholder="Select Orientation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="straight">Straight</SelectItem>
                          <SelectItem value="gay">Gay</SelectItem>
                          <SelectItem value="lesbian">Lesbian</SelectItem>
                          <SelectItem value="bisexual">Bisexual</SelectItem>
                          <SelectItem value="pansexual">Pansexual</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Interests (Select up to 5)</FormLabel>
                  <p className="text-xs text-muted-foreground mb-2">Choose interests that best describe you</p>
                  <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-muted/30">
                    <div className="grid grid-cols-2 gap-2">
                      {interests.map((interest) => (
                        <button
                          key={interest.value}
                          type="button"
                          onClick={() => toggleInterest(interest.value)}
                          disabled={!selectedInterests.includes(interest.value) && selectedInterests.length >= 5}
                          className={`px-2 py-1.5 text-xs rounded-md transition-all text-left ${
                            selectedInterests.includes(interest.value)
                              ? "bg-secondary text-secondary-foreground shadow-sm"
                              : selectedInterests.length >= 5
                              ? "bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50"
                              : "bg-card hover:bg-secondary hover:text-secondary-foreground border border-border"
                          }`}
                          data-testid={`button-interest-${interest.value}`}
                        >
                          {interest.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedInterests.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected: {selectedInterests.length}/5
                    </p>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4} 
                          placeholder="Tell us about yourself..." 
                          className="resize-none" 
                          {...field} 
                          data-testid="textarea-bio"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 transition-all"
                  disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                  data-testid="button-submit"
                >
                  {createProfileMutation.isPending || updateProfileMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      {existingProfile ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    existingProfile ? "Update Profile" : "Enter the Speakeasy"
                  )}
                </Button>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
