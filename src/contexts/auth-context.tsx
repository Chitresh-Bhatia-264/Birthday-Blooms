'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

const USERS_STORAGE_KEY = 'bb_users_v1';
const CURRENT_USER_KEY = 'bb_current_user_v1';

export interface User {
  id: number;
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  credits: number;
  freeCreditsClaimed: boolean;
  twoFaEnabled: boolean;
  photoURL?: string;
}

interface StoredAccount extends User {
  passwordHash: string;
  totpSecret: string;
}

export interface LoginStepResult {
  requires2FA: boolean;
  twoFaEnabled: boolean;
  userId: number;
  email: string;
  role?: 'user' | 'admin';
  freeCreditsPending: number;
  totpSecret?: string;
  otpauthUri?: string;
}

export interface RegisterStepResult {
  requires2FASetup: boolean;
  userId: number;
  email: string;
  totpSecret: string;
  otpauthUri: string;
  freeCreditsPending: number;
}

export interface Verify2FAResult {
  user: User;
  freeCreditsAwarded: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<LoginStepResult>;
  registerWithEmail: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<RegisterStepResult>;
  verifyTwoFactor: (userId: number, code: string) => Promise<Verify2FAResult>;
  deductCredit: (amount?: number, reason?: string) => Promise<boolean>;
  purchasePlan: (planId: string) => Promise<User>;
  refreshUser: () => Promise<void>;
  loginAsDemo: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

function hashPasswordClient(password: string): string {
  // Lightweight deterministic client hash (no external DB)
  return btoa(unescape(encodeURIComponent(`bb:${password}`)));
}

function readAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
  }
}

function stripSensitive(acc: StoredAccount): User {
  const { passwordHash: _p, totpSecret: _s, ...pub } = acc;
  return pub;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedId = localStorage.getItem(CURRENT_USER_KEY);
      if (savedId) {
        const found = readAccounts().find((a) => String(a.id) === savedId);
        if (found) {
          setUser(stripSensitive(found));
        } else {
          localStorage.removeItem(CURRENT_USER_KEY);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, password: string): Promise<LoginStepResult> => {
    const normalized = email.trim().toLowerCase();
    const accounts = readAccounts();
    const found = accounts.find((a) => a.email === normalized);

    if (!found || found.passwordHash !== hashPasswordClient(password)) {
      throw new Error('Invalid email or password.');
    }

    const issuer = encodeURIComponent('Birthday Bloom');
    const label = encodeURIComponent(`Birthday Bloom:${found.email}`);
    const otpauthUri = `otpauth://totp/${label}?secret=${found.totpSecret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;

    return {
      requires2FA: true,
      twoFaEnabled: found.twoFaEnabled,
      userId: found.id,
      email: found.email,
      role: found.role,
      freeCreditsPending: 0,
      ...(found.twoFaEnabled ? {} : { totpSecret: found.totpSecret, otpauthUri }),
    };
  };

  const registerWithEmail = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<RegisterStepResult> => {
    const normalized = payload.email.trim().toLowerCase();
    if (!payload.firstName.trim() || !payload.lastName.trim() || !normalized.includes('@')) {
      throw new Error('Please enter a valid first name, last name, and email.');
    }
    if (payload.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const accounts = readAccounts();
    if (accounts.some((a) => a.email === normalized)) {
      throw new Error('An account with this email already exists. Please log in.');
    }

    const res = await fetch('/api/auth/totp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setup', email: normalized }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Could not initialize 2FA.');
    }

    const id = Date.now();
    const newAccount: StoredAccount = {
      id,
      uid: String(id),
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: normalized,
      displayName: `${payload.firstName.trim()} ${payload.lastName.trim()}`,
      role: 'user',
      credits: 0,
      freeCreditsClaimed: true,
      twoFaEnabled: false,
      passwordHash: hashPasswordClient(payload.password),
      totpSecret: data.totpSecret,
    };

    accounts.push(newAccount);
    writeAccounts(accounts);

    return {
      requires2FASetup: true,
      userId: id,
      email: normalized,
      totpSecret: data.totpSecret,
      otpauthUri: data.otpauthUri,
      freeCreditsPending: 0,
    };
  };

  const verifyTwoFactor = async (userId: number, code: string): Promise<Verify2FAResult> => {
    const accounts = readAccounts();
    const idx = accounts.findIndex((a) => a.id === userId);
    if (idx === -1) {
      throw new Error('Account not found.');
    }

    const res = await fetch('/api/auth/totp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify',
        secret: accounts[idx].totpSecret,
        code,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Invalid or expired Authenticator code.');
    }

    accounts[idx].twoFaEnabled = true;
    writeAccounts(accounts);

    const publicUser = stripSensitive(accounts[idx]);
    localStorage.setItem(CURRENT_USER_KEY, String(publicUser.id));
    setUser(publicUser);

    return { user: publicUser, freeCreditsAwarded: 0 };
  };

  const deductCredit = async (): Promise<boolean> => true;

  const purchasePlan = async (): Promise<User> => {
    if (!user) throw new Error('Not signed in');
    return user;
  };

  const refreshUser = async () => {};

  const loginAsDemo = () => {
    router.push('/login');
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        registerWithEmail,
        verifyTwoFactor,
        deductCredit,
        purchasePlan,
        refreshUser,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
