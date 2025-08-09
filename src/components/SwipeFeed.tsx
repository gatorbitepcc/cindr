import { useState, useEffect } from 'react';
import { SwipeCard, CardData } from './SwipeCard';
import { useToast } from '@/hooks/use-toast';

const mockData: CardData[] = [
  {
    id: '1',
    type: 'person',
    name: 'Sarah Johnson',
    age: 34,
    role: 'Breast Cancer Survivor',
    description: 'Looking to connect with others who understand the journey. Love hiking and meditation.',
    location: 'Downtown Medical District',
    tags: ['Survivor', 'Exercise', 'Meditation', 'Support Groups'],
    distance: '2.1 miles'
  },
  {
    id: '2',
    type: 'resource',
    name: 'Free Transportation Service',
    description: 'Volunteer drivers available for medical appointments. Call 24/7 for scheduling.',
    location: 'City-wide Coverage',
    tags: ['Transportation', 'Medical Appointments', 'Free', 'Volunteers']
  },
  {
    id: '3',
    type: 'person',
    name: 'Michael Chen',
    age: 42,
    role: 'Caregiver',
    description: 'Caring for my partner. Would love to meet other caregivers for mutual support.',
    location: 'Riverside Community',
    tags: ['Caregiver', 'Support', 'Coffee Chats', 'Understanding'],
    distance: '1.8 miles'
  },
  {
    id: '4',
    type: 'resource',
    name: 'Wellness Workshop Series',
    description: 'Monthly workshops on nutrition, stress management, and holistic healing approaches.',
    location: 'Community Health Center',
    tags: ['Workshops', 'Nutrition', 'Stress Management', 'Holistic Health']
  },
  {
    id: '5',
    type: 'person',
    name: 'Emma Rodriguez',
    age: 28,
    role: 'Cancer Patient',
    description: 'Recently diagnosed. Looking for friends who can share experiences and encouragement.',
    location: 'University District',
    tags: ['Patient', 'New Diagnosis', 'Friendship', 'Encouragement'],
    distance: '3.5 miles'
  }
];

export const SwipeFeed = () => {
  const [cards, setCards] = useState<CardData[]>(mockData);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const { toast } = useToast();

  const handleSwipe = (direction: 'left' | 'right', cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    if (direction === 'right') {
      toast({
        title: card.type === 'person' ? 'Connection Made!' : 'Resource Saved!',
        description: card.type === 'person' 
          ? `You've connected with ${card.name}. They'll be notified!`
          : `${card.name} has been saved to your resources.`,
        className: "bg-success-soft border-success text-success-foreground"
      });
    }

    // Remove the swiped card and move to next
    setCards(prev => prev.filter(c => c.id !== cardId));
    
    // If we're running out of cards, you could load more here
    if (cards.length <= 2) {
      // Load more cards logic would go here
      console.log('Loading more cards...');
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
          <span className="text-2xl">🎉</span>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          You're all caught up!
        </h3>
        <p className="text-muted-foreground">
          Check back later for more connections and resources.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center h-96 w-80 mx-auto">
      {cards.slice(0, 3).map((card, index) => (
        <SwipeCard
          key={card.id}
          card={card}
          onSwipe={handleSwipe}
          isTop={index === 0}
        />
      ))}
    </div>
  );
};