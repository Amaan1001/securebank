// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  fullName: string;
  email: string;
  expiresIn: number;
}

export interface AuthUser {
  userId: string;
  fullName: string;
  email: string;
  token: string;
}

// ── Users ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

// ── Accounts ──────────────────────────────────────────────────────────────────
export type AccountType   = 'CHECKING' | 'SAVINGS';
export type AccountStatus = 'ACTIVE' | 'CLOSED' | 'FROZEN';

export interface Account {
  id: string;
  accountNumber: string;
  userId: string;
  ownerName: string;
  accountType: AccountType;
  status: AccountStatus;
  balance: number;
  currency: string;
  createdAt: string;
}

export interface CreateAccountRequest {
  userId: string;
  accountType: AccountType;
}

// ── Transactions ──────────────────────────────────────────────────────────────
export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';

export interface Transaction {
  id: string;
  referenceNumber: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description?: string;
  relatedAccountNumber?: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface TransactionRequest {
  amount: number;
  description?: string;
}

export interface TransferRequest {
  toAccountNumber: string;
  amount: number;
  description?: string;
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// ── API Errors ────────────────────────────────────────────────────────────────
export interface ApiError {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  validationErrors?: Record<string, string>;
}
