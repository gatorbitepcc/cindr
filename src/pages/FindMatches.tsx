import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, limit, startAfter, orderBy, addDoc, where, serverTimestamp, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Heart, X, User, MapPin, Calendar, Briefcase, Mail } from 'lucide-react';

export default function FindMatches() {
  const [currentUser, setCurrentUser] = useState(null);
  const [lastUser, setLastUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      // Handle Firestore timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (err) {
      return 'Unknown';
    }
  };

  // Get current user's full profile
  const getCurrentUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setCurrentUserProfile(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching current user profile:', error);
    }
  };

  // Get a random user by fetching a random document with full profile data
  const getRandomUser = async (user = authUser) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if user is authenticated
      if (!user) {
        setError('Please sign in to view users');
        return;
      }
      
      console.log('Fetching users for authenticated user:', user.uid);
      
      // Get all users
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      if (snapshot.empty) {
        setError('No users found in database');
        return;
      }

      const users = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          ...userData
        });
      });

      console.log('Found', users.length, 'users');

      // Filter out current authenticated user and last shown user
      const filteredUsers = users.filter(u => {
        // Don't show yourself
        if (u.uid === user.uid || u.id === user.uid) {
          return false;
        }
        // Don't show the last user shown
        if (lastUser && (u.uid === lastUser.uid || u.id === lastUser.id)) {
          return false;
        }
        return true;
      });

      console.log('Filtered users (excluding self and last):', filteredUsers.length);

      if (filteredUsers.length === 0) {
        setError('No more users available. Try again later!');
        return;
      }

      // Pick a random user from filtered list
      const randomIndex = Math.floor(Math.random() * filteredUsers.length);
      const randomUser = filteredUsers[randomIndex];
      
      // Store the last user before setting new current user
      setLastUser(currentUser);
      setCurrentUser(randomUser);
      
    } catch (err) {
      setError('Failed to fetch user: ' + err.message);
      console.error('Error fetching user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle swipe - get new random user
  const handleSwipe = (direction) => {
    console.log(`Swiped ${direction} on user:`, currentUser?.name);
    setConnectionStatus(null); // Reset connection status
    getRandomUser();
  };

  // Send connection request
  const sendConnectionRequest = async () => {
    if (!authUser || !currentUser || !currentUserProfile) return;

    try {
      setIsConnecting(true);
      setConnectionStatus(null);

      // Check if connection already exists
      const connectionsRef = collection(db, 'connections');
      const existingQuery = query(
        connectionsRef,
        where('fromUserId', '==', authUser.uid),
        where('toUserId', '==', (currentUser.uid || currentUser.id))
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        setConnectionStatus('already_sent');
        return;
      }

      // Check if they already sent you a request (potential match)
      const reverseQuery = query(
        connectionsRef,
        where('fromUserId', '==', (currentUser.uid || currentUser.id)),
        where('toUserId', '==', authUser.uid)
      );
      
      const reverseSnapshot = await getDocs(reverseQuery);
      
      if (!reverseSnapshot.empty) {
        // It's a match! Update the existing request to 'accepted'
        const existingDoc = reverseSnapshot.docs[0];
        await updateDoc(doc(db, 'connections', existingDoc.id), {
          status: 'accepted',
          acceptedAt: serverTimestamp(),
          acceptedBy: authUser.uid
        });
        
        setConnectionStatus('matched');
        return;
      }

      // Create new connection request
      const connectionData = {
        fromUserId: authUser.uid,
        fromUserName: currentUserProfile.name || authUser.displayName || authUser.email,
        fromUserEmail: authUser.email,
        toUserId: currentUser.uid || currentUser.id,
        toUserName: currentUser.name || 'Unknown User',
        toUserEmail: currentUser.email || '',
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await addDoc(connectionsRef, connectionData);
      setConnectionStatus('sent');
      
      console.log('Connection request sent successfully');
      
    } catch (err) {
      console.error('Error sending connection request:', err);
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  // Initialize on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? user.uid : 'No user');
      setAuthUser(user);
      setAuthLoading(false);
      
      if (user) {
        // Get current user's profile data
        getCurrentUserProfile(user.uid);
        // User is signed in, fetch a random user
        getRandomUser(user);
      } else {
        // User is signed out
        setCurrentUser(null);
        setCurrentUserProfile(null);
        setError('Please sign in to view users');
      }
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff5a3a] mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Checking authentication...</div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md mx-4">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to discover and connect with amazing people</p>
          <button className="px-6 py-3 bg-[#ff5a3a] text-white rounded-xl font-medium hover:bg-[#ff4a2a] transition-colors">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-96 h-80 bg-white rounded-2xl shadow-xl mx-auto mb-4"></div>
          </div>
          <div className="text-lg font-medium text-gray-700">Finding amazing people for you...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md mx-4">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              getRandomUser();
            }}
            className="px-6 py-3 bg-[#ff5a3a] text-white rounded-xl font-medium hover:bg-[#ff4a2a] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md mx-4">
          <div className="text-6xl mb-4">🎭</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No More Users</h2>
          <p className="text-gray-600">Come back later to discover more people!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 p-4 flex items-center justify-center">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff5a3a] to-[#ff8a65]">
            Discover
          </h1>
          <p className="text-gray-600 mt-1">Find your perfect match</p>
        </div>

        {/* Main Profile Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex">
            {/* Left Side - Profile Image and Gallery */}
            <div className="w-1/2 relative">
              <div className="h-[400px] bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center">
                {currentUser.avatarUrl ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.name}
                    className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-white"
                  />
                ) : (
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl">
                    <span className="text-4xl font-bold text-gray-400">
                      {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Photo Gallery Preview */}
              {currentUser.photos && currentUser.photos.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2 justify-center">
                    {currentUser.photos.slice(0, 3).map((photo, index) => (
                      <div key={index} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                        <img src={photo} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {currentUser.photos.length > 3 && (
                      <div className="w-12 h-12 rounded-lg bg-black/50 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                        +{currentUser.photos.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Profile Info */}
            <div className="w-1/2 p-6 flex flex-col justify-between">
              {/* Profile Header */}
              <div>
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    {currentUser.name || 'Anonymous User'}
                  </h2>
                  <div className="flex items-center justify-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>San Francisco, CA</span>
                  </div>
                </div>

                {/* Bio */}
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-[#ff5a3a] rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">About</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {currentUser.bio || "No bio available yet. This person prefers to keep some mystery! 🌟"}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Briefcase className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">Role</span>
                    </div>
                    <p className="text-blue-700 capitalize text-xs">{currentUser.role || 'Not specified'}</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-medium text-green-800">Joined</span>
                    </div>
                    <p className="text-green-700 text-xs">{formatDate(currentUser.createdAt)}</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Mail className="w-3 h-3 text-purple-600" />
                      <span className="text-xs font-medium text-purple-800">Photos</span>
                    </div>
                    <p className="text-purple-700 text-xs">
                      {currentUser.photos ? `${currentUser.photos.length}/12` : '0/12'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                <div className="flex gap-4 justify-center mb-3">
                  <button
                    onClick={() => handleSwipe('left')}
                    className="w-12 h-12 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg"
                    disabled={isLoading}
                  >
                    <X className="w-6 h-6 text-red-500" />
                  </button>
                  
                  <button
                    onClick={sendConnectionRequest}
                    className={`w-14 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg text-white font-medium ${
                      isConnecting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : connectionStatus === 'sent' 
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : connectionStatus === 'matched'
                        ? 'bg-purple-500 hover:bg-purple-600 animate-pulse'
                        : connectionStatus === 'already_sent'
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
                    }`}
                    disabled={isConnecting || isLoading}
                  >
                    {isConnecting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : connectionStatus === 'matched' ? (
                      <div className="text-center">
                        <Heart className="w-5 h-5 mx-auto" />
                        <span className="text-xs leading-none">Match!</span>
                      </div>
                    ) : (
                      <Heart className="w-6 h-6" />
                    )}
                  </button>
                </div>

                {/* Connection Status Message */}
                {connectionStatus && (
                  <div className={`text-center p-3 rounded-xl mb-3 transition-all duration-300 ${
                    connectionStatus === 'matched' 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200'
                      : connectionStatus === 'sent'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : connectionStatus === 'already_sent'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : connectionStatus === 'error'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {connectionStatus === 'matched' && (
                      <div>
                        <div className="text-lg mb-1">🎉</div>
                        <div className="font-bold text-sm">It's a Match!</div>
                        <div className="text-xs">You and {currentUser.name} are now connected!</div>
                      </div>
                    )}
                    {connectionStatus === 'sent' && (
                      <div>
                        <div className="text-sm mb-1">✈️</div>
                        <div className="font-medium text-sm">Request Sent!</div>
                        <div className="text-xs">Waiting for {currentUser.name} to respond</div>
                      </div>
                    )}
                    {connectionStatus === 'already_sent' && (
                      <div>
                        <div className="text-sm mb-1">⏳</div>
                        <div className="font-medium text-sm">Already Sent</div>
                        <div className="text-xs">You've already reached out to {currentUser.name}</div>
                      </div>
                    )}
                    {connectionStatus === 'error' && (
                      <div>
                        <div className="text-sm mb-1">❌</div>
                        <div className="font-medium text-sm">Something went wrong</div>
                        <div className="text-xs">Please try again</div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-center">
                  <button
                    onClick={() => getRandomUser()}
                    className="text-[#ff5a3a] hover:text-[#ff4a2a] font-medium underline transition-colors text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Show me someone new ✨'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}