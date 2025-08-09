import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, Calendar, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockGroups = [
  {
    id: '1',
    name: 'Breast Cancer Warriors',
    description: 'A supportive community for those affected by breast cancer. We meet weekly to share experiences, offer encouragement, and celebrate victories together.',
    category: 'Support Group',
    location: 'Downtown Medical Center',
    members: 24,
    nextMeeting: 'Thursday, 2:00 PM'
  },
  {
    id: '2',
    name: 'Caregiver Connect',
    description: 'Supporting those who care for cancer patients. Share resources, tips, and find understanding among fellow caregivers.',
    category: 'Caregiver Support',
    location: 'Community Health Hub',
    members: 18,
    nextMeeting: 'Monday, 6:30 PM'
  },
  {
    id: '3',
    name: 'Young Adults Fighting Cancer',
    description: 'For young adults (18-39) navigating cancer diagnosis and treatment. Connect with peers who understand the unique challenges.',
    category: 'Age-Specific',
    location: 'University District',
    members: 15,
    nextMeeting: 'Saturday, 10:00 AM'
  },
  {
    id: '4',
    name: 'Healing Through Art',
    description: 'Express yourself through creative arts while building connections with fellow cancer survivors and patients.',
    category: 'Creative Therapy',
    location: 'Arts & Wellness Center',
    members: 12,
    nextMeeting: 'Tuesday, 1:00 PM'
  },
  {
    id: '5',
    name: 'Exercise & Wellness Circle',
    description: 'Gentle fitness and wellness activities designed for cancer patients and survivors. All fitness levels welcome.',
    category: 'Wellness',
    location: 'Riverside Community Center',
    members: 20,
    nextMeeting: 'Friday, 9:00 AM'
  },
  {
    id: '6',
    name: 'Family & Friends Support',
    description: 'For family members and friends of cancer patients. Learn how to provide the best support while taking care of yourself.',
    category: 'Family Support',
    location: 'Hope & Healing Center',
    members: 16,
    nextMeeting: 'Wednesday, 7:00 PM'
  }
];

const FindGroups = () => {
  const { toast } = useToast();

  const handleJoinGroup = (groupName: string) => {
    toast({
      title: 'Joined Group!',
      description: `You've successfully joined "${groupName}". You'll receive details about upcoming meetings.`,
      className: "bg-success-soft border-success text-success-foreground"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Find Your Support Group
          </h1>
          <p className="text-muted-foreground">
            Connect with local groups that understand your journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGroups.map((group) => (
            <Card key={group.id} className="bg-card shadow-card hover:shadow-card-hover transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                    {group.category}
                  </span>
                </div>
                <CardTitle className="text-lg text-card-foreground">
                  {group.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {group.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {group.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Heart className="w-4 h-4 mr-2" />
                    {group.members} members
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    Next: {group.nextMeeting}
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleJoinGroup(group.name)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Join Group
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FindGroups;