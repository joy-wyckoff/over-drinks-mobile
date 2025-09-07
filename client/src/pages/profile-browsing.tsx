import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import ProfileCard from "@/components/profile-card";

export default function ProfileBrowsing() {
  const { venueId } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMatch, setCurrentMatch] = useState<any>(null);

  const { data: venue } = useQuery({
    queryKey: ["/api/venues", venueId],
    enabled: !!venueId,
  });

  const { data: usersAtVenue = [], isLoading } = useQuery({
    queryKey: ["/api/venues", venueId, "users"],
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

  const createMatchMutation = useMutation({
    mutationFn: async (targetId: string) => {
      const response = await apiRequest("POST", "/api/matches", {
        targetId,
        venueId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.isMatch) {
        // It's a match!
        setCurrentMatch(data.match);
        toast({
          title: "It's a Match!",
          description: "You both want to meet at the bar!",
        });
      } else {
        // Request sent
        toast({
          title: "Request Sent",
          description: "Your interest has been sent. If they're interested too, you'll both be notified!",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/venues", venueId, "users"] });
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
        title: "Request Failed",
        description: "Unable to send match request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMeetAtBar = (targetId: string) => {
    createMatchMutation.mutate(targetId);
  };

  const handleGoBack = () => {
    setLocation(`/checkin/${venueId}`);
  };

  const handleGoToMeetingSpot = () => {
    toast({
      title: "Meeting Spot",
      description: "Head to the main bar area - look for the vintage lamp above the center!",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-secondary text-2xl mb-4"></i>
          <p className="text-muted-foreground">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-bold text-secondary vintage-glow" data-testid="title-venue-people">
              People at {venue?.name || "This Venue"}
            </h1>
            <p className="text-sm text-muted-foreground" data-testid="text-people-count">
              <span className="text-accent">{usersAtVenue.length} people</span> currently checked in
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-accent"
              data-testid="button-mode-indicator"
            >
              <i className="fas fa-heart"></i>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="text-muted-foreground hover:text-accent"
              data-testid="button-back"
            >
              <i className="fas fa-arrow-left"></i>
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Cards */}
      <div className="p-4 space-y-4">
        {currentMatch && (
          <Card className="bg-secondary/20 border-2 border-secondary rounded-xl p-6 text-center">
            <div className="mb-4">
              <i className="fas fa-heart text-secondary text-3xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="title-match">
              It's a Match!
            </h3>
            <p className="text-muted-foreground text-sm mb-4" data-testid="text-match-description">
              You and your match both agreed to meet at the bar
            </p>
            
            {/* 4D Map Visualization Placeholder */}
            <Card className="bg-card rounded-lg p-4 mb-4 border border-border">
              <div className="text-center">
                <i className="fas fa-map text-accent text-2xl mb-2"></i>
                <p className="text-sm text-foreground" data-testid="text-meeting-location">
                  Meet at the main bar area
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-meeting-details">
                  Look for the vintage lamp above the center
                </p>
              </div>
            </Card>
            
            <Button 
              onClick={handleGoToMeetingSpot}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-all"
              data-testid="button-meeting-spot"
            >
              <i className="fas fa-walking mr-2"></i>Head to Meeting Spot
            </Button>
          </Card>
        )}

        {usersAtVenue.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-users text-muted-foreground text-3xl mb-4"></i>
            <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="title-no-people">
              No One Here Yet
            </h3>
            <p className="text-muted-foreground" data-testid="text-no-people-description">
              Be the first to check in and others will see you're here!
            </p>
          </div>
        ) : (
          usersAtVenue.map((userAtVenue) => (
            <ProfileCard
              key={userAtVenue.id}
              user={userAtVenue}
              profile={userAtVenue.profile}
              onMeetAtBar={() => handleMeetAtBar(userAtVenue.id)}
              onPass={() => {
                toast({
                  title: "Passed",
                  description: "Moving on to the next profile.",
                });
              }}
              isLoading={createMatchMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}
