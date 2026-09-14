'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';

import { useFavoritesStore } from '@/stores/favoritesStore';

function StoreSessionSync() {
  const { data: session } = useSession();
  const setCartEmail = useCartStore((s) => s.setUserEmail);
  const setFavEmail = useFavoritesStore((s) => s.setUserEmail);
  const syncFavs = useFavoritesStore((s) => s.syncWithServer);

  useEffect(() => {
    if (session?.user?.email) {
      setCartEmail(session.user.email);
      setFavEmail(session.user.email);
      // Backend'den de verileri çek
      syncFavs();
    } else {
      setCartEmail('guest');
      setFavEmail('guest');
    }
  }, [session, setCartEmail, setFavEmail, syncFavs]);

  return null;
}

export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StoreSessionSync />
      {children}
    </SessionProvider>
  );
}
