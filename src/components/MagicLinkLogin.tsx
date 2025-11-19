import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Mail, Check, AlertCircle, Sparkles } from 'lucide-react';
import { BrutalButton, BrutalAlert } from './BrutalUI';

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
      console.log('[MagicLink] Auth event:', event, 'Session:', session ? 'exists' : 'null');
      
      if (event === 'SIGNED_IN' && session) {
        console.log('[MagicLink] User signed in via magic link:', session.user.email);
        setLoading(true);  // Show loading state during verification
        
        // Clean up the URL hash AFTER successful sign in
        if (window.location.hash) {
          console.log('[MagicLink] Cleaning up URL hash');
          window.history.replaceState(null, '', window.location.pathname);
        }
        
        // Verify user exists in our system and get their full profile
        try {
          console.log('[MagicLink] Verifying user in system...');
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
          console.log('[MagicLink] Verification response:', { ok: response.ok, status: response.status, data });

          if (!response.ok) {
            throw new Error(data.error || 'User not found in system');
          }

          console.log('[MagicLink] User verified successfully, calling onLogin...');
          // Use Supabase session access token
          onLogin(session.access_token, data.user);
        } catch (err: any) {
          console.error('[MagicLink] Error verifying user:', err);
          setError(err.message || 'Failed to verify user');
          setLoading(false);
          // Sign out the user since they're not in our system
          await supabase.auth.signOut();
        }
      }
    });

    // Check for existing session on mount (for when user clicks magic link and comes back)
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('[MagicLink] Existing session found on mount, verifying user...');
        
        // Clean up hash if present
        if (window.location.hash) {
          console.log('[MagicLink] Cleaning up URL hash from existing session');
          window.history.replaceState(null, '', window.location.pathname);
        }
        
        // Verify and log in
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

          console.log('[MagicLink] User verified from existing session, logging in...');
          onLogin(session.access_token, data.user);
        } catch (err: any) {
          console.error('[MagicLink] Error verifying existing session:', err);
          setError(err.message || 'Failed to verify user');
          await supabase.auth.signOut();
        }
      }
    };
    
    checkExistingSession();

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

      if (!checkResponse.ok || !checkData.exists) {
        throw new Error('This email is not registered. Please contact an administrator.');
      }

      // Only proceed with magic link if user exists
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (magicLinkError) {
        throw magicLinkError;
      }

      setMagicLinkSent(true);
    } catch (err: any) {
      console.error('Magic link error:', err);
      setError(err.message || 'Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="bg-white border-4 border-black p-8 brutal-shadow -rotate-1">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-400 border-4 border-black mb-4 brutal-shadow-sm rotate-6">
            <Check className="w-8 h-8 text-black" strokeWidth={3} />
          </div>
          
          <h2 className="text-2xl text-black font-black uppercase mb-4">Check Your Email!</h2>
          
          <div className="bg-cyan-300 border-4 border-black p-4 brutal-shadow-sm mb-6 rotate-1">
            <p className="text-black font-bold text-sm">
              We sent a magic link to:
            </p>
            <p className="text-black font-black text-base mt-1">
              {email}
            </p>
          </div>
          
          <div className="space-y-4 text-left mb-6">
            {/* Post-it Note 1 */}
            <div className="relative bg-yellow-300 border-3 border-black p-4 brutal-shadow-sm rotate-1">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-400 border-2 border-black flex items-center justify-center flex-shrink-0 rotate-12 font-black text-sm">
                  1
                </div>
                <p className="text-black font-bold text-sm mt-1">
                  Check your inbox for an email from Mosaic Magazine
                </p>
              </div>
              {/* Doodle: Envelope icon sketch */}
              <svg className="absolute bottom-2 right-2 opacity-40" width="24" height="20" viewBox="0 0 24 20" fill="none">
                <path d="M2 3 L12 10 L22 3 M2 3 L2 17 L22 17 L22 3 Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Post-it Note 2 */}
            <div className="relative bg-yellow-300 border-3 border-black p-4 brutal-shadow-sm -rotate-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-400 border-2 border-black flex items-center justify-center flex-shrink-0 -rotate-12 font-black text-sm">
                  2
                </div>
                <p className="text-black font-bold text-sm mt-1">
                  Click the magic link in the email
                </p>
              </div>
              {/* Doodle: Cursor/pointer sketch */}
              <svg className="absolute bottom-2 right-2 opacity-40" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 3 L3 17 L8 13 L11 19 L13 18 L10 12 L17 12 Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {/* Arrow pointing */}
              <svg className="absolute top-1 right-8 opacity-30" width="30" height="20" viewBox="0 0 30 20">
                <path d="M2 10 Q 10 5 18 10 L 18 10 L 15 7 M 18 10 L 15 13" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Post-it Note 3 */}
            <div className="relative bg-yellow-300 border-3 border-black p-4 brutal-shadow-sm rotate-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-400 border-2 border-black flex items-center justify-center flex-shrink-0 rotate-6 font-black text-sm">
                  3
                </div>
                <p className="text-black font-bold text-sm mt-1">
                  You'll be automatically logged in!
                </p>
              </div>
              {/* Doodle: Celebration stars */}
              <svg className="absolute bottom-2 right-2 opacity-40" width="28" height="24" viewBox="0 0 28 24" fill="none">
                <path d="M8 12 L9 14 L11 15 L9 16 L8 18 L7 16 L5 15 L7 14 Z" fill="black"/>
                <path d="M18 6 L19 8 L21 9 L19 10 L18 12 L17 10 L15 9 L17 8 Z" fill="black"/>
                <path d="M20 16 L20.5 17 L21.5 17.5 L20.5 18 L20 19 L19.5 18 L18.5 17.5 L19.5 17 Z" fill="black"/>
              </svg>
              {/* Checkmark doodle */}
              <svg className="absolute top-2 right-3 opacity-30" width="20" height="20" viewBox="0 0 20 20">
                <path d="M3 10 L8 15 L17 3" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {/* Underline scribble */}
              <svg className="absolute bottom-6 left-12 opacity-20" width="120" height="8" viewBox="0 0 120 8">
                <path d="M2 4 Q 30 2 60 4 T 118 4" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <BrutalButton 
            onClick={() => {
              setMagicLinkSent(false);
              setEmail('');
            }}
            variant="secondary"
          >
            Send to Different Email
          </BrutalButton>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-4 border-black p-8 brutal-shadow -rotate-1">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-400 border-4 border-black mb-4 brutal-shadow-sm rotate-6">
          <Sparkles className="w-8 h-8 text-black" strokeWidth={3} />
        </div>
        <h2 className="text-3xl text-black font-black uppercase mb-2">Reader Login</h2>
        <div className="inline-block bg-cyan-300 px-3 py-1 border-3 border-black">
          <p className="text-black text-xs font-black uppercase tracking-wider">Students & Teachers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <BrutalAlert type="error" icon={AlertCircle} rotate={1}>
            <p className="text-sm">{error}</p>
          </BrutalAlert>
        )}

        <div className="bg-yellow-300 border-4 border-black p-4 brutal-shadow-sm -rotate-1 mb-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-black flex-shrink-0 mt-0.5" strokeWidth={3} />
            <div>
              <p className="text-black font-black text-xs uppercase mb-1">No Password Needed!</p>
              <p className="text-black font-bold text-xs">
                Enter your email and we'll send you a magic link to login instantly.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="magic-email" className="block text-sm mb-2 text-black font-black uppercase tracking-wide">
            Email Address
          </label>
          <input
            id="magic-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white border-4 border-black text-black font-bold brutal-shadow focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all"
            placeholder="student@nycstudents.net"
          />
        </div>

        <BrutalButton
          type="submit"
          disabled={loading}
          variant="secondary"
          icon={Mail}
          className="w-full"
        >
          {loading ? 'Sending...' : 'Send Magic Link'}
        </BrutalButton>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-700 text-xs font-bold">
          First time? Contact your teacher or an administrator to get registered.
        </p>
      </div>
    </div>
  );
}