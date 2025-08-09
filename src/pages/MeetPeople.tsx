import { Header } from '@/components/Header';
import { SwipeFeed } from '@/components/SwipeFeed';
import { Heart, X } from 'lucide-react';

const MeetPeople = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Meet People Who Understand
          </h1>
          <p className="text-muted-foreground">
            Connect with patients, survivors, caregivers, and supporters in your area
          </p>
        </div>

        {/* Swipe Section */}
        <section className="py-4">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Start Connecting
            </h2>
            <p className="text-muted-foreground mb-8">
              Swipe right to connect, left to skip
            </p>
            
            <SwipeFeed />
            
            <div className="mt-8 flex justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center mr-2 border border-border">
                  <X className="w-5 h-5 text-destructive" />
                </div>
                <span>Skip</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary shadow-glow flex items-center justify-center mr-2">
                  <Heart className="w-5 h-5 text-primary-foreground" />
                </div>
                <span>Connect</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-12 max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Connection Tips
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium text-card-foreground mb-1">Be Genuine</h4>
                <p className="text-sm text-muted-foreground">
                  Share your authentic story and experiences
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🤝</span>
                </div>
                <h4 className="font-medium text-card-foreground mb-1">Listen First</h4>
                <p className="text-sm text-muted-foreground">
                  Everyone's journey is unique and valuable
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🌱</span>
                </div>
                <h4 className="font-medium text-card-foreground mb-1">Take Your Time</h4>
                <p className="text-sm text-muted-foreground">
                  Build meaningful connections at your own pace
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MeetPeople;