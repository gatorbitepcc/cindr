import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, limit, startAfter, orderBy, addDoc, where, serverTimestamp, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function FindMatches() {
  const [currentUser, setCurrentUser] = useState(null);
  const [lastUser, setLastUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  // Get a random user by fetching a random document
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
      
      // Get all users (simpler approach)
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
      console.error('Auth user:', user);
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
    if (!authUser || !currentUser) return;

    try {
      setIsConnecting(true);
      setConnectionStatus(null);

      // Check if connection already exists
      const connectionsRef = collection(db, 'connections');
      const existingQuery = query(
        connectionsRef,
        where('fromUserId', '==', authUser.uid),
        where('toUserId', '==', currentUser.uid)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        setConnectionStatus('already_sent');
        return;
      }

      // Check if they already sent you a request (potential match)
      const reverseQuery = query(
        connectionsRef,
        where('fromUserId', '==', currentUser.uid),
        where('toUserId', '==', authUser.uid)
      );
      
      const reverseSnapshot = await getDocs(reverseQuery);
      
      if (!reverseSnapshot.empty) {
        // It's a match! Update the existing request to 'matched'
        const existingDoc = reverseSnapshot.docs[0];
        await updateDoc(doc(db, 'connections', existingDoc.id), {
          status: 'matched',
          matchedAt: serverTimestamp()
        });
        
        setConnectionStatus('matched');
        return;
      }

      // Create new connection request
      const connectionData = {
        fromUserId: authUser.uid,
        fromUserName: authUser.name || authUser.email,
        toUserId: currentUser.uid,
        toUserName: currentUser.name,
        status: 'pending',
        createdAt: serverTimestamp(),
        fromUserEmail: authUser.email,
        toUserEmail: currentUser.email
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
        // User is signed in, fetch a random user
        getRandomUser(user);
      } else {
        // User is signed out
        setCurrentUser(null);
        setError('Please sign in to view users');
      }
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="h-screen grid place-items-center">
        <div>Checking authentication...</div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="h-screen grid place-items-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Please sign in to view users</div>
          <p className="text-sm text-gray-600">You need to be authenticated to access user profiles</p>
        </div>
      </div>
    );
  }

  if (isLoading && !currentUser) {
    return (
      <div className="h-screen grid place-items-center">
        <div>Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen grid place-items-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button 
            onClick={() => {
              setError(null);
              getRandomUser();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="h-screen grid place-items-center">
        <div>No users found</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">User Profile</h1>
        
        <div className="space-y-4">
          <div>
            <label className="font-semibold">Name:</label>
            <p>{currentUser.name}</p>
          </div>
          
          <div>
            <label className="font-semibold">Email:</label>
            <p>{currentUser.email}</p>
          </div>
          
          <div>
            <label className="font-semibold">Bio:</label>
            <p>{currentUser.bio}</p>
          </div>
          
          <div>
            <label className="font-semibold">Role:</label>
            <p>{currentUser.role}</p>
          </div>
          
          <div>
            <label className="font-semibold">UID:</label>
            <p className="text-sm text-gray-600">{currentUser.uid}</p>
          </div>
          
          <div>
            <label className="font-semibold">Created At:</label>
            <p className="text-sm">{currentUser.createdAt}</p>
          </div>
          
          <div>
            <label className="font-semibold">Updated At:</label>
            <p className="text-sm">{currentUser.updatedAt}</p>
          </div>
        </div>
        
        <div className="flex gap-4 mt-8 justify-center">
          <button
            onClick={() => handleSwipe('left')}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            disabled={isLoading}
          >
            Pass
          </button>
          
          <button
            onClick={sendConnectionRequest}
            className={`px-6 py-2 text-white rounded-lg transition-colors ${
              isConnecting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : connectionStatus === 'sent' 
                ? 'bg-blue-500 hover:bg-blue-600'
                : connectionStatus === 'matched'
                ? 'bg-purple-500 hover:bg-purple-600'
                : connectionStatus === 'already_sent'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
            disabled={isConnecting || isLoading}
          >
            {isConnecting 
              ? 'Connecting...' 
              : connectionStatus === 'sent' 
              ? 'Request Sent!' 
              : connectionStatus === 'matched'
              ? 'It\'s a Match! 🎉'
              : connectionStatus === 'already_sent'
              ? 'Already Sent'
              : connectionStatus === 'error'
              ? 'Try Again'
              : 'Connect'
            }
          </button>
          
          <button
            onClick={() => handleSwipe('right')}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            disabled={isLoading}
          >
            Like
          </button>
        </div>

        {/* Connection Status Message */}
        {connectionStatus && (
          <div className={`text-center mt-4 p-3 rounded-lg ${
            connectionStatus === 'matched' 
              ? 'bg-purple-100 text-purple-800'
              : connectionStatus === 'sent'
              ? 'bg-blue-100 text-blue-800'
              : connectionStatus === 'already_sent'
              ? 'bg-yellow-100 text-yellow-800'
              : connectionStatus === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {connectionStatus === 'matched' && 
              `🎉 You and ${currentUser.name} are now connected! You can now message each other.`
            }
            {connectionStatus === 'sent' && 
              `Connection request sent to ${currentUser.name}. They'll be notified!`
            }
            {connectionStatus === 'already_sent' && 
              `You've already sent a connection request to ${currentUser.name}.`
            }
            {connectionStatus === 'error' && 
              'Failed to send connection request. Please try again.'
            }
          </div>
        )}
        
        <div className="text-center mt-4">
          <button
            onClick={() => getRandomUser()}
            className="text-blue-500 hover:text-blue-700 underline"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Get Another Random User'}
          </button>
        </div>
      </div>
    </div>
  );
}