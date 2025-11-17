import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Shield, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { validatePassword, getPasswordStrength } from '../utils/passwordValidation';

export function InitialSetup({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [adminData, setAdminData] = useState({
    email: '',
    fullName: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validation = validatePassword(adminData.password);
  const strength = getPasswordStrength(adminData.password);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validation.isValid) {
      setError('Password does not meet requirements');
      return;
    }

    if (adminData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Create admin user using initial setup endpoint (no auth required)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/initial-setup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email: adminData.email,
            fullName: adminData.fullName,
            password: adminData.password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to create admin user';
        const details = data.details ? `\n\nDetails: ${data.details}` : '';
        const hint = data.hint ? `\n\n${data.hint}` : '';
        throw new Error(errorMessage + details + hint);
      }

      // Success! Move to completion step
      setStep(2);
    } catch (err: any) {
      console.error('Setup error:', err);
      setError(err.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl mb-2">Setup Complete! 🎉</h2>
            <p className="text-gray-600">Your admin account has been created</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg mb-3 text-green-900">Your Admin Credentials</h3>
            <div className="space-y-2 text-sm text-green-900">
              <p><strong>Email:</strong> {adminData.email}</p>
              <p><strong>Password:</strong> {adminData.password}</p>
            </div>
            <p className="text-xs text-green-700 mt-4">
              ⚠️ Please save these credentials in a safe place. You'll need them to login.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg mb-3 text-blue-900">What's Next?</h3>
            <ul className="space-y-2 text-sm text-blue-900">
              <li>✅ Your admin account is ready to use</li>
              <li>✅ Both database and authentication are configured</li>
              <li>✅ You can now login and start adding users</li>
            </ul>
          </div>

          <button
            onClick={onComplete}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-3xl mb-2">Initial Setup</h2>
          <p className="text-gray-600">Create your first administrator account</p>
        </div>

        <form onSubmit={handleCreateAdmin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm mb-2 text-gray-700">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={adminData.fullName}
              onChange={(e) => setAdminData({ ...adminData, fullName: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={adminData.email}
              onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="admin@schools.nyc.gov"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-2 text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={adminData.password}
                onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                required
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {adminData.password && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        strength.strength === 'strong' ? 'bg-green-500' :
                        strength.strength === 'medium' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(strength.score / 10) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs ${
                    strength.strength === 'strong' ? 'text-green-600' :
                    strength.strength === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {strength.strength === 'strong' ? 'Strong' :
                     strength.strength === 'medium' ? 'Medium' : 'Weak'}
                  </span>
                </div>

                {validation.errors.length > 0 && (
                  <ul className="text-xs text-red-600 space-y-1">
                    {validation.errors.map((err, idx) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm mb-2 text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                required
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && adminData.password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800 mb-1">
              <strong>Password Requirements:</strong>
            </p>
            <ul className="text-xs text-blue-700 space-y-0.5">
              <li>• At least 8 characters</li>
              <li>• One uppercase & one lowercase letter</li>
              <li>• One number & one special character</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || !validation.isValid || adminData.password !== confirmPassword}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
          </button>
        </form>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>What happens next?</strong> This will create your admin account and set up authentication. You'll be able to login immediately after setup completes.
          </p>
        </div>
      </div>
    </div>
  );
}

// Default export for lazy loading
export default InitialSetup;
