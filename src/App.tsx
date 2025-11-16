import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Login } from './components/Login';
import { MagicLinkLogin } from './components/MagicLinkLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { EditorDashboard } from './components/EditorDashboard';
import { ReaderDashboard } from './components/ReaderDashboard';
import { InitialSetup } from './components/InitialSetup';
import { PasswordExpiryModal } from './components/PasswordExpiryModal';
import { LogoShowcase, StackedTilesLogo } from './components/logos/MosaicLogos';
import { MagazineCard, holidayIssue } from './components/MagazineCard';
import DesignMockupSelector from './components/DesignMockupSelector';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string>('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showBackdoor, setShowBackdoor] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [showPasswordExpiry, setShowPasswordExpiry] = useState(false);
  const [passwordExpiryData, setPasswordExpiryData] = useState<{ daysRemaining: number; isExpired: boolean } | null>(null);
  const [showLogos, setShowLogos] = useState(false);
  const [showMockups, setShowMockups] = useState(false);

  useEffect(() => {
    // Check if URL is for design mockups
    if (window.location.pathname === '/mockups' || window.location.hash === '#mockups') {
      setShowMockups(true);
      setLoading(false);
      return;
    }
    // Check if URL is for logo showcase
    if (window.location.pathname === '/logos' || window.location.hash === '#logos') {
      setShowLogos(true);
      setLoading(false);
      return;
    }
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      // Check if initial setup is needed
      const setupResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/setup-status`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      const setupData = await setupResponse.json();
      
      if (setupData.needsInitialSetup) {
        setNeedsSetup(true);
        setLoading(false);
        return;
      }

      // Check for existing session
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        const userData = JSON.parse(savedUser);
        
        // Validate the session by making a test request
        try {
          console.log('[App] Validating existing session for user:', userData.email);
          const validationResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/validate-token`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          
          if (validationResponse.ok) {
            const validationData = await validationResponse.json();
            if (validationData.valid) {
              console.log('[App] Session is valid, restoring user');
              setAuthToken(token);
              setUser(userData);
              
              // Check password expiry for admin/editor users
              if (userData.role === 'admin' || userData.role === 'editor') {
                await checkPasswordExpiry(token);
              }
            } else {
              console.warn('[App] Session validation returned invalid, clearing local storage');
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
            }
          } else {
            console.warn('[App] Session validation failed, clearing local storage');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        } catch (err) {
          console.error('[App] Error validating session:', err);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (token: string, userData: any) => {
    setAuthToken(token);
    setUser(userData);
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));

    // Check password expiry for admin/editor users
    if (userData.role === 'admin' || userData.role === 'editor') {
      await checkPasswordExpiry(token);
    }
  };

  const checkPasswordExpiry = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/check-password-expiry`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Show modal if expired or expiring within 14 days
        if (data.isExpired || data.daysRemaining <= 14) {
          setPasswordExpiryData({
            daysRemaining: data.daysRemaining,
            isExpired: data.isExpired
          });
          setShowPasswordExpiry(true);
        }
      }
    } catch (error) {
      console.error('Error checking password expiry:', error);
    }
  };

  const handleLogout = () => {
    setAuthToken('');
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    
    if (newCount >= 5 && !showBackdoor) {
      setShowBackdoor(true);
      setJustUnlocked(true);
      // Hide the unlock message after 3 seconds
      setTimeout(() => setJustUnlocked(false), 3000);
      // Reset counter after revealing
      setTimeout(() => setLogoClickCount(0), 1000);
    }
    
    // Reset counter if user stops clicking for 2 seconds
    setTimeout(() => {
      if (logoClickCount === newCount) {
        setLogoClickCount(0);
      }
    }, 2000);
  };

  // Design mockups mode
  if (showMockups) {
    return (
      <div>
        <DesignMockupSelector />
        <div className="fixed top-4 left-4 z-[100]">
          <button
            onClick={() => {
              setShowMockups(false);
              window.history.pushState({}, '', '/');
              checkSetupStatus();
            }}
            className="bg-black text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            ← Back to App
          </button>
        </div>
      </div>
    );
  }

  // Logo showcase mode
  if (showLogos) {
    return (
      <div>
        <LogoShowcase />
        <div className="fixed top-4 right-4">
          <button
            onClick={() => {
              setShowLogos(false);
              window.history.pushState({}, '', '/');
              checkSetupStatus();
            }}
            className="bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            ← Back to App
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Mosaic Magazine HI...</p>
        </div>
      </div>
    );
  }

  if (needsSetup) {
    return <InitialSetup onComplete={() => {
      setNeedsSetup(false);
      checkSetupStatus();
    }} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full blur-3xl"></div>
        </div>

        {/* Magazine Card on left side */}
        <MagazineCard
          position="left"
          {...holidayIssue}
        />

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              {/* Logo */}
              <div className="flex justify-center mb-6" onClick={handleLogoClick}>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-2xl cursor-pointer hover:scale-105 transition-transform">
                  <StackedTilesLogo size={80} className="cursor-pointer" />
                </div>
              </div>
              
              {/* Title with gradient */}
              <h1 
                onClick={handleLogoClick}
                className="text-6xl mb-3 select-none cursor-pointer tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '800',
                  filter: 'drop-shadow(0 4px 20px rgba(139, 92, 246, 0.5))',
                }}
              >
                Mosaic Magazine
              </h1>
              <p className="text-gray-300 text-sm tracking-wider uppercase mb-1">Celebrating Student Creativity</p>
              <p className="text-gray-400 text-xs">Student & Teacher Publishing Platform</p>
              
              {/* Unlock notification - only shows after 5 clicks */}
              {justUnlocked && (
                <div className="mt-4 animate-fade-in">
                  <p className="text-sm text-emerald-300 bg-emerald-500/20 px-4 py-2 rounded-full inline-block border border-emerald-500/50">
                    🔓 Admin access unlocked
                  </p>
                </div>
              )}
            </div>

            {/* Login Forms */}
            {showAdminLogin ? (
              <div>
                <Login onLogin={handleLogin} />
                <button
                  onClick={() => setShowAdminLogin(false)}
                  className="mt-6 w-full text-center text-gray-300 hover:text-white transition-colors text-sm"
                >
                  ← Back to Reader Login
                </button>
              </div>
            ) : (
              <div>
                <MagicLinkLogin onLogin={handleLogin} />
                
                {/* Hidden backdoor - only visible after 5 clicks */}
                {showBackdoor && (
                  <button
                    onClick={() => setShowAdminLogin(true)}
                    className="mt-6 w-full text-center text-gray-400 hover:text-gray-300 text-sm animate-fade-in transition-colors"
                  >
                    Admin/Editor Login →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer branding */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-gray-500 text-xs">NYC Home Instruction Schools</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user.role === 'admin' && (
        <AdminDashboard user={user} authToken={authToken} onLogout={handleLogout} />
      )}
      {user.role === 'editor' && (
        <EditorDashboard user={user} authToken={authToken} onLogout={handleLogout} />
      )}
      {(user.role === 'student' || user.role === 'teacher' || user.role === 'guardian') && (
        <ReaderDashboard user={user} authToken={authToken} onLogout={handleLogout} />
      )}

      {/* Password Expiry Modal */}
      {showPasswordExpiry && passwordExpiryData && (
        <PasswordExpiryModal
          accessToken={authToken}
          daysRemaining={passwordExpiryData.daysRemaining}
          isExpired={passwordExpiryData.isExpired}
          onPasswordChanged={() => {
            setShowPasswordExpiry(false);
            setPasswordExpiryData(null);
          }}
          onDismiss={passwordExpiryData.isExpired ? undefined : () => {
            setShowPasswordExpiry(false);
          }}
        />
      )}
    </div>
  );
}
