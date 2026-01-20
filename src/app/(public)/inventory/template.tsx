'use client';

import { useEffect } from 'react';

export default function InventoryTemplate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Manually force scroll to top on every navigation within the inventory
    window.scrollTo(0, 0);
  }, []);

  return <>{children}</>;
}