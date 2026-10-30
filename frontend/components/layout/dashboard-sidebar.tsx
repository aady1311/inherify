'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderLock, FileText, Users, ScrollText, Bell,
  Activity, PhoneCall, CreditCard, LifeBuoy, Settings, LogOut,
  Menu, X, Shield, ChevronLeft,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { initials } from '@/utils/format';
import { authService } from '@/services/auth.service';

const nav = [
  { section: 'Overview', items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }] },
  {
    section: 'Vault',
    items: [
      { label: 'Vault', href: '/vault', icon: FolderLock },
      { label: 'Documents', href: '/documents', icon: FileText },
    ],
  },
  {
    section: 'Estate',
    items: [
      { label: 'Nominees', href: '/nominees', icon: Users },
      { label: 'Digital Will', href: '/digital-will', icon: ScrollText },
      { label: 'Emergency Contacts', href: '/emergency-contacts', icon: PhoneCall },
    ],
  },
  {
    section: 'Account',
    items: [
      { label: 'Notifications', href: '/notifications', icon: Bell },
      { label: 'Activity Logs', href: '/activity', icon: Activity },
      { label: 'Subscription', href: '/subscription', icon: CreditCard },
      { label: 'Help Center', href: '/help', icon: LifeBuoy },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: authService.me,
    staleTime: 5 * 60 * 1000,
  });

  function handleLogout() {
    authService.logout();
    router.push('/login');
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-white">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-semibold">InHerify</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card/40 backdrop-blur-xl md:flex">
        <SidebarContent pathname={pathname} user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card md:hidden"
            >
              <div className="flex items-center justify-between p-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-white">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">InHerify</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} user={user} onLogout={handleLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
  user,
  onLogout,
}: {
  pathname: string;
  onNavigate?: () => void;
  user?: any;
  onLogout?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="hidden items-center gap-2 px-6 py-5 md:flex">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-white">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">InHerify</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 no-scrollbar">
        {nav.map((group) => (
          <div key={group.section} className="mb-4">
            <p className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {group.section}
            </p>
            <div className="mt-1 flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                      active
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 -z-10 rounded-xl gradient-primary opacity-15"
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to site
        </Link>
        <div className="mt-2 flex items-center gap-3 rounded-xl bg-muted/50 p-3">
          <div className="grid h-9 w-9 place-items-center rounded-full gradient-primary text-sm font-semibold text-white">
            {initials(user?.name ?? '?')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name ?? '…'}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email ?? ''}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
