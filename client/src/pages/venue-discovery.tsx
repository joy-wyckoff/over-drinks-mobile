import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import VenueCard from "@/components/venue-card";

const filters = [
  { value: "all", label: "All" },
  { value: "jazz_club", label: "Jazz Clubs" },
  { value: "cocktail_bar", label: "Cocktail Bars" },
  { value: "dance_club", label: "Dance Clubs" },
  { value: "speakeasy", label: "Speakeasy" },
];

export default function VenueDiscovery() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [friendMode, setFriendMode] = useState(false);

  // Initialize venues on first load
  const initializeVenuesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/venues/initialize", {});
      return response.json();
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
    },
  });

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ["/api/venues", activeFilter],
    queryFn: async () => {
      const url = activeFilter === "all" ? "/api/venues" : `/api/venues?type=${activeFilter}`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch venues");
      return response.json();
    },
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

  // Initialize venues if none exist
  useEffect(() => {
    if (!isLoading && venues.length === 0) {
      initializeVenuesMutation.mutate();
    }
  }, [venues.length, isLoading]);

  // Refresh venues after initialization
  useEffect(() => {
    if (initializeVenuesMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
    }
  }, [initializeVenuesMutation.isSuccess, queryClient]);

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVenueSelect = (venueId: string) => {
    // Mock opening directions (in real app, would open maps)
    toast({
      title: "Directions Opening",
      description: "Opening directions in your maps app...",
    });
    
    // Navigate to check-in after a short delay
    setTimeout(() => {
      setLocation(`/checkin/${venueId}`);
    }, 1000);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const recommendedVenues = filteredVenues
    .sort((a, b) => (b.currentUsers || 0) - (a.currentUsers || 0))
    .slice(0, 3);

  const nearbyVenues = filteredVenues.filter(venue => !recommendedVenues.includes(venue));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-secondary vintage-glow" data-testid="title-venues">
            Find Your Scene
          </h1>
          <div className="flex items-center space-x-3">
            <Button
              variant={friendMode ? "default" : "ghost"}
              size="sm"
              onClick={() => setFriendMode(!friendMode)}
              className={friendMode ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-accent"}
              data-testid="button-friend-mode"
            >
              <i className="fas fa-user-friends mr-2"></i>
              {friendMode ? "Friend Mode" : "Dating Mode"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-muted-foreground hover:text-accent"
              data-testid="button-profile"
            >
              <i className="fas fa-user"></i>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-accent"
              data-testid="button-logout"
            >
              <i className="fas fa-sign-out-alt"></i>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search bars & clubs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg"
            data-testid="input-search"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveFilter(filter.value)}
              className={`whitespace-nowrap ${
                activeFilter === filter.value
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              data-testid={`button-filter-${filter.value}`}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {isLoading || initializeVenuesMutation.isPending ? (
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-secondary text-2xl mb-4"></i>
            <p className="text-muted-foreground" data-testid="text-loading">
              {initializeVenuesMutation.isPending ? "Setting up venues..." : "Loading venues..."}
            </p>
          </div>
        ) : (
          <>
            {/* Recommendations */}
            {recommendedVenues.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3" data-testid="title-recommended">
                  Recommended for You
                </h3>
                <div className="space-y-3">
                  {recommendedVenues.map((venue) => (
                    <VenueCard
                      key={venue.id}
                      venue={venue}
                      onSelect={() => handleVenueSelect(venue.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Venues */}
            {nearbyVenues.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3" data-testid="title-nearby">
                  Nearby Venues
                </h3>
                <div className="space-y-3">
                  {nearbyVenues.map((venue) => (
                    <VenueCard
                      key={venue.id}
                      venue={venue}
                      onSelect={() => handleVenueSelect(venue.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredVenues.length === 0 && (
              <div className="text-center py-8">
                <i className="fas fa-search text-muted-foreground text-2xl mb-4"></i>
                <p className="text-muted-foreground" data-testid="text-no-results">
                  No venues found matching your search.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
