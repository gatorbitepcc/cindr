// src/components/ChatPane.tsx
import { useEffect, useRef, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';

type Msg = { id: string; senderUid: string; text: string; createdAt?: any };

export default function ChatPane({ matchId }: { matchId: string | null }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchId) return;
    const ref = collection(db, 'chats', matchId, 'messages');
    const q = query(ref, orderBy('createdAt', 'asc'), limit(200));
    return onSnapshot(q, snap => setMsgs(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))));
  }, [matchId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  async function send() {
    if (!text.trim() || !matchId) return;
    await addDoc(collection(db, 'chats', matchId, 'messages'), {
      senderUid: auth.currentUser!.uid,
      text: text.trim(),
      createdAt: serverTimestamp(),
    });
    setText('');
  }

  if (!matchId) return <div className="p-6 text-slate-500">Pick a chat</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b font-semibold">Chat</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {msgs.map(m => (
          <div
            key={m.id}
            className={`max-w-[75%] px-3 py-2 rounded-xl ${
              m.senderUid === auth.currentUser!.uid ? 'bg-black text-white ml-auto' : 'bg-slate-100'
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button className="px-4 py-2 rounded-xl bg-black text-white" onClick={send}>Send</button>
      </div>
    </div>
  );
}
