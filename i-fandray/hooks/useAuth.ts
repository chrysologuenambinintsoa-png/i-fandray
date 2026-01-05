'use client';

import { useSession, signOut } from 'next-auth/react';
import { User } from '@/types';

export function useAuth() {
  const { data: session, status } = useSession();

  const logout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  return {
    user: session?.user as User | null,
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
    token: null,
    logout,
    updateUser,
  };
}