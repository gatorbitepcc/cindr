// src/components/SwipeDeck.tsx
import TinderCard from 'react-tinder-card';
import { useEffect, useMemo, useState } from 'react';
import { auth, db } from '../lib/firebase'; // <-- adjust if your file is elsewhere
import {
  collection,
  getDocs,
  limit,
  query,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Minimal presentational card (inline to keep this file self-contained)
// If you already have a SwipeCard component, delete this and `import SwipeCard from './SwipeCard'`
function Card({ name, role, bio }: { name: string; role?: string; bio?: string }) {
  return (
    <div className="bg-white p-4 rounded-3xl shadow-xl">
      <div className="aspect-[4/5] rounded-2xl border grid place-items-center">
        <div className="text-3xl font-semibold">{name}</div>
      </div>
      <div className="mt-3">
        <div className="font-semibold">
          {name}{role ? ` • ${role}` : ''}
        </div>
        {bio ? <div className="text-sm text-slate-600 line-clamp-3">{bio}</div> : null}
      </div>
    </div>
  );
}

type UserDoc = {
  id: string;
  uid: string;
  name: string;
  role?: string;
  bio?: string;
  // optional later:
  tags?: string[];
  vector?: number[] | null;
};

export default function SwipeDeck() {
  const uid = auth.currentUser!.uid;
  const [cards, setCards] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Pull ~50 users and filter out self (client-side for speed; fine for hackathon)
      const snap = await getDocs(query(collection(db, 'users'), limit(50)));
      const all = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as UserDoc[];
      setCards(all.filter(p => (p.uid || p.id) !== uid));
      setLoading(false);
    })();
  }, [uid]);

  async function writeSwipe(targetUid: string, direction: 'left' | 'right') {
    const id = `${uid}__profile__${targetUid}`;
    await setDoc(doc(db, 'swipes', id), {
      swiperUid: uid,
      targetType: 'profile',
      targetId: targetUid,
      direction,
      createdAt: serverTimestamp(),
    });
  }

  const deck = useMemo(() => cards.slice(0, 20), [cards]);

  if (loading) return <div className="text-slate-500">Loading…</div>;
  if (!deck.length) return <div className="text-slate-500">No more cards right now.</div>;

  return (
    <div className="w-full">
      {deck.map(c => (
        <TinderCard
          key={c.uid || c.id}
          onSwipe={(dir) => {
            if (dir === 'left')  writeSwipe(c.uid || c.id, 'left');
            if (dir === 'right') writeSwipe(c.uid || c.id, 'right');
          }}
          preventSwipe={['up', 'down']}
        >
          <div className="mb-6">
            <Card name={c.name} role={c.role} bio={c.bio} />
            <div className="mt-4 flex gap-3 justify-center">
              <button
                className="px-5 py-2 rounded-xl border"
                onClick={() => writeSwipe(c.uid || c.id, 'left')}
              >
                No
              </button>
              <button
                className="px-5 py-2 rounded-xl bg-black text-white"
                onClick={() => writeSwipe(c.uid || c.id, 'right')}
              >
                Yes
              </button>
            </div>
          </div>
        </TinderCard>
      ))}
    </div>
  );
}
