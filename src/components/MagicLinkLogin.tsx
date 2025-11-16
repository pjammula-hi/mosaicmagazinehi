import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Mail, Check, AlertCircle } from 'lucide-react';

interface MagicLinkLoginProps {
  onLogin: (token: string, user: any) => void;
}

// Create Supabase client for auth
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

export function MagicLinkLogin({ onLogin }: MagicLinkLoginProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    // Listen for auth state changes (when user clicks magic link in email)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[MagicLink] Auth event:', event);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('[MagicLink] User signed in via magic link:', session.user.email);
        
        // Verify user exists in our system and get their full profile
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/verify-magic-link-user`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify({ 
                email: session.user.email,
                supabaseUserId: session.user.id
              })
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'User not found in system');
          }

          // Use Supabase session access token
          onLogin(session.access_token, data.user);
        } catch (err: any) {
          console.error('[MagicLink] Error verifying user:', err);
          setError(err.message || 'Failed to verify user');
          // Sign out the user since they're not in our system
          await supabase.auth.signOut();
        }
      }
    });

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('[MagicLink] Existing session found');
        // Trigger the auth state change handler
        supabase.auth.onAuthStateChange((event, session) => {
          if (session && event === 'SIGNED_IN') {
            // Will be handled by the listener above
          }
        });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First check if user exists in our system
      const checkResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/check-user-exists`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email })
        }
      );

      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        throw new Error(checkData.error || 'User not found or inactive. Please contact your administrator.');
      }

      // User exists, send magic link via Supabase Auth
      // Use production URL if available, otherwise fall back to current origin
      const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: redirectUrl,
        }
      });

      if (signInError) {
        throw signInError;
      }

      setMagicLinkSent(true);
    } catch (err: any) {
      console.error('[MagicLink] Request error:', err);
      setError(err.message || 'Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8 border border-white/20">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <Check className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-3xl text-white text-center mb-4">Check Your Email</h2>
        <p className="text-gray-300 text-center mb-6">
          We've sent a magic link to <span className="font-semibold text-white">{email}</span>.
          Click the link in your email to access Mosaic Magazine.
        </p>

        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-200 text-center">
            <strong className="text-green-100">✓ Magic link sent successfully!</strong>
            <br />
            Please check your inbox and spam folder.
          </p>
        </div>

        <button
          onClick={() => {
            setMagicLinkSent(false);
            setEmail('');
          }}
          className="w-full text-purple-300 hover:text-purple-200 text-sm transition-colors"
        >
          ← Send another link
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8 border border-white/20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4 shadow-lg">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl text-white mb-2">Reader Access</h2>
        <p className="text-gray-300 text-sm">Students, Teachers & Guardians</p>
      </div>

      <p className="text-gray-300 text-center mb-6">
        Enter your registered email to receive a magic link
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm mb-2 text-gray-200 font-medium">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all"
            placeholder="student@nycstudents.net"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-medium"
        >
          {loading ? 'Sending...' : 'Send Magic Link'}
        </button>
      </form>
    </div>
  );
}
