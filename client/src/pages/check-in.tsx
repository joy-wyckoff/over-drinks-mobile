import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

export default function CheckIn() {
  const { venueId } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"dating" | "friends">("dating");
  const [aiRecommendations, setAiRecommendations] = useState(true);

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ["/api/venues", venueId],
    enabled: !!venueId,
    onError: (error: any) => {
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
    },
  });

  const { data: currentCheckIn } = useQuery({
    queryKey: ["/api/checkin/current"],
    retry: false,
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/checkin", {
        venueId,
        mode,
        aiRecommendations,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Checked In!",
        description: `You're now checked in at ${venue?.name}. Time to see who else is here!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/checkin/current"] });
      setLocation(`/browse/${venueId}`);
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
        title: "Check-in Failed",
        description: "Unable to check in at this venue. Please try again.",
        variant: "destructive",
      });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/checkout", {
        venueId: currentCheckIn?.venueId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Checked Out",
        description: "You've been checked out from your previous venue.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/checkin/current"] });
    },
  });

  // Auto check-out from previous venue if user is already checked in somewhere else
  useEffect(() => {
    if (currentCheckIn && currentCheckIn.venueId !== venueId) {
      checkOutMutation.mutate();
    }
  }, [currentCheckIn, venueId]);

  const handleCheckIn = () => {
    checkInMutation.mutate();
  };

  const handleGoBack = () => {
    setLocation("/venues");
  };

  if (venueLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-secondary text-2xl mb-4"></i>
          <p className="text-muted-foreground">Loading venue...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-destructive text-2xl mb-4"></i>
          <p className="text-foreground mb-4">Venue not found</p>
          <Button onClick={handleGoBack} data-testid="button-back-error">
            Back to Venues
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-bold text-secondary vintage-glow" data-testid="title-venue-name">
              {venue.name}
            </h1>
            <p className="text-sm text-muted-foreground" data-testid="text-venue-address">
              {venue.address}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="text-muted-foreground hover:text-accent"
            data-testid="button-back"
          >
            <i className="fas fa-arrow-left"></i>
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Check In Button */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <i className="fas fa-map-marker-alt text-secondary text-3xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2" data-testid="title-checkin">
            You're here!
          </h2>
          <p className="text-muted-foreground text-sm mb-6" data-testid="text-checkin-description">
            Check in to see who else is looking to connect
          </p>
          <Button
            onClick={handleCheckIn}
            disabled={checkInMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
            data-testid="button-checkin"
          >
            {checkInMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Checking In...
              </>
            ) : (
              <>
                <i className="fas fa-check mr-2"></i>
                Check In
              </>
            )}
          </Button>
        </div>

        {/* Mode Toggle */}
        <Card className="bg-card rounded-lg p-4 mb-6 border border-border">
          <h3 className="font-medium text-foreground mb-3" data-testid="title-mode-selection">
            What are you looking for?
          </h3>
          <div className="flex space-x-3">
            <Button
              variant={mode === "dating" ? "default" : "secondary"}
              onClick={() => setMode("dating")}
              className={`flex-1 py-2 px-4 text-sm transition-all ${
                mode === "dating"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              data-testid="button-mode-dating"
            >
              <i className="fas fa-heart mr-2"></i>Dating
            </Button>
            <Button
              variant={mode === "friends" ? "default" : "secondary"}
              onClick={() => setMode("friends")}
              className={`flex-1 py-2 px-4 text-sm transition-all ${
                mode === "friends"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              data-testid="button-mode-friends"
            >
              <i className="fas fa-user-friends mr-2"></i>Friends
            </Button>
          </div>
        </Card>

        {/* AI Recommendations Toggle */}
        <Card className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground" data-testid="title-ai-recommendations">
                Smart Recommendations
              </h4>
              <p className="text-sm text-muted-foreground" data-testid="text-ai-description">
                Use AI to prioritize compatible matches
              </p>
            </div>
            <Switch
              checked={aiRecommendations}
              onCheckedChange={setAiRecommendations}
              data-testid="switch-ai-recommendations"
            />
          </div>
        </Card>

        {/* Venue Info */}
        <Card className="bg-card rounded-lg p-4 mt-6 border border-border">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <i className="fas fa-fire text-accent"></i>
              <span className="text-sm text-foreground" data-testid="text-venue-popularity">
                <span className="font-semibold text-accent">{venue.currentUsers || 0}</span> people currently here
              </span>
            </div>
            {venue.description && (
              <p className="text-sm text-muted-foreground" data-testid="text-venue-description">
                {venue.description}
              </p>
            )}
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              {venue.venueType && (
                <span className="capitalize" data-testid="text-venue-type">
                  {venue.venueType.replace('_', ' ')}
                </span>
              )}
              {venue.musicType && (
                <span className="capitalize" data-testid="text-music-type">
                  {venue.musicType} Music
                </span>
              )}
              {venue.vibe && (
                <span className="capitalize" data-testid="text-venue-vibe">
                  {venue.vibe} Vibe
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
