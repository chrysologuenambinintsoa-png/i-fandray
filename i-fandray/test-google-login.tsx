import { signIn } from 'next-auth/react';

export default function TestGoogleLogin() {
  const handleGoogleLogin = async () => {
    try {
      console.log('Testing Google login...');
      const result = await signIn('google', {
        callbackUrl: '/feed',
        redirect: false, // Don't redirect, just test
      });
      console.log('SignIn result:', result);
    } catch (error) {
      console.error('Google login test failed:', error);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleGoogleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test Google Login
      </button>
    </div>
  );
}