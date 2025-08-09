// src/components/pages/MainApp.tsx
import { useState } from 'react';
import SwipeDeck from '../components/SwipeDeck';
import MatchesList from '../components/MatchesList';
import ChatPane from '../components/ChatPane';

export default function MainApp() {
  const [activeMatch, setActiveMatch] = useState<string | null>(null);

  return (
    <div className="h-screen grid md:grid-cols-[300px_minmax(0,1fr)_420px]">
      {/* Left: matches list */}
      <aside className="hidden md:block border-r bg-white">
        <MatchesList activeId={activeMatch} onSelect={setActiveMatch} />
      </aside>

      {/* Middle: swipe deck */}
      <main className="bg-gradient-to-br from-white to-indigo-50/40 grid place-items-center">
        <div className="px-4 w-full max-w-xl">
          <SwipeDeck />
        </div>
      </main>

      {/* Right: chat pane */}
      <aside className="hidden md:block border-l bg-white">
        <ChatPane matchId={activeMatch} />
      </aside>
    </div>
  );
}
