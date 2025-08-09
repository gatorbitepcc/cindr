import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthModal } from './AuthModal';
import cindrLogo from '@/assets/cindr-logo.png';
import { onAuthStateChanged, getAuth, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import ConnectionInbox from './ConnectionInbox';


export const Header = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [user, setUser] = useState<User | null>(null);

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const userChange = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      console.log(firebaseUser);
    });
    return () => userChange();
  }, []);
  
  
  return (
    <>
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src={cindrLogo} 
              alt="Cindr logo - burning hearts" 
              className="w-10 h-10"
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Cindr
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Swipe your way to support — connect with people who understand and discover local cancer support resources in one place.
              </p>
            </div>
          </Link>

          
          
          {!user ? (
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => openAuthModal('signin')}
                className="border-primary/20 hover:bg-primary/10 hover:text-foreground"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => openAuthModal('signup')}
                className="bg-primary hover:bg-primary/90"
              >
                Sign Up
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={logOut}
                  className="bg-primary hover:bg-primary/90"
                  >
                  Sign Out
                </Button>
              </div>
            </>
          )}
        </div>
      </header>

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />
    </>
  );
};