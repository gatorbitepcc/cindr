import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Inbox, Check, X, User, Clock, Heart } from 'lucide-react';

export default function ConnectionInbox() {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingRequests, setProcessingRequests] = useState(new Set());

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for connection requests
  useEffect(() => {
    if (!authUser) {
      setConnectionRequests([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Query for pending connection requests where current user is the recipient
    const connectionsRef = collection(db, 'connections');
    const q = query(
      connectionsRef,
      where('toUserId', '==', authUser.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const requests = [];
        snapshot.forEach((doc) => {
          requests.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Sort by creation date (newest first)
        requests.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.seconds - a.createdAt.seconds;
        });
        
        setConnectionRequests(requests);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error listening to connection requests:', err);
        setError('Failed to load connection requests');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authUser]);

  // Accept connection request
  const acceptConnection = async (requestId, fromUserId, fromUserName) => {
    if (!authUser) return;

    try {
      setProcessingRequests(prev => new Set(prev).add(requestId));

      const requestRef = doc(db, 'connections', requestId);
      await updateDoc(requestRef, {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
        acceptedBy: authUser.uid
      });

      console.log(`Accepted connection from ${fromUserName}`);
      
    } catch (err) {
      console.error('Error accepting connection:', err);
      setError('Failed to accept connection request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Decline connection request
  const declineConnection = async (requestId, fromUserName) => {
    if (!authUser) return;

    try {
      setProcessingRequests(prev => new Set(prev).add(requestId));

      // Option 1: Delete the request
      const requestRef = doc(db, 'connections', requestId);
      await deleteDoc(requestRef);

      // Option 2: Update status to 'declined' (if you want to keep history)
      // await updateDoc(requestRef, {
      //   status: 'declined',
      //   declinedAt: serverTimestamp(),
      //   declinedBy: authUser.uid
      // });

      console.log(`Declined connection from ${fromUserName}`);
      
    } catch (err) {
      console.error('Error declining connection:', err);
      setError('Failed to decline connection request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const requestTime = timestamp.toDate();
    const diffInMinutes = Math.floor((now - requestTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (authLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg text-center">
        <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Please sign in to view your inbox</p>
      </div>
    );
  }
  

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Inbox className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Connection Requests</h2>
          {connectionRequests.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {connectionRequests.length}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading requests...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : connectionRequests.length === 0 ? (
          <div className="p-8 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No new requests</h3>
            <p className="text-gray-500">Connection requests will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {connectionRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Request Info */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {request.fromUserName}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        {request.fromUserEmail}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(request.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => declineConnection(request.id, request.fromUserName)}
                      disabled={processingRequests.has(request.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Decline"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => acceptConnection(request.id, request.fromUserId, request.fromUserName)}
                      disabled={processingRequests.has(request.id)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Accept"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Processing indicator */}
                {processingRequests.has(request.id) && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Processing...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {connectionRequests.length > 0 && (
        <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
          {connectionRequests.length} pending request{connectionRequests.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}