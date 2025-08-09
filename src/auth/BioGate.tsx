import { doc, getDoc } from 'firebase/firestore';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase';

export default function BioGate({ children }: { children: JSX.Element }) {
  const [ok, setOk] = useState<boolean|null>(null);
  useEffect(() => {
    const u = auth.currentUser!;
    getDoc(doc(db,'profiles',u.uid)).then(s => setOk(!!s.exists() && !!s.data()?.bioComplete));
  }, []);
  if (ok === null) return null;
  return ok ? children : <Navigate to="/profile-setup" replace />;
}
