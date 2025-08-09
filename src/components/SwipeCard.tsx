import React, { useState, useRef } from 'react';
import { Heart, X, MapPin, Tag } from 'lucide-react';
import { cn } from '@/lib/utils'; // Make sure this file exists — otherwise replace `cn(...)` with a string

// Define the data shape for each swipeable card
export interface CardData {
  id: string;
  type: 'person' | 'resource';
  name: string;
  age?: number;
  role?: string;
  bio?: string;
  description?: string;
  location: string;
  tags: string[];
  image?: string;
  distance?: string;
}

interface SwipeCardProps {
  card: CardData;
  onSwipe: (direction: 'left' | 'right', cardId: string) => void;
  isTop?: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ card, onSwipe, isTop = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTop) return;
    setIsDragging(true);
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isTop) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const newX = e.clientX - rect.left - rect.width / 2 - dragOffset.x;
      const newY = e.clientY - rect.top - rect.height / 2 - dragOffset.y;
      setDragOffset({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || !isTop) return;
    setIsDragging(false);

    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      onSwipe(dragOffset.x > 0 ? 'right' : 'left', card.id);
    }
    setDragOffset({ x: 0, y: 0 });
  };

  const handleButtonClick = (direction: 'left' | 'right') => {
    if (!isTop) return;
    onSwipe(direction, card.id);
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "absolute w-80 h-96 bg-card rounded-2xl shadow-card overflow-hidden cursor-grab select-none transition-transform duration-300",
        isDragging && "cursor-grabbing scale-105 shadow-card-hover",
        !isTop && "scale-95 opacity-60 pointer-events-none"
      )}
      style={{
        transform: isTop
          ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`
          : undefined,
        zIndex: isTop ? 10 : 1
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Card Image */}
      <div className="h-48 bg-gradient-soft flex items-center justify-center">
        {card.image ? (
          <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {card.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              {card.name}
              {card.age && <span className="text-muted-foreground ml-1">, {card.age}</span>}
            </h3>
            {card.role && (
              <p className="text-sm text-secondary-foreground font-medium">{card.role}</p>
            )}
          </div>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            {card.distance || "Nearby"}
          </div>
        </div>

        {card.bio && (
          <div className="text-sm text-slate-600 line-clamp-3">{card.bio}</div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-2">{card.description}</p>

        <div className="flex items-center text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 mr-1" />
          {card.location}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {card.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent-soft text-accent-foreground"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {card.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{card.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {isTop && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
          <button
            onClick={() => handleButtonClick('left')}
            className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 border border-border"
          >
            <X className="w-6 h-6 text-destructive" />
          </button>
          <button
            onClick={() => handleButtonClick('right')}
            className="w-12 h-12 rounded-full bg-primary shadow-glow flex items-center justify-center hover:scale-110 transition-transform duration-200"
          >
            <Heart className="w-6 h-6 text-primary-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};
