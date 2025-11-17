/**
 * Mosaic Magazine HI - Main Application
 * Version: 1.1.0 - Security Hardened
 * Build Date: 2025-11-17
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Login } from './components/Login';
import { MagicLinkLogin } from './components/MagicLinkLogin';
import { ReaderDashboard } from './components/ReaderDashboard';
import { LogoShowcase, StackedTilesLogo } from './components/logos/MosaicLogos';
import { MagazineCard, holidayIssue } from './components/MagazineCard';

// Lazy load components that use password validation or have complex dependencies to prevent early initialization errors
const InitialSetup = lazy(() => import('./components/InitialSetup').then(m => ({ default: m.InitialSetup })));
const PasswordExpiryModal = lazy(() => import('./components/PasswordExpiryModal').then(m => ({ default: m.PasswordExpiryModal })));
const AdminDashboard = lazy(() => {
  console.log('🔄 [LAZY] Loading AdminDashboard module...');
  return import('./components/AdminDashboard').then(m => {
    console.log('✅ [LAZY] AdminDashboard loaded successfully');
    return { default: m.AdminDashboard };
  });
});
const EditorDashboard = lazy(() => {
  console.log('🔄 [LAZY] Loading EditorDashboard module...');
  return import('./components/EditorDashboard').then(m => {
    console.log('✅ [LAZY] EditorDashboard loaded successfully');
    return { default: m.EditorDashboard };
  });
});

export default function App() {
  // BUILD VERSION: 1.1.1 - Complete trash handler fix (all state setters)
  if (process.env.NODE_ENV === 'development') {
    console.log('%c🚀 Mosaic Magazine App v1.1.1', 'color: blue; font-weight: bold; font-size: 16px;');
    console.log('Build timestamp:', new Date().toISOString());
  }
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string>('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [showPasswordExpiry, setShowPasswordExpiry] = useState(false);
  const [passwordExpiryData, setPasswordExpiryData] = useState<{ daysRemaining: number; isExpired: boolean } | null>(null);
  const [showLogos, setShowLogos] = useState(false);

  // Set browser tab title
  useEffect(() => {
    document.title = 'Mosaic Magazine HI';
  }, []);

  useEffect(() => {
    const handlePathChange = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[App] Path/Hash changed - pathname:', pathname, 'hash:', hash);
      }
      
      // Alternative access route (obfuscated)
      const r = 'home'.split('').reverse().join('');
      if (pathname === `/${r}` || pathname.endsWith(`/${r}`) || hash === `#${r}`) {
        setShowAdminLogin(true);
        setLoading(false);
        return;
      }
      
      // Check if URL is for logo showcase
      if (pathname === '/logos' || pathname.endsWith('/logos') || hash === '#logos') {
        if (process.env.NODE_ENV === 'development') {
          console.log('[App] Showing logos');
        }
        setShowLogos(true);
        setLoading(false);
        return;
      }
      
      // Reset special views if hash is cleared and not on special path
      if ((!hash || hash === '#' || hash === '') && 
          !pathname.endsWith('/emoh') && 
          !pathname.endsWith('/logos')) {
        console.log('[App] Clearing special views');
        setShowLogos(false);
        setShowAdminLogin(false);
      }
    };

    // Check on initial load
    console.log('[App] Initial load - pathname:', window.location.pathname, 'hash:', window.location.hash);
    console.log('[App] Full URL:', window.location.href);
    handlePathChange();
    
    // If not showing special views, check setup status
    const pathname = window.location.pathname;
    const hash = window.location.hash;
    if (!pathname.endsWith('/emoh') && !pathname.endsWith('/logos') && hash !== '#emoh' && hash !== '#logos') {
      checkSetupStatus();
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handlePathChange);
    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handlePathChange);
    
    return () => {
      window.removeEventListener('hashchange', handlePathChange);
      window.removeEventListener('popstate', handlePathChange);
    };
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
      const tokenExpiry = localStorage.getItem('tokenExpiry');
      const savedUser = localStorage.getItem('user');
      
      // Check if token is expired
      if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[App] Token expired, clearing session');
        }
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }
      
      if (token && savedUser) {
        const userData = JSON.parse(savedUser);
        
        // Validate the session by making a test request
        try {
          if (process.env.NODE_ENV === 'development') {
            console.log('[App] Validating existing session for user:', userData.email);
          }
          const validationResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/validate-token`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          
          if (validationResponse.ok) {
            const validationData = await validationResponse.json();
            if (validationData.valid) {
              if (process.env.NODE_ENV === 'development') {
                console.log('[App] Session is valid, restoring user');
              }
              setAuthToken(token);
              setUser(userData);
              
              // Check password expiry for admin/editor users
              if (userData.role === 'admin' || userData.role === 'editor') {
                await checkPasswordExpiry(token);
              }
            } else {
              if (process.env.NODE_ENV === 'development') {
                console.warn('[App] Session validation returned invalid, clearing local storage');
              }
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
            }
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[App] Session validation failed, clearing local storage');
            }
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
    
    // Store with expiry timestamp (24 hours for better security)
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    localStorage.setItem('authToken', token);
    localStorage.setItem('tokenExpiry', expiryTime.toString());
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

  // Design mockups mode
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
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
          <div className="bg-white border-4 border-black p-8 brutal-shadow">
            <p className="text-black font-black">Loading setup...</p>
          </div>
        </div>
      }>
        <InitialSetup onComplete={() => {
          setNeedsSetup(false);
          checkSetupStatus();
        }} />
      </Suspense>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Neo-Brutalist Background Pattern with Children's Artwork */}
        <div className="absolute inset-0">
          {/* Yellow square with stick figure drawing */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400 border-4 border-black rotate-12 brutal-shadow overflow-hidden">
            <svg className="absolute inset-0 w-full h-full p-8" viewBox="0 0 200 200" style={{ opacity: 0.4 }}>
              {/* Stick figure family - child's drawing style */}
              {/* Sun in corner */}
              <circle cx="170" cy="30" r="15" fill="none" stroke="black" strokeWidth="3"/>
              <line x1="170" y1="15" x2="170" y2="5" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="185" y1="30" x2="195" y2="30" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="182" y1="18" x2="189" y2="11" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="182" y1="42" x2="189" y2="49" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
              
              {/* Tall figure (adult) */}
              <circle cx="50" cy="60" r="12" fill="none" stroke="black" strokeWidth="3"/>
              <line x1="50" y1="72" x2="50" y2="120" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              <line x1="50" y1="85" x2="30" y2="105" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              <line x1="50" y1="85" x2="70" y2="105" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              <line x1="50" y1="120" x2="35" y2="150" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              <line x1="50" y1="120" x2="65" y2="150" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              
              {/* Medium figure (child) */}
              <circle cx="100" cy="80" r="10" fill="none" stroke="black" strokeWidth="3"/>
              <line x1="100" y1="90" x2="100" y2="125" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              <line x1="100" y1="100" x2="85" y2="115" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              <line x1="100" y1="100" x2="115" y2="115" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              <line x1="100" y1="125" x2="88" y2="150" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              <line x1="100" y1="125" x2="112" y2="150" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              
              {/* Small figure (baby) */}
              <circle cx="140" cy="95" r="8" fill="none" stroke="black" strokeWidth="3"/>
              <line x1="140" y1="103" x2="140" y2="130" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              <line x1="140" y1="113" x2="130" y2="125" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              <line x1="140" y1="113" x2="150" y2="125" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              <line x1="140" y1="130" x2="133" y2="150" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              <line x1="140" y1="130" x2="147" y2="150" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              
              {/* Grass line at bottom */}
              <path d="M10 160 L30 165 L50 160 L70 165 L90 160 L110 165 L130 160 L150 165 L170 160 L190 165" 
                    stroke="black" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {/* Cyan square with watercolor painting style */}
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-400 border-4 border-black -rotate-12 brutal-shadow overflow-hidden">
            <svg className="absolute inset-0 w-full h-full p-6" viewBox="0 0 200 200">
              {/* Watercolor style blobs and shapes */}
              {/* Blue watercolor blob */}
              <ellipse cx="60" cy="50" rx="35" ry="30" fill="rgba(59, 130, 246, 0.3)" stroke="none"/>
              <ellipse cx="70" cy="55" rx="28" ry="25" fill="rgba(59, 130, 246, 0.2)" stroke="none"/>
              
              {/* Purple watercolor blob */}
              <ellipse cx="140" cy="70" rx="40" ry="35" fill="rgba(147, 51, 234, 0.25)" stroke="none"/>
              <ellipse cx="135" cy="75" rx="32" ry="28" fill="rgba(147, 51, 234, 0.15)" stroke="none"/>
              
              {/* Pink/red watercolor blob */}
              <ellipse cx="100" cy="130" rx="45" ry="40" fill="rgba(236, 72, 153, 0.3)" stroke="none"/>
              <ellipse cx="110" cy="135" rx="38" ry="33" fill="rgba(236, 72, 153, 0.2)" stroke="none"/>
              
              {/* Yellow watercolor blob */}
              <ellipse cx="50" cy="140" rx="30" ry="28" fill="rgba(250, 204, 21, 0.35)" stroke="none"/>
              <ellipse cx="55" cy="145" rx="24" ry="22" fill="rgba(250, 204, 21, 0.25)" stroke="none"/>
              
              {/* Green watercolor blob */}
              <ellipse cx="160" cy="140" rx="35" ry="32" fill="rgba(34, 197, 94, 0.3)" stroke="none"/>
              <ellipse cx="165" cy="145" rx="28" ry="26" fill="rgba(34, 197, 94, 0.2)" stroke="none"/>
              
              {/* Orange watercolor blob */}
              <ellipse cx="120" cy="40" rx="32" ry="28" fill="rgba(249, 115, 22, 0.3)" stroke="none"/>
              <ellipse cx="125" cy="45" rx="26" ry="23" fill="rgba(249, 115, 22, 0.2)" stroke="none"/>
              
              {/* Paint brush strokes */}
              <path d="M20 180 Q 50 175 80 180 T 140 180" stroke="rgba(0,0,0,0.15)" strokeWidth="8" fill="none" strokeLinecap="round"/>
              <path d="M170 30 Q 150 60 160 90" stroke="rgba(0,0,0,0.12)" strokeWidth="6" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          
          {/* Pink square with Pete the Cat book style */}
          <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-pink-400 border-4 border-black rotate-45 brutal-shadow overflow-hidden">
            <svg className="absolute inset-0 w-full h-full p-8" viewBox="0 0 150 150" style={{ opacity: 0.5 }}>
              {/* Pete the Cat inspired drawing - simple blue cat */}
              {/* Cat head */}
              <ellipse cx="75" cy="60" rx="28" ry="25" fill="none" stroke="black" strokeWidth="3"/>
              
              {/* Ears */}
              <path d="M50 50 L45 35 L55 45" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M100 50 L105 35 L95 45" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              
              {/* Eyes - big and round like Pete */}
              <circle cx="65" cy="58" r="6" fill="black"/>
              <circle cx="85" cy="58" r="6" fill="black"/>
              <circle cx="66" cy="56" r="2" fill="white"/>
              <circle cx="86" cy="56" r="2" fill="white"/>
              
              {/* Nose */}
              <path d="M75 65 L72 68 L75 70 L78 68 Z" fill="black"/>
              
              {/* Whiskers */}
              <line x1="50" y1="65" x2="35" y2="63" stroke="black" strokeWidth="2" strokeLinecap="round"/>
              <line x1="50" y1="70" x2="35" y2="72" stroke="black" strokeWidth="2" strokeLinecap="round"/>
              <line x1="100" y1="65" x2="115" y2="63" stroke="black" strokeWidth="2" strokeLinecap="round"/>
              <line x1="100" y1="70" x2="115" y2="72" stroke="black" strokeWidth="2" strokeLinecap="round"/>
              
              {/* Smile */}
              <path d="M68 72 Q 75 76 82 72" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
              
              {/* Body */}
              <ellipse cx="75" cy="100" rx="22" ry="28" fill="none" stroke="black" strokeWidth="3"/>
              
              {/* Legs - simple lines */}
              <line x1="60" y1="125" x2="55" y2="140" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              <line x1="70" y1="128" x2="68" y2="142" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              <line x1="80" y1="128" x2="82" y2="142" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              <line x1="90" y1="125" x2="95" y2="140" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              
              {/* Tail - curvy */}
              <path d="M95 95 Q 105 90 110 95 T 115 105" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              
              {/* Buttons on shirt */}
              <circle cx="75" cy="95" r="2" fill="black"/>
              <circle cx="75" cy="105" r="2" fill="black"/>
            </svg>
          </div>
          
          {/* Purple square with children's art */}
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-purple-400 border-4 border-black -rotate-6 brutal-shadow overflow-hidden">
            <svg className="absolute inset-0 w-full h-full p-8" viewBox="0 0 180 180" style={{ opacity: 0.35 }}>
              {/* House drawing - classic children's style */}
              {/* House body */}
              <rect x="50" y="80" width="80" height="70" fill="none" stroke="black" strokeWidth="3"/>
              
              {/* Roof */}
              <path d="M40 80 L90 40 L140 80" fill="none" stroke="black" strokeWidth="3" strokeLinejoin="round"/>
              
              {/* Door */}
              <rect x="80" y="115" width="20" height="35" fill="none" stroke="black" strokeWidth="2.5"/>
              <circle cx="95" cy="132" r="1.5" fill="black"/>
              
              {/* Windows */}
              <rect x="60" y="95" width="15" height="15" fill="none" stroke="black" strokeWidth="2.5"/>
              <line x1="67.5" y1="95" x2="67.5" y2="110" stroke="black" strokeWidth="2"/>
              <line x1="60" y1="102.5" x2="75" y2="102.5" stroke="black" strokeWidth="2"/>
              
              <rect x="105" y="95" width="15" height="15" fill="none" stroke="black" strokeWidth="2.5"/>
              <line x1="112.5" y1="95" x2="112.5" y2="110" stroke="black" strokeWidth="2"/>
              <line x1="105" y1="102.5" x2="120" y2="102.5" stroke="black" strokeWidth="2"/>
              
              {/* Chimney */}
              <rect x="110" y="50" width="12" height="25" fill="none" stroke="black" strokeWidth="2.5"/>
              
              {/* Smoke from chimney - curvy lines */}
              <path d="M116 45 Q 120 40 118 35" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round"/>
              <path d="M116 42 Q 112 37 114 32" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round"/>
              
              {/* Ground/grass */}
              <line x1="30" y1="150" x2="150" y2="150" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              
              {/* Flowers */}
              <circle cx="35" cy="145" r="4" fill="none" stroke="black" strokeWidth="2"/>
              <line x1="35" y1="149" x2="35" y2="155" stroke="black" strokeWidth="2"/>
              
              <circle cx="145" cy="145" r="4" fill="none" stroke="black" strokeWidth="2"/>
              <line x1="145" y1="149" x2="145" y2="155" stroke="black" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12 relative">
              {/* Decorative doodles around logo */}
              <svg className="absolute top-0 left-8 opacity-30" width="40" height="40" viewBox="0 0 40 40">
                <path d="M5 20 L15 10 L25 20 L35 10" stroke="black" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <svg className="absolute top-2 right-8 opacity-30" width="35" height="35" viewBox="0 0 35 35">
                <circle cx="17.5" cy="17.5" r="12" stroke="black" strokeWidth="3" fill="none"/>
                <circle cx="17.5" cy="17.5" r="5" fill="black"/>
              </svg>
              
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="bg-black p-4 border-4 border-black rotate-3 brutal-shadow">
                  <StackedTilesLogo size={80} />
                </div>
              </div>
              
              {/* Sparkles around title */}
              <svg className="absolute left-4 top-28 opacity-40" width="25" height="25" viewBox="0 0 25 25">
                <path d="M12.5 2 L14 10 L22 12.5 L14 15 L12.5 23 L11 15 L3 12.5 L11 10 Z" fill="black"/>
              </svg>
              <svg className="absolute right-6 top-32 opacity-40" width="20" height="20" viewBox="0 0 20 20">
                <path d="M10 1 L11 8 L18 10 L11 12 L10 19 L9 12 L2 10 L9 8 Z" fill="black"/>
              </svg>
              
              {/* Title */}
              <h1 
                className="text-6xl mb-3 select-none tracking-tight text-black font-black uppercase relative inline-block"
                style={{
                  textShadow: '4px 4px 0px rgba(251, 191, 36, 1)',
                }}
              >
                MOSAIC
              </h1>
              
              {/* Underline doodle */}
              <svg className="mx-auto opacity-20 mb-3" width="200" height="12" viewBox="0 0 200 12">
                <path d="M10 6 Q 50 2 100 6 T 190 6" stroke="black" strokeWidth="3" fill="none" strokeLinecap="round"/>
              </svg>
              
              <div className="inline-block bg-yellow-400 px-4 py-2 border-4 border-black -rotate-1 brutal-shadow-sm mb-3 relative">
                <p className="text-black text-sm font-black uppercase tracking-wider">Celebrating Student Creativity</p>
                {/* Small arrow doodle */}
                <svg className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-40" width="25" height="20" viewBox="0 0 25 20">
                  <path d="M2 10 L18 10 M18 10 L13 5 M18 10 L13 15" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-gray-700 text-xs font-bold uppercase tracking-wide">Student & Teacher Publishing Platform</p>
            </div>

            {/* Login Forms */}
            {showAdminLogin ? (
              <div>
                <Login onLogin={handleLogin} />
                <button
                  onClick={() => {
                    setShowAdminLogin(false);
                    // Also clear the URL if they're going back to reader login
                    if (window.location.pathname === '/emoh' || window.location.hash === '#emoh') {
                      window.history.pushState({}, '', '/');
                    }
                  }}
                  className="mt-6 w-full text-center bg-white border-4 border-black px-4 py-2 brutal-shadow-sm brutal-hover font-black uppercase text-sm text-black"
                >
                  ← Back to Reader Login
                </button>
              </div>
            ) : (
              <MagicLinkLogin onLogin={handleLogin} />
            )}

          </div>
        </div>

        {/* Footer branding */}
        <div className="absolute bottom-6 left-0 right-0 text-center z-10">
          <div className="inline-block bg-black px-4 py-2 border-4 border-black rotate-1">
            <p className="text-yellow-400 text-xs font-black uppercase tracking-wider">NYC Home Instruction Schools</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user.role === 'admin' && (
        <Suspense fallback={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="bg-white border-4 border-black p-8 brutal-shadow">
              <p className="text-black font-black">Loading Admin Dashboard...</p>
            </div>
          </div>
        }>
          <AdminDashboard user={user} authToken={authToken} onLogout={handleLogout} />
        </Suspense>
      )}
      {user.role === 'editor' && (
        <Suspense fallback={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="bg-white border-4 border-black p-8 brutal-shadow">
              <p className="text-black font-black">Loading Editor Dashboard...</p>
            </div>
          </div>
        }>
          <EditorDashboard user={user} authToken={authToken} onLogout={handleLogout} />
        </Suspense>
      )}
      {(user.role === 'student' || user.role === 'teacher' || user.role === 'guardian') && (
        <ReaderDashboard user={user} authToken={authToken} onLogout={handleLogout} />
      )}

      {/* Password Expiry Modal */}
      {showPasswordExpiry && passwordExpiryData && (
        <Suspense fallback={<div />}>
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
        </Suspense>
      )}
    </div>
  );
}
