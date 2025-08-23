// types.ts

export enum UserRole {
  Client = 'CLIENT',
  Owner = 'OWNER',
  Admin = 'ADMIN',
}

export enum OwnerViewTab {
  Dashboard = 'dashboard',
  MyProperties = 'my-properties',
  AddProperty = 'add-property',
  Store = 'store',
  Profile = 'profile',
}

export enum PurchaseStatus {
  Pending = 'PENDING',
  Confirmed = 'CONFIRMED',
}

export enum VerificationStatus {
  NotVerified = 'NOT_VERIFIED',
  Pending = 'PENDING',
  Verified = 'VERIFIED',
}

// --- Interfaces de Dados ---

export interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  description: string;
}

export interface Purchase {
  id: string;
  ownerId: string;
  pkgId: string;
  proofOfPayment: string;
  status: PurchaseStatus;
  createdAt: Date;
  confirmedAt?: Date | null;
  pkg: CoinPackage;
  owner?: Owner; // Opcional, dependendo da query
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;
  imageUrls: string[];
  owner?: { // Opcional, para mostrar dados do proprietário
    name: string;
    verificationStatus: VerificationStatus;
  }
}

export interface Client {
  id: string; // Corresponde ao Firebase UID
  name: string;
  email: string;
  profilePictureUrl?: string | null;
  favoriteProperties: Property[];
}

export interface Owner {
  id: string; // Corresponde ao Firebase UID
  name: string;
  email: string;
  phoneNumber?: string | null;
  ascBalance: number;
  profilePictureUrl?: string | null;
  verificationStatus: VerificationStatus;
  verificationDocumentUrl?: string | null;
  verificationSelfieUrl?: string | null;
  properties?: Property[];
}

// Representa o utilizador autenticado na aplicação
export type AuthenticatedUser = 
  | { user: Owner; role: UserRole.Owner }
  | { user: Client; role: UserRole.Client };