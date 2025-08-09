import { useMemo, useState, useEffect } from "react";
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
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  orderBy,
  serverTimestamp,
  or,
  updateDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const cn = (...xs: (string | false | null | undefined)[]) =>
  xs.filter(Boolean).join(" ");

// Types
interface Connection {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserEmail: string;
  toUserEmail: string;
  fromUserName: string;
  toUserName: string;
  createdAt: any;
  lastMessageAt?: any;
  lastMessage?: string;
  lastMessageSenderId?: string;
}

interface ChatInstance {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  otherUserId: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
  createdAt: any;
}

interface Bubble {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
}

// Function to get user profile data
const getUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Helper function to format timestamp
const formatMessageTime = (timestamp: any) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than 24 hours - show time
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Less than 7 days - show day
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  // Older - show date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Custom hook to get user's connections as chat instances
const useUserChats = (currentUserId: string) => {
  const [chats, setChats] = useState<ChatInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    // We'll make two separate queries and combine the results
    const unsubscribes: (() => void)[] = [];
    const connectionsMap = new Map<string, Connection>();

    const updateChats = () => {
      const connections = Array.from(connectionsMap.values());
      
      // Sort by lastMessageAt desc, then createdAt desc
      connections.sort((a, b) => {
        const aTime = a.lastMessageAt || a.createdAt;
        const bTime = b.lastMessageAt || b.createdAt;
        
        if (!aTime && !bTime) return 0;
        if (!aTime) return 1;
        if (!bTime) return -1;
        
        return bTime.toMillis() - aTime.toMillis();
      });

      const chatInstances: ChatInstance[] = connections.map((data) => {
        const isFromUser = data.fromUserId === currentUserId;
        const otherUserName = isFromUser ? data.toUserName : data.fromUserName;
        const otherUserId = isFromUser ? data.toUserId : data.fromUserId;

        return {
          id: data.id,
          name: otherUserName,
          lastMessage: data.lastMessage || '',
          time: formatMessageTime(data.lastMessageAt || data.createdAt),
          otherUserId,
          unread: 0 // You can implement unread count logic here
        };
      });

      setChats(chatInstances);
      setLoading(false);
      setError(null);
    };

    // Query for connections where current user is the 'from' user
    const fromQuery = query(
      collection(db, 'connections'),
      where('fromUserId', '==', currentUserId)
    );

    const unsubscribe1 = onSnapshot(
      fromQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = { id: change.doc.id, ...change.doc.data() } as Connection;
          
          if (change.type === 'added' || change.type === 'modified') {
            connectionsMap.set(change.doc.id, data);
          } else if (change.type === 'removed') {
            connectionsMap.delete(change.doc.id);
          }
        });
        updateChats();
      },
      (err) => {
        console.error('Error fetching from connections:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Query for connections where current user is the 'to' user
    const toQuery = query(
      collection(db, 'connections'),
      where('toUserId', '==', currentUserId)
    );

    const unsubscribe2 = onSnapshot(
      toQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = { id: change.doc.id, ...change.doc.data() } as Connection;
          
          if (change.type === 'added' || change.type === 'modified') {
            connectionsMap.set(change.doc.id, data);
          } else if (change.type === 'removed') {
            connectionsMap.delete(change.doc.id);
          }
        });
        updateChats();
      },
      (err) => {
        console.error('Error fetching to connections:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    unsubscribes.push(unsubscribe1, unsubscribe2);

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [currentUserId]);

  return { chats, loading, error };
};

// Custom hook to get messages for a specific chat
const useChatMessages = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    // Option 1: Simple query without orderBy (will sort client-side)
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId)
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messagesList: Message[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data()
          } as Message))
          .sort((a, b) => {
            // Sort by timestamp client-side
            const aTime = a.timestamp?.toMillis() || 0;
            const bTime = b.timestamp?.toMillis() || 0;
            return aTime - bTime;
          });

        setMessages(messagesList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching messages:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  return { messages, loading, error };
};

// Function to send a message
const sendMessage = async (
  chatId: string, 
  senderId: string, 
  senderName: string,
  text: string
) => {
  if (!text.trim()) return;

  try {
    // Add message to messages collection
    await addDoc(collection(db, 'messages'), {
      chatId,
      senderId,
      senderName,
      text: text.trim(),
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    });

    // Update the connection with last message info
    const connectionRef = doc(db, 'connections', chatId);
    await updateDoc(connectionRef, {
      lastMessage: text.trim(),
      lastMessageAt: serverTimestamp(),
      lastMessageSenderId: senderId
    });

  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Function to get user bio
const getUserBio = async (userId: string): Promise<string> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().bio || "No bio available";
    }
    return "No bio available";
  } catch (error) {
    console.error('Error fetching user bio:', error);
    return "Bio unavailable";
  }
};

export default function Messages() {
  const [user, authLoading] = useAuthState(auth);
  const [activeId, setActiveId] = useState<string>("");
  const [input, setInput] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeChatBio, setActiveChatBio] = useState<string>("");
  const [bioLoading, setBioLoading] = useState(false);

  const currentUserId = user?.uid;

  // Use custom hooks for real-time data
  const { chats, loading: chatsLoading, error: chatsError } = useUserChats(currentUserId || '');
  const { messages, loading: messagesLoading, error: messagesError } = useChatMessages(activeId);

  // Load current user profile
  useEffect(() => {
    if (currentUserId) {
      getUserProfile(currentUserId).then(setUserProfile);
    }
  }, [currentUserId]);

  // Set first chat as active when chats load
  useEffect(() => {
    if (chats.length > 0 && !activeId) {
      setActiveId(chats[0].id);
    }
  }, [chats, activeId]);

  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeId) ?? chats[0],
    [activeId, chats]
  );

  // Load active chat user bio
  useEffect(() => {
    const loadBio = async () => {
      if (!activeChat?.otherUserId) {
        setActiveChatBio("");
        return;
      }

      setBioLoading(true);
      try {
        const bio = await getUserBio(activeChat.otherUserId);
        setActiveChatBio(bio);
      } catch (error) {
        console.error('Error loading bio:', error);
        setActiveChatBio("Bio unavailable");
      } finally {
        setBioLoading(false);
      }
    };

    loadBio();
  }, [activeChat?.otherUserId]);

  // Convert messages to bubble format
  const bubbles: Bubble[] = useMemo(() => {
    return messages.map(msg => ({
      id: msg.id,
      fromMe: msg.senderId === currentUserId,
      text: msg.text,
      time: formatMessageTime(msg.timestamp)
    }));
  }, [messages, currentUserId]);

  const handleSend = async () => {
    if (!input.trim() || !activeId || !currentUserId) return;
    
    const messageText = input.trim();
    setInput(""); // Clear input immediately for better UX
    
    try {
      await sendMessage(
        activeId, 
        currentUserId, 
        userProfile?.displayName || user?.displayName || 'Anonymous',
        messageText
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optionally show error to user
      setInput(messageText); // Restore input on error
    }
  };

  // Handle authentication loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold text-[#ff5a3a] mb-2">Cindr</div>
          <div className="text-neutral-500">Loading...</div>
        </div>
      </div>
    );
  }

  // Handle no authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold text-[#ff5a3a] mb-2">Cindr</div>
          <div className="text-neutral-500 mb-4">Please sign in to continue</div>
          <button 
            onClick={() => {/* Implement your sign-in logic */}}
            className="px-4 py-2 bg-[#ff5a3a] text-white rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Handle chats loading
  if (chatsLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold text-[#ff5a3a] mb-2">Cindr</div>
          <div className="text-neutral-500">Loading your matches...</div>
        </div>
      </div>
    );
  }

  // Handle errors
  if (chatsError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold text-[#ff5a3a] mb-2">Cindr</div>
          <div className="text-red-500 mb-4">Error loading chats: {chatsError}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#ff5a3a] text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="h-14 border-b bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-[#ff5a3a]">Cindr</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-neutral-500">
            {userProfile?.displayName || user?.displayName || 'User'}
          </div>
          <div className="size-8 rounded-full bg-neutral-200 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-sm font-medium">
                {(userProfile?.displayName || user?.displayName || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
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
              <input placeholder="Search matches" className="outline-none text-sm flex-1" />
            </div>
          </div>

          {/* chat list */}
          <div className="overflow-y-auto">
            <div className="px-3 py-2 text-xs font-semibold text-neutral-500">
              Matches ({chats.length})
            </div>
            {chats.length === 0 ? (
              <div className="px-3 py-8 text-center text-neutral-400 text-sm">
                <div className="mb-2">💔</div>
                <div>No matches yet</div>
                <div className="text-xs mt-1">Keep swiping!</div>
              </div>
            ) : (
              chats.map((chat) => {
                const active = chat.id === activeId;
                return (
                  <button
                    key={chat.id}
                    onClick={() => setActiveId(chat.id)}
                    className={cn(
                      "w-full px-3 py-3 flex items-center gap-3 border-b transition-colors",
                      active ? "bg-orange-50" : "hover:bg-neutral-50"
                    )}
                  >
                    <div className="relative">
                      <div className="size-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm">
                        {chat.name.charAt(0)}
                      </div>
                      {chat.unread ? (
                        <span className="absolute -right-1 -top-1 text-[10px] font-semibold bg-[#ff5a3a] text-white rounded-full px-1.5 py-0.5">
                          {chat.unread}
                        </span>
                      ) : null}
                    </div>

                    <div className="text-left min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium text-sm truncate">{chat.name}</div>
                        <div className="text-[11px] text-neutral-500">{chat.time}</div>
                      </div>
                      <div className="text-sm text-neutral-500 truncate">
                        {chat.lastMessage || "Start your conversation! 💬"}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* CENTER: Conversation */}
        <section className="flex flex-col">
          {/* convo header */}
          <div className="h-16 border-b px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                {activeChat?.name?.charAt(0) || "?"}
              </div>
              <div>
                <div className="font-semibold">{activeChat?.name || "Select a chat"}</div>
                <div className="text-xs text-green-600">Online</div>
              </div>
            </div>
            <button className="p-2 rounded-md hover:bg-neutral-100">
              <MoreHorizontal className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          {/* bubbles */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50">
            {!activeChat ? (
              <div className="h-full flex items-center justify-center text-neutral-400">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <div>Select a match to start chatting</div>
                </div>
              </div>
            ) : messagesLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-neutral-400">Loading messages...</div>
              </div>
            ) : messagesError ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-red-500">
                  <div>Error loading messages</div>
                  <div className="text-sm mt-1">{messagesError}</div>
                </div>
              </div>
            ) : bubbles.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-neutral-400">
                  <div className="text-4xl mb-4">🎉</div>
                  <div className="text-lg font-medium mb-2">You're connected!</div>
                  <div className="text-sm">Start the conversation and see where it goes...</div>
                </div>
              </div>
            ) : (
              bubbles.map((bubble) => (
                <div key={bubble.id} className={cn("flex", bubble.fromMe ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2 text-[15px] leading-snug shadow-sm",
                      bubble.fromMe
                        ? "bg-[#ff7a45] text-white rounded-br-sm"
                        : "bg-white text-neutral-800 rounded-bl-sm border"
                    )}
                  >
                    <div>{bubble.text}</div>
                    <div className={cn("mt-1 text-[11px]", bubble.fromMe ? "text-white/80" : "text-neutral-500")}>
                      {bubble.time}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* composer */}
          <div className="border-t p-3 bg-white">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-md hover:bg-neutral-100 transition-colors">
                <Camera className="w-5 h-5 text-neutral-600" />
              </button>
              <button className="p-2 rounded-md hover:bg-neutral-100 transition-colors">
                <Image className="w-5 h-5 text-neutral-600" />
              </button>
              <div className="flex-1 h-11 px-4 rounded-full bg-neutral-100 flex items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={activeChat ? `Message ${activeChat.name}...` : "Select a chat..."}
                  disabled={!activeChat}
                  className="bg-transparent outline-none text-[15px] flex-1 disabled:cursor-not-allowed"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || !activeChat}
                className="h-11 px-4 rounded-full bg-[#ff5a3a] text-white flex items-center gap-2 hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT: Profile panel */}
        <aside className="border-l bg-white">
          <div className="h-28 bg-gradient-to-r from-[#ff6a3d] to-[#ff5fa8] relative flex items-end justify-center">
            <div className="absolute -bottom-8 size-20 rounded-full ring-4 ring-white bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-bold text-2xl">
              {activeChat?.name?.charAt(0) || "?"}
            </div>
          </div>
          <div className="pt-12 px-5">
            <div className="text-xl font-semibold text-center">{activeChat?.name || "No chat selected"}</div>
            <div className="mt-1 text-sm text-neutral-500 flex items-center justify-center gap-1">
              <MapPin className="w-4 h-4" /> San Francisco, CA
            </div>

            <div className="mt-6 border rounded-xl p-4">
              <div className="font-semibold mb-1">Bio</div>
              {bioLoading ? (
                <div className="text-sm text-neutral-400 italic">Loading bio...</div>
              ) : (
                <p className="text-sm text-neutral-500 italic">
                  {activeChatBio || (activeChat ? "No bio available" : "Select a chat to view profile")}
                </p>
              )}
              <div className="mt-3 text-xs text-neutral-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Joined March 2023
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Photo Gallery</div>
                <div className="text-xs text-neutral-500">3/12 photos</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square rounded-lg bg-gradient-to-br from-blue-400 to-purple-500" />
                <div className="aspect-square rounded-lg bg-gradient-to-br from-green-400 to-blue-500" />
                <div className="aspect-square rounded-lg bg-gradient-to-br from-pink-400 to-red-500" />
              </div>
            </div>

            {activeChat && (
              <div className="mt-6 space-y-2">
                <button className="w-full py-2 px-4 rounded-lg border border-neutral-300 text-sm font-medium hover:bg-neutral-50 transition-colors">
                  View Full Profile
                </button>
                <button className="w-full py-2 px-4 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors">
                  Report User
                </button>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}