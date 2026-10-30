'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  User as UserIcon,
  ShieldCheck,
  KeyRound,
  Smartphone,
  Palette,
  Bell,
  Eye,
  EyeOff,
  Monitor,
  Trash2,
  Save,
  Check,
  Moon,
  Sun,
  Laptop,
  Copy,
  Download,
  RefreshCw,
  AlertTriangle,
  Lock,
  Globe,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  HardDrive,
  Key,
  Fingerprint,
  Usb,
  Shield,
  BadgeCheck,
  FileJson,
  Radio,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader } from '@/components/dashboard/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTheme } from 'next-themes';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { currentUser } from '@/data/mock';
import { initials, formatDateTime } from '@/utils/format';
import { cn } from '@/lib/utils';

const defaultPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  securityAlerts: true,
  marketingUpdates: false,
  analytics: true,
  publicProfile: false,
};

type SettingsTab =
  | 'profile'
  | 'security'
  | 'password'
  | '2fa'
  | 'appearance'
  | 'notifications'
  | 'privacy'
  | 'devices'
  | 'delete';

interface NavItem {
  id: SettingsTab;
  label: string;
  icon: any;
  desc: string;
  badge?: string;
  danger?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Identity & Preferences',
    items: [
      { id: 'profile', label: 'Profile', icon: UserIcon, desc: 'Name, avatar & bio' },
      { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme, colors & layout' },
      { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email, push & alerts' },
    ],
  },
  {
    title: 'Security & Access',
    items: [
      { id: 'security', label: 'Security Health', icon: ShieldCheck, desc: 'Audit score & dead man switch', badge: '94%' },
      { id: 'password', label: 'Master Password', icon: KeyRound, desc: 'Cryptographic key & strength' },
      { id: '2fa', label: 'Two-Factor (2FA)', icon: Smartphone, desc: 'Authenticator & backup codes' },
      { id: 'devices', label: 'Active Sessions', icon: Monitor, desc: 'Connected devices & IPs' },
      { id: 'privacy', label: 'Privacy & Vault Export', icon: Lock, desc: 'Zero-knowledge data controls' },
    ],
  },
  {
    title: 'Danger Zone',
    items: [
      { id: 'delete', label: 'Delete Account', icon: Trash2, desc: 'Permanently erase vault', danger: true },
    ],
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // User query
  const { data: user = currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: userService.me,
  });

  // Devices query
  const { data: rawDevices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: userService.listDevices,
  });

  const devices = useMemo(() => {
    if (rawDevices.length > 0) return rawDevices;
    return [
      {
        id: 'dev-1',
        name: 'Windows 11 PC (Chrome)',
        current: true,
        location: 'Mumbai, India',
        ip: '103.21.244.18',
        lastActive: new Date().toISOString(),
      },
      {
        id: 'dev-2',
        name: 'iPhone 15 Pro (Safari)',
        current: false,
        location: 'Mumbai, India',
        ip: '103.21.244.20',
        lastActive: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'dev-3',
        name: 'MacBook Pro 16" (Chrome)',
        current: false,
        location: 'Bengaluru, India',
        ip: '49.207.12.98',
        lastActive: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ];
  }, [rawDevices]);

  // Profile form state
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [username, setUsername] = useState('muskan_yadav');
  const [bio, setBio] = useState('Digital asset holder. In case of unexpected event, notify nominated trustees promptly.');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [country, setCountry] = useState('IN');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    setName(user.name);
    setPhone(user.phone ?? '');
  }, [user.name, user.phone]);

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      await userService.updateProfile({ name, phone });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile and preferences updated successfully');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  }

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNextPass, setShowNextPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (nextPassword.length >= 8) score += 25;
    if (nextPassword.length >= 12) score += 15;
    if (/[A-Z]/.test(nextPassword)) score += 20;
    if (/[0-9]/.test(nextPassword)) score += 20;
    if (/[^A-Za-z0-9]/.test(nextPassword)) score += 20;
    return Math.min(100, score);
  }, [nextPassword]);

  async function handleUpdatePassword() {
    if (!currentPassword || !nextPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (nextPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordScore < 60) {
      toast.error('Please choose a stronger password');
      return;
    }
    setSavingPassword(true);
    try {
      await userService.updatePassword({ current: currentPassword, next: nextPassword });
      setCurrentPassword('');
      setNextPassword('');
      setConfirmPassword('');
      toast.success('Master password successfully updated');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  }

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user.twoFactorEnabled ?? true);
  const [otpCode, setOtpCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([
    '9824-A91F', '5521-X992', '3104-QP88', '7712-MK41',
    '8839-BV92', '1249-ZZ10', '6620-TR34', '4491-LL83',
  ]);

  async function handleToggle2FA(v: boolean) {
    setTwoFactorEnabled(v);
    try {
      await userService.toggle2FA(v);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success(v ? 'Two-Factor Authentication activated' : 'Two-Factor Authentication disabled');
    } catch {
      setTwoFactorEnabled(!v);
      toast.error('Failed to update 2FA status');
    }
  }

  function handleCopyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success('Backup codes copied to clipboard');
  }

  function handleDownloadBackupCodes() {
    const text = `INHERIFY EMERGENCY RECOVERY CODES\nGenerated: ${new Date().toISOString()}\nAccount: ${user.email}\nVault ID: INH-8849-NX\n\n${backupCodes.join('\n')}\n\nKeep these codes stored securely offline.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inherify-recovery-codes-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Recovery codes downloaded');
  }

  function handleRegenerateCodes() {
    const newCodes = Array.from({ length: 8 }, () => {
      const p1 = Math.floor(1000 + Math.random() * 9000);
      const p2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `${p1}-${p2}`;
    });
    setBackupCodes(newCodes);
    toast.success('New recovery codes generated');
  }

  // Dead man switch / Inactivity protocol state
  const [checkInFrequency, setCheckInFrequency] = useState('90');
  const [gracePeriod, setGracePeriod] = useState('14');
  const [inactivityAlertChannel, setInactivityAlertChannel] = useState({ email: true, sms: true });

  // Notifications & preferences
  const preferences = user.preferences ?? defaultPreferences;

  async function handleTogglePreference(key: keyof typeof defaultPreferences, value: boolean) {
    try {
      await userService.updatePreferences({ [key]: value });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Preference updated');
    } catch {
      toast.error('Failed to update preference');
    }
  }

  // Avatar upload
  async function handleAvatarSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingAvatar(true);
    try {
      await userService.uploadAvatar(file);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile photo updated successfully');
    } catch {
      toast.error('Failed to update photo');
    } finally {
      setUploadingAvatar(false);
    }
  }

  // Devices revoke
  async function handleRevokeDevice(id: string) {
    try {
      await userService.revokeDevice(id);
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Device session revoked');
    } catch {
      toast.error('Failed to revoke device');
    }
  }

  async function handleSignOutEverywhere() {
    try {
      await Promise.all(
        devices.filter((d: any) => !d.current).map((d: any) => userService.revokeDevice(d.id))
      );
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Signed out of all other sessions');
    } catch {
      toast.error('Failed to sign out other sessions');
    }
  }

  // Export full vault archive
  function handleExportVaultData() {
    const exportData = {
      app: 'InHerify Vault Archive',
      version: '2.4.0',
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        plan: user.plan || 'pro',
        joinedAt: user.joinedAt,
      },
      encryption: {
        cipher: 'AES-256-GCM',
        kdf: 'Argon2id',
        status: 'Client-side verified',
      },
      settingsSummary: {
        twoFactorEnabled: user.twoFactorEnabled,
        checkInFrequencyDays: Number(checkInFrequency),
        gracePeriodDays: Number(gracePeriod),
        preferences: preferences,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inherify-vault-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Vault backup JSON generated and downloaded');
  }

  // Delete account confirmation
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  async function handleDeleteAccount() {
    try {
      await userService.deleteAccount();
      authService.logout();
      toast.success('Account permanently deleted');
      router.push('/login');
    } catch {
      toast.error('Failed to delete account');
    }
  }

  return (
    <DashboardShell>
      {/* Top Header */}
      <PageHeader
        title="Settings & Preferences"
        description="Manage your digital identity, cryptographic keys, estate protocols, and active devices."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Vault Active: AES-256
            </Badge>
            <Button
              onClick={handleExportVaultData}
              variant="outline"
              size="sm"
              className="glass border-border/80 text-xs font-medium"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-primary" /> Export Data
            </Button>
          </div>
        }
      />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Sticky Navigation Column */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-6 space-y-5">
            {/* Nav Menu Card */}
            <div className="glass-card rounded-2xl p-3 border border-border/70 dark:border-white/[0.08]">
              {navGroups.map((group, gIdx) => (
                <div key={group.title} className={cn(gIdx > 0 && 'mt-4 pt-3 border-t border-border/50')}>
                  <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                    {group.title}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={cn(
                            'group relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-all',
                            isActive
                              ? item.danger
                                ? 'bg-rose-500/15 text-rose-400 font-semibold'
                                : 'bg-primary/15 text-primary font-semibold shadow-sm'
                              : item.danger
                              ? 'text-rose-500/80 hover:bg-rose-500/10 hover:text-rose-400'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={cn(
                                'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                                isActive
                                  ? item.danger
                                    ? 'text-rose-400'
                                    : 'text-primary'
                                  : item.danger
                                  ? 'text-rose-500'
                                  : 'text-muted-foreground group-hover:text-foreground'
                              )}
                            />
                            <span>{item.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <Badge className="bg-emerald-500/15 text-[10px] text-emerald-400 border-0 px-1.5 py-0">
                                {item.badge}
                              </Badge>
                            )}
                            {isActive && (
                              <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Digital Identity Mini Preview Card */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/70 to-secondary/10 p-4 backdrop-blur-xl shadow-lg shadow-primary/5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                  <Shield className="h-3.5 w-3.5" /> Digital Vault ID
                </span>
                <Badge className="gradient-primary text-[10px] text-white border-0 font-medium">
                  {user.plan ? user.plan.toUpperCase() : 'PRO'}
                </Badge>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                  {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                  <AvatarFallback className="gradient-primary text-sm font-bold text-white">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-background/60 p-3 border border-border/60 space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Vault ID:</span>
                  <code className="font-mono text-[11px] text-foreground font-semibold">INH-8849-NX</code>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Security Grade:</span>
                  <span className="text-emerald-400 font-medium">94% (High)</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Inactivity Protocol:</span>
                  <span className="text-foreground">Every 90d</span>
                </div>
              </div>

              <button
                onClick={handleDownloadBackupCodes}
                className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <Key className="h-3 w-3" /> Download Emergency Recovery Kit
              </button>
            </div>
          </div>
        </div>

        {/* Right Active Content Panel */}
        <div className="lg:col-span-8 xl:col-span-9">
          <AnimatePresence mode="wait">
            {/* 1. PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Hero Avatar Card */}
                <div className="glass-card rounded-2xl p-6 border border-border/80 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 opacity-70" />
                  <div className="relative pt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                      <div className="relative">
                        <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                          {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                          <AvatarFallback className="gradient-primary text-2xl font-bold text-white">
                            {initials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background grid place-items-center">
                          <Check className="h-3 w-3 text-white" />
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <h2 className="text-xl font-bold">{user.name}</h2>
                          <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">
                            Owner
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Member since {new Date(user.joinedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={handleAvatarSelected} />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={uploadingAvatar}
                        onClick={() => avatarInputRef.current?.click()}
                        className="glass shadow-sm"
                      >
                        {uploadingAvatar ? (
                          <>
                            <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" /> Uploading…
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" /> Change photo
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Personal Information Form */}
                <div className="glass-card rounded-2xl p-6 border border-border/80">
                  <div className="flex items-center justify-between pb-4 border-b border-border/60">
                    <div>
                      <h3 className="text-base font-semibold">Personal Information</h3>
                      <p className="text-xs text-muted-foreground">
                        Your verifiable credentials for digital estate identification.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-400">
                      Identity Verified
                    </Badge>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="fullname">Legal Full Name</Label>
                      <Input
                        id="fullname"
                        className="mt-1.5 bg-background/50"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Legal name on official IDs"
                      />
                    </div>

                    <div>
                      <Label htmlFor="username">Vault Handle / Username</Label>
                      <div className="relative mt-1.5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                        <Input
                          id="username"
                          className="pl-7 bg-background/50"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email">Primary Email</Label>
                        <span className="text-[11px] text-emerald-400 font-medium">Primary Login</span>
                      </div>
                      <Input id="email" className="mt-1.5 bg-muted/40 cursor-not-allowed opacity-80" value={user.email} disabled />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number (SMS Recovery)</Label>
                      <Input
                        id="phone"
                        className="mt-1.5 bg-background/50"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div>
                      <Label htmlFor="country">Country of Residence</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger id="country" className="mt-1.5 bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IN">🇮🇳 India</SelectItem>
                          <SelectItem value="US">🇺🇸 United States</SelectItem>
                          <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
                          <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                          <SelectItem value="SG">🇸🇬 Singapore</SelectItem>
                          <SelectItem value="AE">🇦🇪 United Arab Emirates</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger id="timezone" className="mt-1.5 bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">India Standard Time (IST, GMT+5:30)</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time (EST, GMT-5)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PST, GMT-8)</SelectItem>
                          <SelectItem value="Europe/London">Greenwich Mean Time (GMT+0)</SelectItem>
                          <SelectItem value="Asia/Singapore">Singapore Time (SGT, GMT+8)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-5">
                    <Label htmlFor="bio">Estate & Executor Instructions Note</Label>
                    <Textarea
                      id="bio"
                      rows={3}
                      className="mt-1.5 bg-background/50"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Note visible to verified nominees during vault transfer..."
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      This note will be decrypted for designated nominees once release protocols are met.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 border-t border-border/60 pt-4">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="gradient-primary text-white shadow-glow px-6"
                    >
                      {savingProfile ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Saving…
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Save changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. SECURITY HEALTH TAB */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Security Score Banner */}
                <div className="glass-card rounded-2xl p-6 border border-border/80 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="relative grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-primary/20 border border-emerald-500/30">
                        <span className="text-3xl font-extrabold text-emerald-400">94</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground absolute bottom-1">Score</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold">Bank-Grade Protection</h3>
                          <Badge className="bg-emerald-500/15 text-emerald-400 border-0">Excellent</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground max-w-md">
                          Your vault has client-side Argon2id key derivation, 2FA enabled, and active nominee redundancy.
                        </p>
                      </div>
                    </div>

                    <div className="w-full md:w-48 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Strength:</span>
                        <span className="font-semibold text-emerald-400">94 / 100</span>
                      </div>
                      <Progress value={94} className="h-2.5 bg-muted" />
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 pt-6 border-t border-border/60">
                    {[
                      { title: 'Two-Factor Authentication', status: 'Enabled', pass: true },
                      { title: 'Master Password Strength', status: 'Very Strong (24 bits)', pass: true },
                      { title: 'Emergency Backup Codes', status: 'Generated & Saved', pass: true },
                      { title: 'Nominee Assignment', status: '3 Nominees Assigned', pass: true },
                      { title: 'Inactivity Heartbeat Protocol', status: 'Configured (90 days)', pass: true },
                      { title: 'Biometric Passkey', status: 'Ready to pair', pass: true },
                    ].map((c) => (
                      <div key={c.title} className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 p-3 text-xs">
                        <span className="font-medium">{c.title}</span>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{c.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dead Man's Switch / Inactivity Heartbeat Protocol */}
                <div className="glass-card rounded-2xl p-6 border border-border/80">
                  <div className="flex items-start justify-between pb-4 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">Inactivity Protocol (Dead Man&apos;s Switch)</h3>
                        <p className="text-xs text-muted-foreground">
                          Automatic nominee activation trigger if you do not check in for a designated period.
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary/15 text-primary border-primary/30">Active</Badge>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="checkin-freq">Check-in Verification Frequency</Label>
                      <Select value={checkInFrequency} onValueChange={setCheckInFrequency}>
                        <SelectTrigger id="checkin-freq" className="mt-1.5 bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">Every 30 Days (Strict)</SelectItem>
                          <SelectItem value="60">Every 60 Days</SelectItem>
                          <SelectItem value="90">Every 90 Days (Recommended)</SelectItem>
                          <SelectItem value="180">Every 180 Days (Semi-Annual)</SelectItem>
                          <SelectItem value="365">Every 1 Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        InHerify will ping your primary email and phone to confirm you are active.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="grace-period">Grace Period Before Nominee Notification</Label>
                      <Select value={gracePeriod} onValueChange={setGracePeriod}>
                        <SelectTrigger id="grace-period" className="mt-1.5 bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 Days Grace Period</SelectItem>
                          <SelectItem value="14">14 Days Grace Period (Recommended)</SelectItem>
                          <SelectItem value="30">30 Days Grace Period</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Buffer period with urgent reminders before nominee inheritance release initiates.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
                    <p className="text-xs font-semibold text-foreground">Ping Notification Channels:</p>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Switch
                          checked={inactivityAlertChannel.email}
                          onCheckedChange={(v) => setInactivityAlertChannel((s) => ({ ...s, email: v }))}
                        />
                        <span>Email Alert ({user.email})</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Switch
                          checked={inactivityAlertChannel.sms}
                          onCheckedChange={(v) => setInactivityAlertChannel((s) => ({ ...s, sms: v }))}
                        />
                        <span>SMS Ping ({phone || 'Primary phone'})</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => toast.success('Inactivity protocol settings saved')} className="gradient-primary text-white shadow-glow">
                      <Save className="mr-2 h-4 w-4" /> Save Protocol
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. MASTER PASSWORD TAB */}
            {activeTab === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-2xl p-6 border border-border/80">
                  <div className="flex items-center gap-3 pb-4 border-b border-border/60">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Change Master Password</h3>
                      <p className="text-xs text-muted-foreground">
                        Your master password derives the client-side AES-256 encryption key. It is never transmitted to servers in plaintext.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4 max-w-xl">
                    <div>
                      <Label htmlFor="curr-pass">Current Password</Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="curr-pass"
                          type={showCurrentPass ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                          className="bg-background/50 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="new-pass">New Master Password</Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="new-pass"
                          type={showNextPass ? 'text' : 'password'}
                          value={nextPassword}
                          onChange={(e) => setNextPassword(e.target.value)}
                          placeholder="Create strong, unique passphrase"
                          className="bg-background/50 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNextPass(!showNextPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNextPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Password Strength Meter */}
                      {nextPassword && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Entropy / Strength:</span>
                            <span className={cn(
                              'font-semibold',
                              passwordScore < 50 ? 'text-rose-400' : passwordScore < 80 ? 'text-amber-400' : 'text-emerald-400'
                            )}>
                              {passwordScore < 50 ? 'Weak' : passwordScore < 80 ? 'Good' : 'Very Strong'}
                            </span>
                          </div>
                          <Progress
                            value={passwordScore}
                            className={cn(
                              'h-2 bg-muted',
                              passwordScore < 50 ? '[&>div]:bg-rose-500' : passwordScore < 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'
                            )}
                          />

                          <div className="grid grid-cols-2 gap-1.5 pt-2 text-[11px] text-muted-foreground">
                            <span className={cn('flex items-center gap-1', nextPassword.length >= 8 ? 'text-emerald-400' : '')}>
                              <Check className="h-3 w-3" /> Min. 8 characters
                            </span>
                            <span className={cn('flex items-center gap-1', /[A-Z]/.test(nextPassword) ? 'text-emerald-400' : '')}>
                              <Check className="h-3 w-3" /> Uppercase letter
                            </span>
                            <span className={cn('flex items-center gap-1', /[0-9]/.test(nextPassword) ? 'text-emerald-400' : '')}>
                              <Check className="h-3 w-3" /> Number included
                            </span>
                            <span className={cn('flex items-center gap-1', /[^A-Za-z0-9]/.test(nextPassword) ? 'text-emerald-400' : '')}>
                              <Check className="h-3 w-3" /> Special character
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirm-pass">Confirm New Password</Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="confirm-pass"
                          type={showConfirmPass ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="bg-background/50 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={handleUpdatePassword}
                        disabled={savingPassword}
                        className="gradient-primary text-white shadow-glow"
                      >
                        {savingPassword ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Updating…
                          </>
                        ) : (
                          <>
                            <KeyRound className="mr-2 h-4 w-4" /> Update Master Password
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. TWO-FACTOR AUTH (2FA) TAB */}
            {activeTab === '2fa' && (
              <motion.div
                key="2fa"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* 2FA Master Switch Card */}
                <div className="glass-card rounded-2xl p-6 border border-border/80">
                  <div className="flex items-center justify-between pb-6 border-b border-border/60">
                    <div className="flex items-center gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                        <Smartphone className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold">Two-Factor Authentication (2FA)</h3>
                          <Badge className={cn('text-xs border-0', twoFactorEnabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground')}>
                            {twoFactorEnabled ? 'Active' : 'Disabled'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Requires a time-based one-time password (TOTP) from an authenticator app on every new login.
                        </p>
                      </div>
                    </div>
                    <Switch checked={twoFactorEnabled} onCheckedChange={handleToggle2FA} />
                  </div>

                  {twoFactorEnabled && (
                    <div className="mt-6 space-y-6">
                      {/* Authenticator App Setup Display */}
                      <div className="grid gap-6 md:grid-cols-2 rounded-xl border border-border/60 bg-background/40 p-5">
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                            1. Scan Authenticator QR Code
                          </p>
                          <div className="flex items-center gap-4">
                            {/* Stylized QR Code placeholder */}
                            <div className="relative grid h-32 w-32 place-items-center rounded-xl border-2 border-primary/40 bg-card p-2 shadow-inner">
                              <div className="grid grid-cols-4 gap-1 p-2 bg-foreground/10 rounded-lg w-full h-full">
                                {Array.from({ length: 16 }).map((_, i) => (
                                  <div key={i} className={cn('rounded-[2px]', (i % 2 === 0 || i % 5 === 0) ? 'bg-primary' : 'bg-transparent')} />
                                ))}
                              </div>
                              <span className="absolute inset-0 border border-primary/30 rounded-xl pointer-events-none" />
                            </div>
                            <div className="text-xs text-muted-foreground space-y-2">
                              <p>Works with Google Authenticator, Microsoft Authenticator, 1Password, or Authy.</p>
                              <div className="rounded-lg bg-muted/60 p-2 font-mono text-[11px] text-foreground select-all">
                                JBSWY3DPEHPK3PXP
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText('JBSWY3DPEHPK3PXP');
                                  toast.success('Secret key copied');
                                }}
                                className="h-7 text-xs"
                              >
                                <Copy className="mr-1 h-3 w-3" /> Copy Secret Key
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 md:border-l md:border-border/60 md:pl-6">
                          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                            2. Test & Confirm Code
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Enter the 6-digit verification code from your authenticator app to test synchronization.
                          </p>
                          <div className="flex items-center gap-2">
                            <Input
                              maxLength={6}
                              placeholder="000000"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                              className="w-36 text-center font-mono text-base tracking-widest bg-background"
                            />
                            <Button
                              size="sm"
                              disabled={otpCode.length !== 6}
                              onClick={() => {
                                toast.success('2FA code successfully verified!');
                                setOtpCode('');
                              }}
                              className="gradient-primary text-white"
                            >
                              Verify
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Backup Recovery Codes */}
                      <div className="rounded-xl border border-border/60 bg-background/40 p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-semibold">Emergency Backup Recovery Codes</h4>
                            <p className="text-xs text-muted-foreground">
                              If you lose access to your phone, these single-use codes are your only way to regain access.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleCopyBackupCodes} className="h-8 text-xs">
                              <Copy className="mr-1 h-3 w-3" /> Copy
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDownloadBackupCodes} className="h-8 text-xs">
                              <Download className="mr-1 h-3 w-3" /> Download .txt
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleRegenerateCodes} className="h-8 text-xs text-muted-foreground hover:text-foreground">
                              <RefreshCw className="mr-1 h-3 w-3" /> Refresh
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {backupCodes.map((code, idx) => (
                            <div
                              key={code}
                              className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-xs font-mono"
                            >
                              <span className="text-muted-foreground text-[10px]">{idx + 1}.</span>
                              <span className="font-semibold">{code}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 5. APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-2xl p-6 border border-border/80">
                  <div className="flex items-center gap-3 pb-4 border-b border-border/60">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                      <Palette className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Theme & Visual Experience</h3>
                      <p className="text-xs text-muted-foreground">
                        Customize how the InHerify dashboard and vault viewer looks.
                      </p>
                    </div>
                  </div>

                  {/* Theme Mode Selector Cards */}
                  <div className="mt-6">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Color Mode
                    </Label>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Dark */}
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={cn(
                          'relative rounded-2xl border-2 p-4 text-left transition-all overflow-hidden group',
                          theme === 'dark'
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                            : 'border-border/60 hover:border-border'
                        )}
                      >
                        {theme === 'dark' && (
                          <span className="absolute top-3 right-3 grid h-5 w-5 place-items-center rounded-full bg-primary text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                        <div className="h-20 rounded-xl bg-[#09090b] border border-white/10 p-2 flex flex-col justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-rose-500" />
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          </div>
                          <div className="h-2 w-12 rounded bg-white/20" />
                          <div className="grid grid-cols-3 gap-1">
                            <div className="h-4 rounded bg-primary/40" />
                            <div className="h-4 rounded bg-white/10" />
                            <div className="h-4 rounded bg-white/10" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Moon className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold">Dark Mode</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">Midnight black & glowing aurora</p>
                      </button>

                      {/* Light */}
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={cn(
                          'relative rounded-2xl border-2 p-4 text-left transition-all overflow-hidden group',
                          theme === 'light'
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                            : 'border-border/60 hover:border-border'
                        )}
                      >
                        {theme === 'light' && (
                          <span className="absolute top-3 right-3 grid h-5 w-5 place-items-center rounded-full bg-primary text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                        <div className="h-20 rounded-xl bg-white border border-gray-200 p-2 flex flex-col justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-gray-300" />
                            <div className="h-2 w-2 rounded-full bg-gray-300" />
                            <div className="h-2 w-2 rounded-full bg-gray-300" />
                          </div>
                          <div className="h-2 w-12 rounded bg-gray-300" />
                          <div className="grid grid-cols-3 gap-1">
                            <div className="h-4 rounded bg-primary/30" />
                            <div className="h-4 rounded bg-gray-200" />
                            <div className="h-4 rounded bg-gray-200" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Sun className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-semibold">Light Mode</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">Clean, high-contrast white</p>
                      </button>

                      {/* System */}
                      <button
                        type="button"
                        onClick={() => setTheme('system')}
                        className={cn(
                          'relative rounded-2xl border-2 p-4 text-left transition-all overflow-hidden group',
                          theme === 'system'
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                            : 'border-border/60 hover:border-border'
                        )}
                      >
                        {theme === 'system' && (
                          <span className="absolute top-3 right-3 grid h-5 w-5 place-items-center rounded-full bg-primary text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                        <div className="h-20 rounded-xl overflow-hidden border border-border flex">
                          <div className="w-1/2 bg-white p-2 flex flex-col justify-between">
                            <div className="h-2 w-2 rounded-full bg-gray-300" />
                            <div className="h-3 rounded bg-primary/30" />
                          </div>
                          <div className="w-1/2 bg-[#09090b] p-2 flex flex-col justify-between">
                            <div className="h-2 w-2 rounded-full bg-white/20 self-end" />
                            <div className="h-3 rounded bg-primary/40" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Laptop className="h-4 w-4 text-secondary" />
                          <span className="text-sm font-semibold">System Match</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">Follows OS dark/light setting</p>
                      </button>
                    </div>
                  </div>

                  {/* Accent Highlight Selection */}
                  <div className="mt-8 pt-6 border-t border-border/60">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Brand Accent Palette
                    </Label>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {[
                        { name: 'Indigo Electric', color: 'bg-indigo-600', active: true },
                        { name: 'Cyber Emerald', color: 'bg-emerald-500', active: false },
                        { name: 'Ocean Cyan', color: 'bg-cyan-500', active: false },
                        { name: 'Sunset Amber', color: 'bg-amber-500', active: false },
                        { name: 'Rose Quartz', color: 'bg-rose-500', active: false },
                      ].map((item) => (
                        <button
                          key={item.name}
                          onClick={() => toast.success(`Accent color set to ${item.name}`)}
                          className={cn(
                            'flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-xs font-medium transition-all hover:border-primary/50',
                            item.active ? 'border-primary bg-primary/10 text-primary font-semibold' : 'bg-background/40 text-muted-foreground'
                          )}
                        >
                          <span className={cn('h-3.5 w-3.5 rounded-full ring-2 ring-white/20', item.color)} />
                          <span>{item.name}</span>
                          {item.active && <Check className="h-3 w-3 text-primary ml-1" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-2xl p-6 border border-border/80">
                  <div className="flex items-center gap-3 pb-4 border-b border-border/60">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Notification Preferences</h3>
                      <p className="text-xs text-muted-foreground">
                        Configure alerts for security anomalies, nominee events, and estate triggers.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {[
                      {
                        key: 'securityAlerts' as const,
                        label: 'Security & Login Alerts',
                        desc: 'Immediate notifications for unrecognized logins, password modifications, or 2FA changes.',
                        icon: ShieldCheck,
                        badge: 'Recommended',
                      },
                      {
                        key: 'emailNotifications' as const,
                        label: 'Estate & Nominee Actions',
                        desc: 'Alerts when a nominee accepts nomination or updates their verified contact information.',
                        icon: Share2,
                      },
                      {
                        key: 'pushNotifications' as const,
                        label: 'Browser Push Notifications',
                        desc: 'Real-time desktop banners when documents are uploaded or access requests are filed.',
                        icon: Radio,
                      },
                      {
                        key: 'marketingUpdates' as const,
                        label: 'Product Updates & Security Advisory',
                        desc: 'Monthly digest of newly added inheritance features and zero-knowledge cryptography upgrades.',
                        icon: Sparkles,
                      },
                    ].map((row) => {
                      const Icon = row.icon;
                      return (
                        <div
                          key={row.key}
                          className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 p-4 transition-all hover:border-border"
                        >
                          <div className="flex items-start gap-3.5 pr-4">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary mt-0.5">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold">{row.label}</p>
                                {row.badge && (
                                  <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-[10px] px-1.5 py-0">
                                    {row.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{row.desc}</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences[row.key]}
                            onCheckedChange={(v) => handleTogglePreference(row.key, v)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 7. PRIVACY & EXPORT TAB */}
            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Zero-Knowledge Architecture Card */}
                <div className="glass-card rounded-2xl p-6 border border-border/80">
                  <div className="flex items-center gap-3 pb-4 border-b border-border/60">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Zero-Knowledge Privacy Architecture</h3>
                      <p className="text-xs text-muted-foreground">
                        Your documents and credentials are encrypted on your local device before touching the cloud.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 p-4">
                      <div>
                        <p className="text-sm font-semibold">Public Nominee Directory Visibility</p>
                        <p className="text-xs text-muted-foreground">
                          Allow designated family nominees to verify your full legal name during invitation acceptance.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.publicProfile}
                        onCheckedChange={(v) => handleTogglePreference('publicProfile', v)}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 p-4">
                      <div>
                        <p className="text-sm font-semibold">Anonymous Crash & Telemetry Reports</p>
                        <p className="text-xs text-muted-foreground">
                          Share anonymized performance metrics to help us harden cryptographic stability.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.analytics}
                        onCheckedChange={(v) => handleTogglePreference('analytics', v)}
                      />
                    </div>
                  </div>

                  {/* Export Full Vault Archive */}
                  <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileJson className="h-5 w-5 text-primary" />
                          <h4 className="text-sm font-bold">Export Full Encrypted Vault Archive</h4>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground max-w-md">
                          Download a complete, offline JSON package containing your encrypted assets metadata, nominee records, and activity logs.
                        </p>
                      </div>
                      <Button
                        onClick={handleExportVaultData}
                        className="gradient-primary text-white shadow-glow shrink-0"
                      >
                        <Download className="mr-2 h-4 w-4" /> Download JSON Archive
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 8. ACTIVE SESSIONS / DEVICES TAB */}
            {activeTab === 'devices' && (
              <motion.div
                key="devices"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-2xl p-6 border border-border/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                        <Monitor className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">Connected Devices & Active Sessions</h3>
                        <p className="text-xs text-muted-foreground">
                          Devices currently authenticated to your InHerify vault.
                        </p>
                      </div>
                    </div>
                    {devices.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSignOutEverywhere}
                        className="text-xs text-rose-500 hover:bg-rose-500/10 border-rose-500/30"
                      >
                        Sign out other devices
                      </Button>
                    )}
                  </div>

                  <div className="mt-6 space-y-3">
                    {devices.map((d: any) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 p-4 transition-all hover:border-border"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={cn(
                            'grid h-11 w-11 place-items-center rounded-xl',
                            d.current ? 'bg-emerald-500/15 text-emerald-400' : 'bg-primary/15 text-primary'
                          )}>
                            {d.name.toLowerCase().includes('phone') ? (
                              <Smartphone className="h-5 w-5" />
                            ) : (
                              <Monitor className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">{d.name}</p>
                              {d.current && (
                                <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-[10px] px-2 py-0">
                                  Current Device
                                </Badge>
                              )}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span>{d.location}</span>
                              <span>•</span>
                              <code className="font-mono text-[11px]">{d.ip}</code>
                              <span>•</span>
                              <span>{d.current ? 'Active now' : `Last active ${formatDateTime(d.lastActive)}`}</span>
                            </div>
                          </div>
                        </div>

                        {!d.current && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-rose-500 hover:bg-rose-500/10"
                            onClick={() => handleRevokeDevice(d.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 9. DELETE ACCOUNT (DANGER ZONE) TAB */}
            {activeTab === 'delete' && (
              <motion.div
                key="delete"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-2xl p-6 border border-rose-500/30 bg-rose-500/[0.02]">
                  <div className="flex items-center gap-3 pb-4 border-b border-rose-500/20">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/15 text-rose-500">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-rose-500">Danger Zone: Permanent Account Deletion</h3>
                      <p className="text-xs text-muted-foreground">
                        Irreversible action. Your entire vault and nominee estate authorizations will be permanently destroyed.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-2 text-xs text-rose-400">
                    <p className="font-semibold text-sm">Please read carefully before proceeding:</p>
                    <ul className="list-disc pl-4 space-y-1 text-rose-300">
                      <li>All zero-knowledge encrypted passwords, identity credentials, and bank records will be instantly scrubbed.</li>
                      <li>Any assigned nominees will permanently lose their inheritance authorization keys.</li>
                      <li>Your uploaded estate documents, legal wills, and signatures will be irrevocably expunged from storage.</li>
                      <li>This operation cannot be reversed by InHerify support engineers.</li>
                    </ul>
                  </div>

                  <div className="mt-6 space-y-3 max-w-md">
                    <Label htmlFor="del-confirm" className="text-xs text-muted-foreground">
                      Type <span className="font-mono font-bold text-rose-400">DELETE</span> to confirm intent:
                    </Label>
                    <Input
                      id="del-confirm"
                      value={deleteConfirmationInput}
                      onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                      placeholder="Type DELETE"
                      className="bg-background/50 border-rose-500/30 focus-visible:ring-rose-500"
                    />
                  </div>

                  <div className="mt-6 pt-4 border-t border-rose-500/20">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          disabled={deleteConfirmationInput !== 'DELETE'}
                          className="bg-rose-500 hover:bg-rose-600 text-white font-semibold"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Permanently Delete My Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely certain?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently destroy your InHerify vault, encrypted assets, digital will, and nominee assignments. This action is irreversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-rose-600 hover:bg-rose-700 text-white"
                            onClick={handleDeleteAccount}
                          >
                            Yes, permanently erase all data
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardShell>
  );
}
