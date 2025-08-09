// src/pages/Messages.tsx
import { useMemo, useState } from "react";
import {
  MessageCircle,
  Users,
  Search,
  MoreHorizontal,
  Send,
  MapPin,
  Camera,
  Image,    
  Clock,
} from "lucide-react";

const cn = (...xs: (string | false | null | undefined)[]) =>
  xs.filter(Boolean).join(" ");

type Chat = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
};

type Bubble = {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
};

const CHATS: Chat[] = [
  { id: "1", name: "Sarah Wilson", lastMessage: "", time: "2m", unread: 0 },
  { id: "2", name: "Mike Johnson", lastMessage: "", time: "1h" },
  { id: "3", name: "Emma Davis", lastMessage: "", time: "3h", unread: 0 },
  { id: "4", name: "Alex Chen", lastMessage: "", time: "1d" },
  { id: "5", name: "Lisa Brown", lastMessage: "", time: "2d" },
];

const THREADS: Record<string, Bubble[]> = {
  "1": [],
  "2": [],
  "3": [],
  "4": [],
  "5": [],
};

export default function Messages() {
  const [activeId, setActiveId] = useState<string>(CHATS[0].id);
  const [input, setInput] = useState("");

  const activeChat = useMemo(
    () => CHATS.find((c) => c.id === activeId) ?? CHATS[0],
    [activeId]
  );

  const thread = THREADS[activeId] ?? [];

  const send = () => {
    if (!input.trim()) return;
    THREADS[activeId] = [
      ...(THREADS[activeId] ?? []),
      {
        id: Math.random().toString(36),
        fromMe: true,
        text: input.trim(),
        time: "Now",
      },
    ];
    setInput("");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="h-14 border-b bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-[#ff5a3a]">Cindr</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-neutral-500">John Doe</div>
          <div className="size-8 rounded-full bg-neutral-200" />
        </div>
      </header>

      <main className="grid grid-cols-[320px_minmax(0,1fr)_360px] h-[calc(100vh-56px)]">
        {/* LEFT: Chats list */}
        <aside className="border-r">
          {/* tabs */}
          <div className="p-3 flex gap-2">
            <button className="flex-1 h-9 rounded-lg border text-sm flex items-center justify-center gap-2 bg-white text-[#ff5a3a] border-[#ff5a3a]">
              <Users className="w-4 h-4" /> Matcher
            </button>
            <button className="flex-1 h-9 rounded-lg bg-[#ff5a3a] text-white text-sm flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> Messages
            </button>
          </div>

          {/* search */}
          <div className="px-3 pb-2">
            <div className="h-10 px-3 rounded-lg border flex items-center gap-2 text-neutral-500">
              <Search className="w-4 h-4" />
              <input placeholder="Search" className="outline-none text-sm flex-1" />
            </div>
          </div>

          {/* chat list */}
          <div className="overflow-y-auto">
            <div className="px-3 py-2 text-xs font-semibold text-neutral-500">Chats</div>
            {CHATS.map((c) => {
              const active = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "w-full px-3 py-3 flex items-center gap-3 border-b",
                    active ? "bg-orange-50" : "hover:bg-neutral-50"
                  )}
                >
                  <div className="relative">
                    <div className="size-10 rounded-full bg-neutral-200" />
                    {c.unread ? (
                      <span className="absolute -right-1 -top-1 text-[10px] font-semibold bg-[#ff5a3a] text-white rounded-full px-1.5 py-0.5">
                        {c.unread}
                      </span>
                    ) : null}
                  </div>

                  <div className="text-left min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-sm truncate">{c.name}</div>
                      <div className="text-[11px] text-neutral-500">{c.time}</div>
                    </div>
                    <div className="text-sm text-neutral-500 truncate">{c.lastMessage || "No messages yet"}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* CENTER: Conversation */}
        <section className="flex flex-col">
          {/* convo header */}
          <div className="h-16 border-b px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-neutral-200" />
              <div>
                <div className="font-semibold">{activeChat.name}</div>
                <div className="text-xs text-green-600">Online</div>
              </div>
            </div>
            <button className="p-2 rounded-md hover:bg-neutral-100">
              <MoreHorizontal className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          {/* bubbles */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50">
            {thread.length === 0 ? (
              <p className="text-center text-neutral-400 italic">No messages yet. Start the conversation!</p>
            ) : (
              thread.map((b) => (
                <div key={b.id} className={cn("flex", b.fromMe ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2 text-[15px] leading-snug",
                      b.fromMe
                        ? "bg-[#ff7a45] text-white rounded-br-sm"
                        : "bg-white text-neutral-800 rounded-bl-sm"
                    )}
                  >
                    <div>{b.text}</div>
                    <div className={cn("mt-1 text-[11px]", b.fromMe ? "text-white/80" : "text-neutral-500")}>
                      {b.time}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* composer */}
          <div className="border-t p-3 bg-white">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-md hover:bg-neutral-100">
                <Camera className="w-5 h-5 text-neutral-600" />
              </button>
              <button className="p-2 rounded-md hover:bg-neutral-100">
                <Image className="w-5 h-5 text-neutral-600" />
              </button>
              <div className="flex-1 h-11 px-4 rounded-full bg-neutral-100 flex items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="bg-transparent outline-none text-[15px] flex-1"
                />
              </div>
              <button
                onClick={send}
                className="h-11 px-4 rounded-full bg-[#ff5a3a] text-white flex items-center gap-2 hover:brightness-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT: Profile panel */}
        <aside className="border-l bg-white">
          <div className="h-28 bg-gradient-to-r from-[#ff6a3d] to-[#ff5fa8] relative flex items-end justify-center">
            <div className="absolute -bottom-8 size-20 rounded-full ring-4 ring-white bg-neutral-200" />
          </div>
          <div className="pt-12 px-5">
            <div className="text-xl font-semibold">{activeChat.name}</div>
            <div className="mt-1 text-sm text-neutral-500 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> San Francisco, CA
            </div>

            <div className="mt-6 border rounded-xl p-4">
              <div className="font-semibold mb-1">Bio</div>
              <p className="text-sm text-neutral-500 italic">No bio yet.</p>
              <div className="mt-3 text-xs text-neutral-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Joined March 2023
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Photo Gallery</div>
                <div className="text-xs text-neutral-500">0/12 photos</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square rounded-lg bg-neutral-200" />
                <div className="aspect-square rounded-lg bg-neutral-200" />
                <div className="aspect-square rounded-lg bg-neutral-200" />
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
