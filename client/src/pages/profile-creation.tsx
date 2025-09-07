import { useState, useEffect } from "react";
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
import { insertUserProfileSchema } from "@shared/schema";

const interests = [
  { value: "jazz", label: "🎷 Jazz Music", emoji: "🎷" },
  { value: "cocktails", label: "🍸 Cocktails", emoji: "🍸" },
  { value: "dancing", label: "💃 Dancing", emoji: "💃" },
  { value: "wine", label: "🍷 Wine", emoji: "🍷" },
  { value: "art", label: "🎨 Art", emoji: "🎨" },
  { value: "live-music", label: "🎵 Live Music", emoji: "🎵" },
  { value: "whiskey", label: "🥃 Whiskey", emoji: "🥃" },
  { value: "literature", label: "📚 Literature", emoji: "📚" },
];

export default function ProfileCreation() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Check if user already has a profile
  const { data: existingProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
    enabled: !!user && !authLoading,
    retry: false,
  });

  const form = useForm({
    resolver: zodResolver(insertUserProfileSchema.omit({ userId: true })),
    defaultValues: {
      username: "",
      phoneNumber: "",
      birthday: "",
      gender: "",
      sexualOrientation: "",
      interests: [],
      bio: "",
      profilePhotoUrl: "",
    },
  });

  // If user has existing profile, populate form
  useEffect(() => {
    if (existingProfile) {
      form.reset({
        username: existingProfile.username || "",
        phoneNumber: existingProfile.phoneNumber || "",
        birthday: existingProfile.birthday ? new Date(existingProfile.birthday).toISOString().split('T')[0] : "",
        gender: existingProfile.gender || "",
        sexualOrientation: existingProfile.sexualOrientation || "",
        interests: existingProfile.interests || [],
        bio: existingProfile.bio || "",
        profilePhotoUrl: existingProfile.profilePhotoUrl || "",
      });
      setSelectedInterests(existingProfile.interests || []);
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
            {/* Photo Upload Placeholder */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-muted border-4 border-secondary/30 flex items-center justify-center overflow-hidden">
                  {form.watch("profilePhotoUrl") ? (
                    <img 
                      src={form.watch("profilePhotoUrl")} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fas fa-camera text-muted-foreground text-2xl"></i>
                  )}
                </div>
                <button 
                  type="button"
                  className="absolute -bottom-2 -right-2 bg-secondary text-secondary-foreground w-8 h-8 rounded-full flex items-center justify-center"
                  data-testid="button-photo-upload"
                >
                  <i className="fas fa-plus text-sm"></i>
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-photo-instruction">
                Add your best photo
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
                  <FormLabel>Interests</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {interests.map((interest) => (
                      <button
                        key={interest.value}
                        type="button"
                        onClick={() => toggleInterest(interest.value)}
                        className={`px-3 py-2 text-sm rounded-md transition-all ${
                          selectedInterests.includes(interest.value)
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted hover:bg-secondary hover:text-secondary-foreground"
                        }`}
                        data-testid={`button-interest-${interest.value}`}
                      >
                        {interest.label}
                      </button>
                    ))}
                  </div>
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
