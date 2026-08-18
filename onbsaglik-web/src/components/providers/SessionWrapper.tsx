'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';

function CartSessionSync() {
  const { data: session } = useSession();
  const setUserEmail = useCartStore((s) => s.setUserEmail);

  useEffect(() => {
    if (session?.user?.email) {
      setUserEmail(session.user.email);
    } else {
      setUserEmail('guest');
    }
  }, [session, setUserEmail]);

  return null;
}

export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartSessionSync />
      {children}
    </SessionProvider>
  );
}
