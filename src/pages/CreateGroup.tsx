import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CreateGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!groupName || !description || !category) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        className: "bg-warning/10 border-warning text-warning-foreground"
      });
      return;
    }

    toast({
      title: 'Group Created Successfully!',
      description: `"${groupName}" has been created. You'll be notified once it's approved and ready for members to join.`,
      className: "bg-success-soft border-success text-success-foreground"
    });

    // Reset form
    setGroupName('');
    setDescription('');
    setCategory('');
    setLocation('');
    setMeetingTime('');
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create a Support Group
          </h1>
          <p className="text-muted-foreground">
            Start a new community to bring people together
          </p>
        </div>

        <Card className="bg-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Heart className="w-5 h-5 mr-2 text-primary" />
              Group Details
            </CardTitle>
            <CardDescription>
              Tell us about the group you'd like to create
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name *</Label>
                <Input
                  id="groupName"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter a descriptive group name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Group Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose, goals, and what members can expect from this group"
                  className="resize-none min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="support">General Support Group</SelectItem>
                    <SelectItem value="caregiver">Caregiver Support</SelectItem>
                    <SelectItem value="survivor">Survivor Support</SelectItem>
                    <SelectItem value="family">Family & Friends</SelectItem>
                    <SelectItem value="wellness">Wellness & Exercise</SelectItem>
                    <SelectItem value="creative">Creative Therapy</SelectItem>
                    <SelectItem value="age-specific">Age-Specific Group</SelectItem>
                    <SelectItem value="cancer-specific">Cancer Type Specific</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Meeting Location</Label>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where will the group meet? (Optional for online groups)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meetingTime">Preferred Meeting Time</Label>
                <Input
                  id="meetingTime"
                  type="text"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  placeholder="e.g., Weekly on Tuesdays at 6:00 PM"
                />
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Before You Submit</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your group will be reviewed for approval</li>
                  <li>• You'll be notified once it's ready for members</li>
                  <li>• Consider how you'll moderate and support members</li>
                  <li>• Think about meeting logistics and accessibility</li>
                </ul>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Create Group
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateGroup;