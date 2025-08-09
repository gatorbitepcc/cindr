import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';

type Match = { id: string; participants: string[]; lastMessageAt?: any };

export default function MatchesList({
  activeId, onSelect,
}: { activeId: string | null; onSelect: (id: string) => void }) {
  const uid = auth.currentUser!.uid;
  const [rows, setRows] = useState<Match[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'matches'),
      where('participants', 'array-contains', uid),
      orderBy('lastMessageAt', 'desc')
    );
    return onSnapshot(q, snap =>
      setRows(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
    );
  }, [uid]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b font-semibold">Chats</div>
      <div className="flex-1 overflow-y-auto">
        {rows.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${activeId === m.id ? 'bg-slate-100' : ''}`}
          >
            <div className="font-medium truncate">{(m.id || '').split('__').join(' • ')}</div>
            <div className="text-xs text-slate-500">Tap to open</div>
          </button>
        ))}
      </div>
    </div>
  );
}
