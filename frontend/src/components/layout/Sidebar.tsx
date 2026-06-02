'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, ArrowLeftRight, LogOut } from 'lucide-react';
import { useUserContext } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/accounts', label: 'Accounts',  icon: CreditCard },
  { href: '/transfer', label: 'Transfer',  icon: ArrowLeftRight },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const { user, logout } = useUserContext();
  const router    = useRouter();

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <aside className="w-64 min-h-screen bg-brand-900 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-8">
        <h1 className="text-white text-xl font-bold tracking-tight">SecureBank</h1>
        <p className="text-brand-100 text-xs mt-0.5">Banking Platform</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-white/10 text-white'
                : 'text-brand-100 hover:bg-white/5 hover:text-white'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.fullName?.[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-brand-100 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-brand-100 hover:text-white text-sm px-2 py-1.5 rounded-lg hover:bg-white/5 w-full transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
