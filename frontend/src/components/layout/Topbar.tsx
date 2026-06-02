'use client';

import { usePathname } from 'next/navigation';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/accounts':  'Accounts',
  '/transfer':  'Transfer Funds',
};

export default function Topbar() {
  const pathname = usePathname();
  const title = Object.entries(titles).find(([k]) => pathname.startsWith(k))?.[1] ?? 'SecureBank';

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-8">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </header>
  );
}
