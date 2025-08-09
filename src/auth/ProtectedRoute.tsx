import { onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from '@/firebase';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);
  useEffect(() => onAuthStateChanged(auth, u => { setOk(!!u); setReady(true); }), []);
  if (!ready) return null;
  return ok ? children : <Navigate to="/auth" replace />;
}
