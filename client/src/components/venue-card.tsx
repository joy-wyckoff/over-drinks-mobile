import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface VenueCardProps {
  venue: {
    id: string;
    name: string;
    description?: string;
    address: string;
    venueType?: string;
    musicType?: string;
    vibe?: string;
    currentUsers?: number;
  };
  onSelect: () => void;
}

export default function VenueCard({ venue, onSelect }: VenueCardProps) {
  // Calculate distance placeholder (in real app, would use geolocation)
  const distance = Math.random() * 2 + 0.1; // Random distance between 0.1-2.1 miles

  return (
    <Card className="bg-card rounded-lg p-4 border border-border speakeasy-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground" data-testid={`text-venue-name-${venue.id}`}>
            {venue.name}
          </h4>
          <p className="text-sm text-muted-foreground" data-testid={`text-venue-description-${venue.id}`}>
            {venue.description || "Great atmosphere and cocktails"}
          </p>
          <div className="flex items-center mt-2 space-x-3">
            <span className="flex items-center text-sm text-accent">
              <i className="fas fa-fire mr-1"></i>
              <span data-testid={`text-venue-users-${venue.id}`}>
                {venue.currentUsers || 0}
              </span>
            </span>
            <span className="text-sm text-muted-foreground" data-testid={`text-venue-distance-${venue.id}`}>
              {distance.toFixed(1)} miles
            </span>
            {venue.venueType && (
              <span className="text-xs text-muted-foreground capitalize" data-testid={`text-venue-type-${venue.id}`}>
                {venue.venueType.replace('_', ' ')}
              </span>
            )}
          </div>
          {(venue.musicType || venue.vibe) && (
            <div className="flex items-center mt-1 space-x-2 text-xs text-muted-foreground">
              {venue.musicType && (
                <span className="capitalize" data-testid={`text-music-type-${venue.id}`}>
                  {venue.musicType} music
                </span>
              )}
              {venue.vibe && (
                <span className="capitalize" data-testid={`text-venue-vibe-${venue.id}`}>
                  {venue.vibe} vibe
                </span>
              )}
            </div>
          )}
        </div>
        <Button 
          onClick={onSelect}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-all ml-4"
          data-testid={`button-venue-select-${venue.id}`}
        >
          <i className="fas fa-directions mr-2"></i>Go
        </Button>
      </div>
    </Card>
  );
}
