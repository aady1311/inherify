export type UserRole = 'user' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'pending';

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  securityAlerts: boolean;
  marketingUpdates: boolean;
  analytics: boolean;
  publicProfile: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  lastLogin?: string;
  twoFactorEnabled: boolean;
  plan: 'free' | 'pro' | 'legacy';
  preferences?: UserPreferences;
}

export type AssetCategory =
  | 'passwords'
  | 'email'
  | 'bank'
  | 'crypto'
  | 'insurance'
  | 'property'
  | 'medical'
  | 'identity'
  | 'notes'
  | 'custom';

export type AssetStatus = 'active' | 'archived' | 'inherited' | 'pending';

export interface VaultAsset {
  id: string;
  title: string;
  category: AssetCategory;
  username?: string;
  url?: string;
  notes?: string;
  status: AssetStatus;
  favorite: boolean;
  encrypted: boolean;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  sharedWithNomineeIds: string[];
}

export type DocumentType =
  | 'pdf'
  | 'image'
  | 'doc'
  | 'spreadsheet'
  | 'presentation'
  | 'other';

export interface VaultDocument {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  category: AssetCategory;
  uploadedAt: string;
  url: string;
  encrypted: boolean;
  sharedWithNomineeIds: string[];
}

export type VerificationStatus =
  | 'verified'
  | 'pending'
  | 'reviewing'
  | 'rejected'
  | 'expired';

export interface Nominee {
  id: string;
  name: string;
  email: string;
  phone: string;
  relation: string;
  avatar?: string;
  sharePercentage: number;
  verificationStatus: VerificationStatus;
  addedAt: string;
  lastNotifiedAt?: string;
  assetsShared: number;
}

export type NotificationType =
  | 'security'
  | 'nominee'
  | 'asset'
  | 'system'
  | 'billing'
  | 'verification';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export type ActivityType =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'share'
  | 'verify'
  | 'download'
  | 'upload';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  description: string;
  ip: string;
  device: string;
  location: string;
  timestamp: string;
}

export interface DashboardStats {
  totalAssets: number;
  totalDocuments: number;
  totalNominees: number;
  securityScore: number;
  lastLogin: string;
  lastLoginDevice?: string;
  lastLoginLocation?: string;
  pendingVerifications: number;
  pendingNomineeName?: string;
  storageUsed: number;
  storageTotal: number;
  subscriptionStatus: 'active' | 'trial' | 'expired';
  subscriptionPlan: 'free' | 'pro' | 'legacy';
  subscriptionRenewsAt?: string;
  twoFactorEnabled?: boolean;
  categoryData?: { category: string; count: number }[];
}

export interface ActivityPoint {
  date: string;
  logins: number;
  actions: number;
  shares: number;
}

export interface CategoryPoint {
  category: string;
  count: number;
}

export interface SecurityPoint {
  metric: string;
  value: number;
  full: number;
}

export interface WillVersion {
  id: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
  summary: string;
  published: boolean;
}

export interface DigitalWill {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  updatedAt: string;
  versions: WillVersion[];
  signedAt?: string;
  signatureHash?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  relation: string;
  priority: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  content: string;
  rating: number;
}

export interface AdminReport {
  id: string;
  type: 'user' | 'verification' | 'security' | 'billing';
  title: string;
  status: 'open' | 'reviewing' | 'resolved';
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  nomineeName: string;
  type: 'identity' | 'death-certificate' | 'legal';
  status: VerificationStatus;
  submittedAt: string;
  documents: number;
}
