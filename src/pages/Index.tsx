import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Heart, Users, MapPin, Sparkles, MessageCircle, Settings } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />

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

      {/* Main Navigation Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            How would you like to connect?
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            Choose your path to building meaningful connections and finding the support you need.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Meet People Button */}
            <Link to="/find-matches" className="group">
              <div className="bg-card rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 group-hover:shadow-glow transition-shadow">
                  <Heart className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Meet People</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Connect one-on-one with patients, survivors, caregivers, and supporters through personalized matching.
                </p>
                <Button variant="outline" className="w-full border-success text-success hover:bg-success hover:text-success-foreground">
                  Start Matching
                </Button>
              </div>
            </Link>

            {/* Messages Button */}
            <Link to="/messages" className="group">
              <div className="bg-card rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:shadow-glow transition-shadow">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Messages</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Chat with people you've connected with and keep the conversation going.
                </p>
                <Button variant="outline" className="w-full border-blue-400 text-blue-600 hover:bg-blue-100 hover:text-blue-800">
                  Open Messages
                </Button>
              </div>
            </Link>

            {/* Settings Button */}
            <Link to="/settings" className="group">
              <div className="bg-card rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-6 group-hover:shadow-glow transition-shadow">
                  <Settings className="w-8 h-8 text-gray-800" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Settings</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Manage your profile, update your username, and change your preferences.
                </p>
                <Button variant="outline" className="w-full border-gray-400 text-gray-800 hover:bg-gray-200 hover:text-black">
                  Open Settings
                </Button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4 mt-16">
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