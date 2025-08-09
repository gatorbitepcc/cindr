import { SwipeFeed } from '@/components/SwipeFeed';
import { Heart, Users, MapPin, Sparkles } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Cindr
            </h1>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Swipe your way to support
          </p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <div className="relative rounded-2xl overflow-hidden mb-8 shadow-card">
            <img 
              src={heroImage} 
              alt="Cancer support community connecting through Cindr" 
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h2 className="text-3xl font-bold mb-2">
                  Connect. Support. Heal.
                </h2>
                <p className="text-lg opacity-90">
                  Find caring people and valuable resources in your community
                </p>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card rounded-xl p-6 shadow-card text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">Connect with People</h3>
              <p className="text-sm text-muted-foreground">
                Meet patients, survivors, caregivers, and supporters who understand your journey
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-card text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">Find Local Resources</h3>
              <p className="text-sm text-muted-foreground">
                Discover transport help, support groups, and community programs nearby
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-card text-center">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">Personalized Matches</h3>
              <p className="text-sm text-muted-foreground">
                Smart matching based on your location, interests, and support needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Swipe Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Start Swiping
          </h2>
          <p className="text-muted-foreground mb-8">
            Swipe right to connect or save, left to skip
          </p>
          
          <SwipeFeed />
          
          <div className="mt-8 flex justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center mr-2 border border-border">
                <span className="text-destructive">✕</span>
              </div>
              Skip
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary shadow-glow flex items-center justify-center mr-2">
                <Heart className="w-4 h-4 text-primary-foreground" />
              </div>
              Connect
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4 mt-12">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-card-foreground">Cindr</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Building connections that heal. Supporting each other through every step.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;