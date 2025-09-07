import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
    enabled: !!user && !authLoading,
  });

  useEffect(() => {
    if (!authLoading && user && !profileLoading) {
      if (!profile) {
        // User needs to create profile
        setLocation("/profile/create");
      } else {
        // User has profile, go to venue discovery
        setLocation("/venues");
      }
    }
  }, [user, profile, authLoading, profileLoading, setLocation]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-md mx-auto space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
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
            <h1 className="font-serif text-3xl font-bold text-secondary vintage-glow" data-testid="title-welcome">
              Welcome Back
            </h1>
            <p className="text-muted-foreground mt-2" data-testid="text-greeting">
              {user?.firstName ? `Hello, ${user.firstName}!` : "Ready for another night out?"}
            </p>
          </div>

          {/* Status Card */}
          <Card className="bg-card rounded-lg p-6 speakeasy-shadow mb-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary/20 mx-auto flex items-center justify-center">
                <i className="fas fa-cocktail text-secondary text-2xl"></i>
              </div>
              <div>
                <h3 className="font-semibold text-foreground" data-testid="text-status-title">
                  Ready to Mingle?
                </h3>
                <p className="text-sm text-muted-foreground" data-testid="text-status-description">
                  {profile ? "Your profile is complete. Time to find your scene!" : "Complete your profile to start meeting people."}
                </p>
              </div>
              <Button 
                onClick={() => setLocation(profile ? "/venues" : "/profile/create")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-continue"
              >
                {profile ? "Find Venues" : "Complete Profile"}
              </Button>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setLocation("/venues")}
              disabled={!profile}
              data-testid="button-venues"
            >
              <i className="fas fa-map-marker-alt mr-2"></i>
              Discover Venues
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setLocation("/profile/create")}
              data-testid="button-profile"
            >
              <i className="fas fa-user-edit mr-2"></i>
              {profile ? "Edit Profile" : "Create Profile"}
            </Button>
          </div>

          {/* Logout */}
          <div className="mt-8 text-center">
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-accent"
              data-testid="button-logout"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
