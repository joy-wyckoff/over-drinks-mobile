import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Speakeasy Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-muted opacity-95"></div>
      <div 
        className="absolute inset-0 opacity-20" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1566417109768-bbd36fc89c11?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
      
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen p-6">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl font-bold text-secondary vintage-glow mb-4" data-testid="title-main">
            Over Drinks
          </h1>
          <div className="flex justify-center items-center space-x-3 mb-2">
            <i className="fas fa-wine-glass text-secondary text-2xl wine-glass-icon"></i>
            <i className="fas fa-wine-glass text-accent text-3xl wine-glass-icon"></i>
            <i className="fas fa-wine-glass text-secondary text-2xl wine-glass-icon"></i>
          </div>
          <p className="text-muted-foreground text-sm font-light" data-testid="text-tagline">
            Where connections happen over cocktails
          </p>
        </div>

        {/* Login Card */}
        <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm p-8 speakeasy-shadow art-deco-border">
          <div className="text-center space-y-6">
            <h2 className="text-xl font-semibold text-foreground" data-testid="text-welcome">
              Welcome to the Speakeasy
            </h2>
            <p className="text-muted-foreground text-sm" data-testid="text-description">
              Join an exclusive community of sophisticated singles who appreciate the finer things in life.
            </p>
            <Button 
              onClick={handleLogin}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 transition-all duration-300 transform hover:scale-105"
              data-testid="button-login"
            >
              Enter the Speakeasy
            </Button>
          </div>
        </Card>

        {/* Features */}
        <div className="mt-12 text-center max-w-md">
          <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-center space-x-2">
              <i className="fas fa-map-marker-alt text-accent"></i>
              <span>Find people at your favorite bars & clubs</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <i className="fas fa-heart text-accent"></i>
              <span>Connect with like-minded individuals</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <i className="fas fa-cocktail text-accent"></i>
              <span>Meet over drinks, not apps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
