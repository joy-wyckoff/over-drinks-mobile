import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ProfileCardProps {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  profile: {
    username: string;
    bio?: string;
    interests?: string[];
    birthday?: string;
  };
  onMeetAtBar: () => void;
  onPass: () => void;
  isLoading?: boolean;
}

export default function ProfileCard({ user, profile, onMeetAtBar, onPass, isLoading }: ProfileCardProps) {
  // Calculate age from birthday
  const age = profile.birthday 
    ? Math.floor((Date.now() - new Date(profile.birthday).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  const displayName = user.firstName 
    ? `${user.firstName}${age ? `, ${age}` : ''}`
    : profile.username;

  const interestEmojis: Record<string, string> = {
    // Nightlife & Entertainment
    jazz: "🎷", cocktails: "🍸", dancing: "💃", wine: "🍷", "live-music": "🎵", 
    whiskey: "🥃", karaoke: "🎤", clubbing: "🕺", concerts: "🎸", comedy: "😂", trivia: "🧠",
    
    // Arts & Culture
    art: "🎨", literature: "📚", museums: "🏛️", theater: "🎭", photography: "📷", 
    writing: "✍️", poetry: "📝", film: "🎬", vintage: "⏰",
    
    // Food & Drink
    cooking: "👨‍🍳", foodie: "🍽️", coffee: "☕", "craft-beer": "🍺", brunch: "🥞", baking: "🧁",
    
    // Lifestyle
    travel: "✈️", fashion: "👗", wellness: "🧘", spirituality: "🙏", astrology: "⭐", 
    meditation: "🧘‍♀️", yoga: "🧘‍♂️",
    
    // Social & Personality
    socializing: "🗣️", networking: "🤝", debates: "💬", volunteering: "❤️", activism: "✊",
    
    // Hobbies
    reading: "📖", gaming: "🎮", "board-games": "🎲", chess: "♟️", collecting: "🏺", 
    crafts: "🧵", gardening: "🌱",
    
    // Music & Performance
    music: "🎶", singing: "🎤", piano: "🎹", guitar: "🎸", violin: "🎻",
    
    // Business & Career
    entrepreneurship: "💼", investing: "📈", "real-estate": "🏠", technology: "💻", crypto: "₿",
  };

  return (
    <Card className="bg-card rounded-xl p-6 border border-border speakeasy-shadow">
      <div className="flex items-start space-x-4">
        {/* Profile Photo */}
        <div className="w-20 h-20 rounded-full bg-muted border-2 border-secondary/30 flex items-center justify-center flex-shrink-0">
          {user.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt={`${displayName}'s profile`}
              className="w-full h-full rounded-full object-cover"
              data-testid={`img-profile-${user.id}`}
            />
          ) : (
            <i className="fas fa-user text-muted-foreground text-xl"></i>
          )}
        </div>
        
        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-foreground" data-testid={`text-profile-name-${user.id}`}>
              {displayName}
            </h3>
            <Button 
              variant="ghost"
              size="sm"
              className="text-accent hover:text-accent/80"
              data-testid={`button-profile-info-${user.id}`}
            >
              <i className="fas fa-info-circle"></i>
            </Button>
          </div>
          
          {profile.bio && (
            <p className="text-sm text-muted-foreground mb-3" data-testid={`text-profile-bio-${user.id}`}>
              {profile.bio}
            </p>
          )}
          
          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.interests.slice(0, 3).map((interest) => (
                <span 
                  key={interest}
                  className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full"
                  data-testid={`text-interest-${interest}-${user.id}`}
                >
                  {interestEmojis[interest] || "•"} {interest.replace('-', ' ')}
                </span>
              ))}
              {profile.interests.length > 3 && (
                <span className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full">
                  +{profile.interests.length - 3} more
                </span>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              onClick={onMeetAtBar}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
              data-testid={`button-meet-${user.id}`}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-heart mr-2"></i>
                  Meet at Bar
                </>
              )}
            </Button>
            <Button 
              onClick={onPass}
              variant="secondary"
              className="bg-muted hover:bg-muted/80 text-muted-foreground px-4 py-2 rounded-lg text-sm transition-all"
              data-testid={`button-pass-${user.id}`}
            >
              Pass
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
