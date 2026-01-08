'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/components/TranslationProvider';
import {
  User as UserIcon,
  Lock,
  Bell,
  Globe,
  Palette,
  Shield,
  Eye,
  MessageSquare,
  Mail,
  Save,
  ChevronRight,
  Info,
  Camera,
  Smartphone,
  Key,
  Trash2,
  AlertTriangle,
  FileText,
  Link as LinkIcon,
  Unlink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { availableLocales, localeNames } from '@/lib/i18n';

type SettingsTab = 'profile' | 'account' | 'privacy' | 'notifications' | 'appearance' | 'security' | 'pages' | 'about';

export default function SettingsPageClient() {
  const router = useRouter();
  const { user, isLoading, updateUser } = useAuth();
  const { language, theme, setLanguage, setTheme, notifications, privacy, setNotification, setPrivacy } = useSettings();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Account settings state
  const [accountData, setAccountData] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Security settings state
  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: '30' // days
  });

  // Connected accounts state
  const [connectedAccounts, setConnectedAccounts] = useState<Array<{
    provider: string;
    providerAccountId: string;
  }>>([]);

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    avatar: user?.avatar || '',
    coverPhoto: user?.coverPhoto || ''
  });

  // Page creation state
  const [pageData, setPageData] = useState({
    name: '',
    description: '',
    category: '',
    website: '',
    avatar: '',
    coverPhoto: ''
  });

  // Refs for file inputs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && user === null) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // Upload file helper
  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file' });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    try {
      setIsUpdating(true);
      const avatarUrl = await uploadFile(file);
      if (avatarUrl) {
        setProfileData(prev => ({ ...prev, avatar: avatarUrl }));
        setMessage({ type: 'success', text: 'Profile picture uploaded successfully' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload profile picture' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle cover photo upload
  const handleCoverPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file' });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    try {
      setIsUpdating(true);
      const coverPhotoUrl = await uploadFile(file);
      if (coverPhotoUrl) {
        setProfileData(prev => ({ ...prev, coverPhoto: coverPhotoUrl }));
        setMessage({ type: 'success', text: 'Cover photo uploaded successfully' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload cover photo' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle page creation
  const handlePageCreation = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!pageData.name.trim()) {
      setMessage({ type: 'error', text: 'Page name is required' });
      return;
    }

    try {
      setIsUpdating(true);
      setMessage(null);

      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create page');
      }

      setMessage({ type: 'success', text: 'Page created successfully!' });
      
      // Reset form
      setPageData({
        name: '',
        description: '',
        category: '',
        website: '',
        avatar: '',
        coverPhoto: ''
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create page' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle account input changes
  const handleAccountInputChange = (field: string, value: string) => {
    setAccountData(prev => ({ ...prev, [field]: value }));
  };

  // Handle account update
  const handleAccountUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsUpdating(true);
      setMessage(null);

      const response = await fetch('/api/users/account', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: accountData.email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update account');
      }

      const data = await response.json();
      updateUser(data.user);
      setMessage({ type: 'success', text: 'Account updated successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update account' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle linking OAuth account
  const handleLinkAccount = async (provider: string) => {
    setIsUpdating(true);
    try {
      const result = await signIn(provider, { callbackUrl: '/settings' });
      if (result?.error) {
        throw new Error(result.error);
      }
      // Refresh connected accounts
      const response = await fetch('/api/users/connected-accounts');
      if (response.ok) {
        const data = await response.json();
        setConnectedAccounts(data.accounts || []);
      }
      setMessage({ type: 'success', text: `${provider} account linked successfully` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || `Failed to link ${provider} account` });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle unlinking OAuth account
  const handleUnlinkAccount = async (provider: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/users/connected-accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unlink account');
      }

      // Refresh connected accounts
      const data = await response.json();
      setConnectedAccounts(data.accounts || []);
      setMessage({ type: 'success', text: `${provider} account unlinked successfully` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || `Failed to unlink ${provider} account` });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProfileUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsUpdating(true);
      setMessage(null);

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          username: profileData.username,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      updateUser(data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();

    if (accountData.newPassword !== accountData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (accountData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    try {
      setIsUpdating(true);
      setMessage(null);

      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: accountData.currentPassword,
          newPassword: accountData.newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      setMessage({ type: 'success', text: 'Password changed successfully' });
      setAccountData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle privacy setting changes
  const handlePrivacyChange = (key: keyof typeof privacy, value: any) => {
    setPrivacy(key, value);
    setMessage({ type: 'success', text: 'Privacy settings updated' });
  };

  // Handle notification setting changes
  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    setNotification(key, value);
    setMessage({ type: 'success', text: 'Notification settings updated' });
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      setIsUpdating(true);
      setMessage(null);

      const response = await fetch('/api/users/delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      // Sign out and redirect to home
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete account' });
    } finally {
      setIsUpdating(false);
    }
  };

  const tabs = [
    { id: 'profile' as SettingsTab, label: t('profile.profile'), icon: UserIcon },
    { id: 'account' as SettingsTab, label: t('settings.account'), icon: Lock },
    { id: 'privacy' as SettingsTab, label: t('settings.privacy'), icon: Shield },
    { id: 'notifications' as SettingsTab, label: t('settings.notifications'), icon: Bell },
    { id: 'appearance' as SettingsTab, label: t('settings.appearance'), icon: Palette },
    { id: 'security' as SettingsTab, label: t('settings.security'), icon: Eye },
    { id: 'pages' as SettingsTab, label: 'Pages', icon: FileText },
    { id: 'about' as SettingsTab, label: t('settings.about'), icon: Info },
  ];

  const languages = availableLocales.map(code => ({
    code,
    name: localeNames[code],
    flag: code === 'en' ? '🇺🇸' :
          code === 'fr' ? '🇫🇷' :
          code === 'mg' ? '🇲🇬' :
          code === 'de' ? '🇩🇪' :
          code === 'es' ? '🇪🇸' :
          code === 'ch' ? '🇨🇳' : '🏳️'
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex pt-16">
        <Sidebar currentPage="settings" />

        <main className="flex-1 lg:ml-64">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('settings.settings')}</h1>

            <div className="flex gap-6">
              {/* Sidebar */}
              <aside className="w-64 flex-shrink-0">
                <nav className="bg-white rounded-lg shadow-md overflow-hidden">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted transition-colors',
                          activeTab === tab.id
                            ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
                            : 'text-muted-foreground'
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{tab.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    );
                  })}
                </nav>
              </aside>

              {/* Content */}
              <div className="flex-1">
                <div className="bg-white rounded-lg shadow-md p-6">
                  {activeTab === 'profile' && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.editProfile')}</h2>

                      {/* Message display */}
                      {message && (
                        <div className={cn(
                          'mb-6 p-4 rounded-lg',
                          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                        )}>
                          {message.text}
                        </div>
                      )}

                      {/* Hidden file inputs */}
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        aria-label="Upload profile avatar"
                      />
                      <input
                        ref={coverPhotoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverPhotoUpload}
                        className="hidden"
                        aria-label="Upload cover photo"
                      />

                      {/* Profile Picture */}
                      <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
                        <div className="relative">
                          <img
                            src={profileData.avatar || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                          <button
                            onClick={() => avatarInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg transition-colors"
                            aria-label="Change profile picture"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
                          <p className="text-gray-600">Upload a new profile picture</p>
                          <button
                            onClick={() => avatarInputRef.current?.click()}
                            className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Change Avatar
                          </button>
                        </div>
                      </div>

                      {/* Cover Photo */}
                      <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
                        <div className="relative">
                          <img
                            src={profileData.coverPhoto || 'https://via.placeholder.com/400x150'}
                            alt="Cover"
                            className="w-32 h-20 rounded-lg object-cover border-4 border-white shadow-lg"
                          />
                          <button
                            onClick={() => coverPhotoInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg transition-colors"
                            aria-label="Change cover photo"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Cover Photo</h3>
                          <p className="text-gray-600">Upload a new cover photo</p>
                          <button
                            onClick={() => coverPhotoInputRef.current?.click()}
                            className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Change Cover Photo
                          </button>
                        </div>
                      </div>

                      {/* Profile Form */}
                      <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <input
                              type="text"
                              value={profileData.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              aria-label="First name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input
                              type="text"
                              value={profileData.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              aria-label="Last name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                          <input
                            type="text"
                            value={profileData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            aria-label="Username"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                          <textarea
                            value={profileData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            aria-label="Bio"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                            <input
                              type="text"
                              value={profileData.location}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              aria-label="Location"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                            <input
                              type="url"
                              value={profileData.website}
                              onChange={(e) => handleInputChange('website', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              aria-label="Website"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isUpdating}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                          >
                            {isUpdating ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {activeTab === 'account' && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('settings.account')}</h2>

                      {/* Message display */}
                      {message && (
                        <div className={cn(
                          'mb-6 p-4 rounded-lg',
                          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                        )}>
                          {message.text}
                        </div>
                      )}

                      <div className="space-y-8">
                        {/* Account Information */}
                        <div className="bg-muted p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                            <UserIcon className="w-5 h-5 mr-2" />
                            Account Information
                          </h3>
                          <form onSubmit={handleAccountUpdate} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                              <input
                                type="email"
                                value={accountData.email}
                                onChange={(e) => handleAccountInputChange('email', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                aria-label="Email address"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={isUpdating}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                            >
                              {isUpdating ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              <span>Update Account</span>
                            </button>
                          </form>
                        </div>

                        {/* Change Password */}
                        <div className="bg-muted p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                            <Key className="w-5 h-5 mr-2" />
                            Change Password
                          </h3>
                          <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                              <input
                                type="password"
                                value={accountData.currentPassword}
                                onChange={(e) => handleAccountInputChange('currentPassword', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                aria-label="Current password"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                              <input
                                type="password"
                                value={accountData.newPassword}
                                onChange={(e) => handleAccountInputChange('newPassword', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                aria-label="New password"
                                required
                                minLength={8}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                              <input
                                type="password"
                                value={accountData.confirmPassword}
                                onChange={(e) => handleAccountInputChange('confirmPassword', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                aria-label="Confirm new password"
                                required
                                minLength={8}
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={isUpdating}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                            >
                              {isUpdating ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Key className="w-4 h-4" />
                              )}
                              <span>Change Password</span>
                            </button>
                          </form>
                        </div>

                        {/* Connected Accounts */}
                        <div className="bg-muted p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                            <LinkIcon className="w-5 h-5 mr-2" />
                            Connected Accounts
                          </h3>
                          <p className="text-gray-600 mb-4">Connect your social accounts to sign in faster.</p>
                          <div className="space-y-4">
                            {/* Google */}
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">G</span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">Google</div>
                                  <div className="text-sm text-gray-600">
                                    {connectedAccounts.some(acc => acc.provider === 'google')
                                      ? 'Connected'
                                      : 'Not connected'}
                                  </div>
                                </div>
                              </div>
                              {connectedAccounts.some(acc => acc.provider === 'google') ? (
                                <button
                                  onClick={() => handleUnlinkAccount('google')}
                                  disabled={isUpdating}
                                  className="text-red-600 hover:text-red-800 disabled:text-gray-400 flex items-center space-x-2"
                                >
                                  <Unlink className="w-4 h-4" />
                                  <span>Unlink</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleLinkAccount('google')}
                                  disabled={isUpdating}
                                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                                >
                                  <LinkIcon className="w-4 h-4" />
                                  <span>Connect</span>
                                </button>
                              )}
                            </div>

                            {/* Facebook */}
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">F</span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">Facebook</div>
                                  <div className="text-sm text-gray-600">
                                    {connectedAccounts.some(acc => acc.provider === 'facebook')
                                      ? 'Connected'
                                      : 'Not connected'}
                                  </div>
                                </div>
                              </div>
                              {connectedAccounts.some(acc => acc.provider === 'facebook') ? (
                                <button
                                  onClick={() => handleUnlinkAccount('facebook')}
                                  disabled={isUpdating}
                                  className="text-red-600 hover:text-red-800 disabled:text-gray-400 flex items-center space-x-2"
                                >
                                  <Unlink className="w-4 h-4" />
                                  <span>Unlink</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleLinkAccount('facebook')}
                                  disabled={isUpdating}
                                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                                >
                                  <LinkIcon className="w-4 h-4" />
                                  <span>Connect</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Danger Zone
                          </h3>
                          <p className="text-red-800 mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                          </p>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={isUpdating}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                          >
                            {isUpdating ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            <span>Delete Account</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'privacy' && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('settings.privacy')}</h2>

                      {/* Message display */}
                      {message && (
                        <div className={cn(
                          'mb-6 p-4 rounded-lg',
                          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                        )}>
                          {message.text}
                        </div>
                      )}

                      <div className="space-y-6">
                        {/* Profile Visibility */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Eye className="w-5 h-5 mr-2" />
                            Profile Visibility
                          </h3>
                          <p className="text-gray-600 mb-4">Control who can see your profile and posts.</p>
                          <div className="space-y-3">
                            {[
                              { value: 'public', label: 'Public', description: 'Anyone can see your profile and posts' },
                              { value: 'friends', label: 'Friends Only', description: 'Only your friends can see your profile and posts' },
                              { value: 'private', label: 'Private', description: 'Only you can see your profile and posts' }
                            ].map((option) => (
                              <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name="profileVisibility"
                                  value={option.value}
                                  checked={privacy.profileVisibility === option.value}
                                  onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                                  className="mt-1 text-green-600 focus:ring-green-500"
                                />
                                <div>
                                  <div className="font-medium text-gray-900">{option.label}</div>
                                  <div className="text-sm text-gray-600">{option.description}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Message Requests */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <MessageSquare className="w-5 h-5 mr-2" />
                            Message Requests
                          </h3>
                          <p className="text-gray-600 mb-4">Control who can send you message requests.</p>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={privacy.messageRequests}
                              onChange={(e) => handlePrivacyChange('messageRequests', !privacy.messageRequests)}
                              className="text-green-600 focus:ring-green-500 rounded"
                            />
                            <div>
                              <div className="font-medium text-gray-900">Allow message requests from everyone</div>
                              <div className="text-sm text-gray-600">When disabled, only friends can send you messages</div>
                            </div>
                          </label>
                        </div>

                        {/* Online Status */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Globe className="w-5 h-5 mr-2" />
                            Online Status
                          </h3>
                          <p className="text-gray-600 mb-4">Control who can see when you&apos;re online.</p>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={privacy.showOnlineStatus}
                              onChange={(e) => handlePrivacyChange('showOnlineStatus', !privacy.showOnlineStatus)}
                              className="text-green-600 focus:ring-green-500 rounded"
                            />
                            <div>
                              <div className="font-medium text-gray-900">Show when you&apos;re online</div>
                              <div className="text-sm text-gray-600">Let others see when you&apos;re active on the platform</div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('settings.notifications')}</h2>

                      {/* Message display */}
                      {message && (
                        <div className={cn(
                          'mb-6 p-4 rounded-lg',
                          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                        )}>
                          {message.text}
                        </div>
                      )}

                      <div className="space-y-6">
                        {/* Email Notifications */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Mail className="w-5 h-5 mr-2" />
                            Email Notifications
                          </h3>
                          <p className="text-gray-600 mb-4">Receive notifications via email.</p>
                          <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer">
                              <div>
                                <div className="font-medium text-gray-900">Email notifications</div>
                                <div className="text-sm text-gray-600">Receive email updates about your account activity</div>
                              </div>
                              <input
                                type="checkbox"
                                checked={notifications.email}
                                onChange={(e) => handleNotificationChange('email', !notifications.email)}
                                className="text-green-600 focus:ring-green-500 rounded"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Push Notifications */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Bell className="w-5 h-5 mr-2" />
                            Push Notifications
                          </h3>
                          <p className="text-gray-600 mb-4">Receive push notifications in your browser.</p>
                          <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer">
                              <div>
                                <div className="font-medium text-gray-900">Push notifications</div>
                                <div className="text-sm text-gray-600">Get instant notifications about new messages and activities</div>
                              </div>
                              <input
                                type="checkbox"
                                checked={notifications.push}
                                onChange={(e) => handleNotificationChange('push', !notifications.push)}
                                className="text-green-600 focus:ring-green-500 rounded"
                              />
                            </label>
                          </div>
                        </div>

                        {/* SMS Notifications */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Smartphone className="w-5 h-5 mr-2" />
                            SMS Notifications
                          </h3>
                          <p className="text-gray-600 mb-4">Receive notifications via SMS.</p>
                          <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer">
                              <div>
                                <div className="font-medium text-gray-900">SMS notifications</div>
                                <div className="text-sm text-gray-600">Receive important updates via text message</div>
                              </div>
                              <input
                                type="checkbox"
                                checked={notifications.sms}
                                onChange={(e) => handleNotificationChange('sms', !notifications.sms)}
                                className="text-green-600 focus:ring-green-500 rounded"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'appearance' && (
                    <div>
                      <h2 className="text-2xl font-bold text-primary mb-6">{t('settings.appearance')}</h2>

                      <div className="space-y-6">
                        {/* Language */}
                        <div>
                          <label className="block text-sm font-semibold text-primary mb-2">
                            {t('settings.language')}
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {languages.map((lang) => (
                              <button
                                key={lang.code}
                                onClick={() => setLanguage(lang.code as any)}
                                className={cn(
                                  'flex items-center space-x-3 p-3 rounded-lg border-2 transition-all text-foreground',
                                  language === lang.code
                                    ? 'border-green-600 bg-green-50 text-black'
                                    : 'border-border hover:border-border/80 bg-card'
                                )}
                                aria-label={`Select ${lang.name} language`}
                              >
                                <span className="text-2xl">{lang.flag}</span>
                                <span className="font-medium">{lang.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Theme */}
                        <div>
                          <label className="block text-sm font-semibold text-primary mb-2">
                            Theme
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { id: 'light', name: t('settings.lightMode') || 'Light Mode', icon: '☀️' },
                              { id: 'dark', name: t('settings.darkMode') || 'Dark Mode', icon: '🌙' },
                            ].map((themeOption) => (
                              <button
                                key={themeOption.id}
                                onClick={() => setTheme(themeOption.id as any)}
                                className={cn(
                                  'flex items-center space-x-3 p-4 rounded-lg border-2 transition-all text-foreground',
                                  theme === themeOption.id
                                    ? 'border-green-600 bg-green-50 text-black'
                                    : 'border-border hover:border-border/80 bg-card'
                                )}
                                aria-label={`Select ${themeOption.name.toLowerCase()} theme`}
                              >
                                <span className="text-2xl">{themeOption.icon}</span>
                                <span className="font-medium">{themeOption.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('settings.security')}</h2>

                      {/* Message display */}
                      {message && (
                        <div className={cn(
                          'mb-6 p-4 rounded-lg',
                          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                        )}>
                          {message.text}
                        </div>
                      )}

                      <div className="space-y-6">
                        {/* Two-Factor Authentication */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2" />
                            Two-Factor Authentication
                          </h3>
                          <p className="text-gray-600 mb-4">Add an extra layer of security to your account.</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">Enable 2FA</div>
                              <div className="text-sm text-gray-600">Secure your account with two-factor authentication</div>
                            </div>
                            <button
                              onClick={() => setMessage({ type: 'success', text: '2FA setup will be available soon' })}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              Setup 2FA
                            </button>
                          </div>
                        </div>

                        {/* Login Alerts */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Bell className="w-5 h-5 mr-2" />
                            Login Alerts
                          </h3>
                          <p className="text-gray-600 mb-4">Get notified when your account is accessed from a new device.</p>
                          <label className="flex items-center justify-between cursor-pointer">
                            <div>
                              <div className="font-medium text-gray-900">Login alerts</div>
                              <div className="text-sm text-gray-600">Receive notifications for new login attempts</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={securityData.loginAlerts}
                              onChange={(e) => setSecurityData(prev => ({ ...prev, loginAlerts: !prev.loginAlerts }))}
                              className="text-green-600 focus:ring-green-500 rounded"
                            />
                          </label>
                        </div>

                        {/* Session Management */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Lock className="w-5 h-5 mr-2" />
                            Session Management
                          </h3>
                          <p className="text-gray-600 mb-4">Control how long your sessions remain active.</p>
                          <div className="space-y-3">
                            <label className="block">
                              <span className="text-sm font-medium text-gray-700">Session timeout (days)</span>
                              <select
                                value={securityData.sessionTimeout}
                                onChange={(e) => setSecurityData(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                              >
                                <option value="7">7 days</option>
                                <option value="30">30 days</option>
                                <option value="90">90 days</option>
                                <option value="365">1 year</option>
                              </select>
                            </label>
                          </div>
                        </div>

                        {/* Active Sessions */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Globe className="w-5 h-5 mr-2" />
                            Active Sessions
                          </h3>
                          <p className="text-gray-600 mb-4">Manage your active sessions across devices.</p>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">Current Session</div>
                                <div className="text-sm text-gray-600">Chrome on Windows • Active now</div>
                              </div>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Current</span>
                            </div>
                            <button
                              onClick={() => setMessage({ type: 'success', text: 'Session management will be available soon' })}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              View all sessions
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'pages' && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pages</h2>

                      {/* Message display */}
                      {message && (
                        <div className={cn(
                          'mb-6 p-4 rounded-lg',
                          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                        )}>
                          {message.text}
                        </div>
                      )}

                      {/* Create Page Form */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Page</h3>
                        <form onSubmit={handlePageCreation} className="space-y-4">
                          <div>
                            <label htmlFor="page-name" className="block text-sm font-medium text-gray-700 mb-2">
                              Page Name *
                            </label>
                            <input
                              id="page-name"
                              name="pageName"
                              type="text"
                              value={pageData.name}
                              onChange={(e) => setPageData(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="Enter page name"
                              required
                            />
                          </div>

                          <div>
                            <label htmlFor="page-description" className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            <textarea
                              id="page-description"
                              name="description"
                              value={pageData.description}
                              onChange={(e) => setPageData(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              rows={3}
                              placeholder="Describe your page"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="page-category" className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                              </label>
                              <select
                                id="page-category"
                                name="category"
                                value={pageData.category}
                                onChange={(e) => setPageData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              >
                                <option value="">Select category</option>
                                <option value="business">Business</option>
                                <option value="brand">Brand</option>
                                <option value="organization">Organization</option>
                                <option value="community">Community</option>
                                <option value="entertainment">Entertainment</option>
                                <option value="other">Other</option>
                              </select>
                            </div>

                            <div>
                              <label htmlFor="page-website" className="block text-sm font-medium text-gray-700 mb-2">
                                Website
                              </label>
                              <input
                                id="page-website"
                                name="website"
                                type="url"
                                value={pageData.website}
                                onChange={(e) => setPageData(prev => ({ ...prev, website: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="https://example.com"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={isUpdating || !pageData.name.trim()}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                            >
                              {isUpdating ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                              <span>Create Page</span>
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* My Pages */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Pages</h3>
                        <p className="text-gray-600 mb-4">Manage your existing pages</p>
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No pages created yet</p>
                          <p className="text-sm text-gray-400 mt-1">Create your first page above</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'about' && (
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-6">{t('settings.about')}</h2>

                      <div className="space-y-6">
                        <div className="p-4 bg-muted border border-border rounded-lg">
                          <h3 className="text-lg font-semibold text-foreground mb-2">About i-fandray</h3>
                          <p className="text-muted-foreground mb-4">
                            i-fandray is a modern social networking platform designed to connect people and share moments.
                          </p>
                          <div className="text-sm text-muted-foreground">
                            <p>Version: 1.0.0</p>
                            <p>© 2025 i-fandray. All rights reserved.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}