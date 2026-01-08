"use client";

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import Link from 'next/link';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showResetMessage, setShowResetMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for registered parameter
    if (searchParams.get('registered') === 'true') {
      setShowWelcomeMessage(true);
    }
    // Check for reset parameter
    if (searchParams.get('reset') === 'success') {
      setShowResetMessage(true);
    }
  }, [searchParams]);

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setError(null);
      setIsLoading(true);
      await signOut({ redirect: false });
      await new Promise((r) => setTimeout(r, 500));
      const result = await signIn(provider as any, { callbackUrl: '/feed', redirect: false });
      if (result?.url) window.location.href = result.url;
      else {
        // Wait for session to be established
        await new Promise(resolve => setTimeout(resolve, 800));
        window.location.href = '/feed';
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Social login error';
      console.error('Social login error', e);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Validate input
      if (!formData.email || !formData.password) {
        throw new Error('Please enter your email and password');
      }

      console.log('[Login] Attempting login with email:', formData.email);
      
      const result = await signIn('credentials', { 
        email: formData.email, 
        password: formData.password, 
        redirect: false 
      });

      console.log('[Login] SignIn result:', result);

      if (result?.error) {
        console.error('[Login] Error from signIn:', result.error);
        throw new Error(result.error as string);
      }

      if (result?.ok) {
        console.log('[Login] Login successful');
        
        // Wait for session to be established - longer timeout for session propagation
        // With JWT strategy, this should be faster
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log('[Login] Redirecting to feed...');
        // Redirect to feed directly with a full page navigation to ensure session is loaded
        window.location.href = '/feed';
      } else {
        throw new Error('Login failed. Please try again.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      console.error('[Login] Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-900 flex flex-col p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-green-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-40 left-1/2 w-60 h-60 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-green-400 to-teal-400 rounded-full blur-2xl opacity-30 animate-pulse" />
              <img src="/logo.svg" alt="i-fandray Logo" className="w-20 h-20 relative z-10 animate-bounce" />
            </div>
            <h1 className="text-5xl font-extrabold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-green-300 to-teal-300 animate-pulse">i-fandray</h1>
            <p className="text-blue-100 text-lg">Connect with friends and the world</p>
            <Link href="/about" className="inline-block mt-3 text-blue-200 hover:text-white transition-colors duration-300 text-sm underline decoration-blue-300 hover:decoration-white">Learn more about i-fandray →</Link>
          </div>

          {showWelcomeMessage && (
            <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">Compte créé avec succès !</p>
              </div>
              <p className="text-green-700 text-sm mt-1">Découvrez notre guide de bienvenue pour commencer à explorer i-fandray.</p>
              <Link href="/welcome" className="inline-block mt-2 text-green-600 hover:text-green-700 font-medium text-sm underline">→ Voir le guide de bienvenue</Link>
            </div>
          )}

          {showResetMessage && (
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <p className="text-blue-800 font-medium">Password reset successful!</p>
              </div>
              <p className="text-blue-700 text-sm mt-1">You can now sign in with your new password.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-green-500/5 to-teal-500/5" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 text-white placeholder-white/60 transition-all duration-300 backdrop-blur-sm" required />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white/20 text-white placeholder-white/60 transition-all duration-300 backdrop-blur-sm" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-300">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link href="/auth/forgot-password" className="text-sm text-green-600 hover:text-green-700">Forgot Password?</Link>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 via-green-500 to-teal-500 hover:from-blue-600 hover:via-green-600 hover:to-teal-600 text-white py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg">
                  {isLoading ? (<span className="flex items-center justify-center"><svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /></svg>Signing in...</span>) : 'Sign In'}
                </button>
              </form>

              <div className="my-8 flex items-center">
                <div className="flex-1 border-t border-white/30" />
                <span className="px-4 text-sm text-white/70">or continue with</span>
                <div className="flex-1 border-t border-white/30" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleSocialLogin('google')} className="flex items-center justify-center px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg" aria-label="Login with Google">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>
                <button onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg" aria-label="Login with Facebook">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </button>
              </div>

              <p className="mt-8 text-center text-white/80">Don&apos;t have an account? <Link href="/auth/register" className="text-blue-300 hover:text-white transition-colors duration-300 font-semibold underline decoration-blue-300 hover:decoration-white">Sign up</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}