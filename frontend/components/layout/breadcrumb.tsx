'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';

const labels: Record<string, string> = {
  dashboard: 'Dashboard',
  vault: 'Vault',
  documents: 'Documents',
  nominees: 'Nominees',
  'digital-will': 'Digital Will',
  notifications: 'Notifications',
  activity: 'Activity Logs',
  'emergency-contacts': 'Emergency Contacts',
  subscription: 'Subscription',
  settings: 'Settings',
  help: 'Help Center',
  profile: 'Profile',
  add: 'Add',
  edit: 'Edit',
  upload: 'Upload',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center text-sm text-muted-foreground">
      <Link href="/dashboard" className="hover:text-foreground">
        Home
      </Link>
      {segments.map((seg, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/');
        const isLast = i === segments.length - 1;
        const label = labels[seg] ?? seg;
        return (
          <Fragment key={href}>
            <ChevronRight className="mx-1 h-4 w-4" />
            {isLast ? (
              <span className="text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground">
                {label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
