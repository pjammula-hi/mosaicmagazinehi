import { useState, lazy, Suspense } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { LogIn, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { BrutalButton, BrutalInput, BrutalAlert } from './BrutalUI';

// Lazy load ForgotPassword to avoid initialization errors
const ForgotPassword = lazy(() => import('./ForgotPassword'));

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

// Version 1.0.4 - Fixed validation crash with lazy loading
export function Login({ onLogin }: LoginProps) {
  console.log('%c🔐 Login component v1.0.4 RENDERING', 'color: green; font-weight: bold; font-size: 14px;');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [passwordExpired, setPasswordExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Login failed';
        const hint = data.hint ? `\n\n${data.hint}` : '';
        throw new Error(errorMessage + hint);
      }

      // Check if password is expired
      if (data.passwordExpired) {
        setPasswordExpired(true);
        setError('Your password has expired. Please contact an administrator or use the "Forgot Password" feature to reset it.');
        return;
      }

      // Warn if password will expire soon
      if (data.daysRemaining !== undefined && data.daysRemaining <= 14) {
        setDaysRemaining(data.daysRemaining);
      }

      onLogin(data.accessToken, data.user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <Suspense fallback={<div className="bg-white border-4 border-black p-8 brutal-shadow">Loading...</div>}>
        <ForgotPassword onBack={() => setShowForgotPassword(false)} />
      </Suspense>
    );
  }

  return (
    <div className="bg-white border-4 border-black p-8 brutal-shadow rotate-1">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-400 border-4 border-black mb-4 brutal-shadow-sm -rotate-6">
          <Shield className="w-8 h-8 text-black" strokeWidth={3} />
        </div>
        <h2 className="text-3xl text-black font-black uppercase mb-2">Staff Access</h2>
        <div className="inline-block bg-yellow-300 px-3 py-1 border-3 border-black">
          <p className="text-black text-xs font-black uppercase tracking-wider">Admin & Editor Portal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <BrutalAlert type="error" icon={AlertCircle} rotate={-1}>
            <p className="text-sm">{error}</p>
          </BrutalAlert>
        )}

        {daysRemaining !== null && daysRemaining > 0 && (
          <BrutalAlert type="warning" icon={AlertCircle} rotate={1}>
            <p className="text-sm">
              Your password will expire in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. 
              Please change it after logging in.
            </p>
          </BrutalAlert>
        )}

        <div>
          <label htmlFor="email" className="block text-sm mb-2 text-black font-black uppercase tracking-wide">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white border-4 border-black text-black font-bold brutal-shadow focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all"
            placeholder="admin@schools.nyc.gov"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm text-black font-black uppercase tracking-wide">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-black underline hover:no-underline font-bold transition-all"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              required
              className="w-full px-4 py-3 pr-12 bg-white border-4 border-black text-black font-bold brutal-shadow focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-gray-700 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={3} /> : <Eye className="w-5 h-5" strokeWidth={3} />}
            </button>
          </div>
        </div>

        <BrutalButton
          type="submit"
          disabled={loading}
          variant="primary"
          className="w-full"
        >
          {loading ? 'Logging in...' : 'Sign In'}
        </BrutalButton>
      </form>
    </div>
  );
}
