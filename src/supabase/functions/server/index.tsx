import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Create a separate client for auth verification (uses anon key)
const supabaseAuth = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper function to generate magic link token
function generateToken(): string {
  return crypto.randomUUID() + '-' + Date.now();
}

// Helper function to validate password
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  // Check for special characters using negation of alphanumeric
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' };
  }
  return { valid: true };
}

// Helper function to check if user exists and is active
async function getActiveUser(email: string) {
  try {
    const users = await kv.getByPrefix('user:');
    return users.find((u: any) => u.email === email && u.isActive);
  } catch (error) {
    console.error('Error fetching users in getActiveUser:', error);
    return null;
  }
}

// Helper function to decode JWT and extract email (without cryptographic verification)
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    // Replace URL-safe characters and add padding if needed
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    
    const jsonPayload = atob(paddedBase64);
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Helper function to verify admin/editor auth
async function verifyAuth(request: Request, silent = false) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    if (!silent) console.error('[verifyAuth] No access token provided');
    return null;
  }
  
  try {
    // First, verify with Supabase Auth to check if token is valid
    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser(accessToken);
    
    if (authError || !authUser) {
      if (!silent) console.error('[verifyAuth] Supabase auth verification failed:', authError?.message);
      
      // Fallback to JWT decode for debugging
      const decoded = decodeJWT(accessToken);
      if (decoded) {
        if (!silent) console.log('[verifyAuth] Decoded JWT:', { email: decoded.email, exp: decoded.exp, now: Date.now() / 1000 });
        
        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          if (!silent) console.error('[verifyAuth] Token expired');
          return null;
        }
      }
      
      return null;
    }
    
    if (!silent) console.log('[verifyAuth] Supabase auth user:', authUser.email);
    
    // Get user details from KV store and verify they exist and are active
    const userDetails = await kv.get(`user:${authUser.email}`);
    if (!userDetails) {
      if (!silent) console.error('[verifyAuth] User not found in KV store:', authUser.email);
      return null;
    }
    
    if (!userDetails.isActive) {
      if (!silent) console.error('[verifyAuth] User account is inactive:', authUser.email);
      return null;
    }
    
    if (!silent) console.log('[verifyAuth] User found:', authUser.email, 'Role:', userDetails.role);
    
    // Verify the user has admin or editor role
    if (userDetails.role !== 'admin' && userDetails.role !== 'editor') {
      // Silently reject students/teachers - this is expected when they hit admin endpoints
      // Only log errors for unexpected roles
      return null;
    }
    
    if (!silent) console.log('[verifyAuth] Auth successful for:', authUser.email);
    return userDetails;
  } catch (error) {
    if (!silent) console.error('[verifyAuth] Exception:', error);
    return null;
  }
}

// Helper function to verify any authenticated user (including readers)
async function verifyAnyAuth(request: Request, silent = false) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    if (!silent) console.error('[verifyAnyAuth] No access token provided');
    return null;
  }
  
  try {
    // First, try to verify with Supabase Auth to check if token is valid
    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser(accessToken);
    
    if (authError || !authUser) {
      if (!silent) console.error('[verifyAnyAuth] Supabase auth verification failed:', authError?.message);
      
      // Fallback to JWT decode for debugging
      const decoded = decodeJWT(accessToken);
      if (decoded) {
        if (!silent) console.log('[verifyAnyAuth] Decoded JWT:', { email: decoded.email, exp: decoded.exp, now: Date.now() / 1000 });
        
        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          if (!silent) console.error('[verifyAnyAuth] Token expired');
          return null;
        }
      }
      
      return null;
    }
    
    if (!silent) console.log('[verifyAnyAuth] Supabase auth user:', authUser.email);
    
    // Try to get user details from KV store
    const userDetails = await kv.get(`user:${authUser.email}`);
    
    if (!userDetails) {
      if (!silent) console.log('[verifyAnyAuth] User not in KV store, creating minimal user object');
      // User authenticated via Supabase but not in KV (possibly student/teacher via magic link)
      return {
        id: authUser.id,
        email: authUser.email,
        fullName: authUser.user_metadata?.fullName || authUser.email,
        role: authUser.user_metadata?.role || 'reader',
        isActive: true
      };
    }
    
    if (!userDetails.isActive) {
      if (!silent) console.error('[verifyAnyAuth] User account is inactive');
      return null;
    }
    
    if (!silent) console.log('[verifyAnyAuth] Auth successful for:', authUser.email);
    return userDetails;
  } catch (error) {
    console.error('[verifyAnyAuth] Exception:', error);
    return null;
  }
}

// Helper to create audit log
async function createAuditLog(
  type: string, 
  userId: string, 
  userEmail: string, 
  details: any = {},
  request?: Request,
  success: boolean = true
) {
  try {
    const logId = `audit:${Date.now()}-${crypto.randomUUID()}`;
    
    // Extract IP and User Agent from request if provided
    const ipAddress = request?.headers.get('x-forwarded-for')?.split(',')[0].trim() 
      || request?.headers.get('x-real-ip') 
      || 'unknown';
    const userAgent = request?.headers.get('user-agent') || 'unknown';
    
    const auditLog = {
      id: logId,
      type,
      email: userEmail,
      userId,
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent,
      success,
      ...details
    };
    await kv.set(logId, auditLog);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

// ============================================================================
// SETUP & INITIAL CONFIGURATION
// ============================================================================

// Check if setup is needed (no users exist)
app.get('/make-server-2c0f842e/setup-status', async (c) => {
  try {
    const users = await kv.getByPrefix('user:');
    const hasUsers = users && users.length > 0;
    
    return c.json({ 
      setupComplete: hasUsers,
      needsInitialSetup: !hasUsers
    });
  } catch (error) {
    console.error('Error checking setup status:', error);
    return c.json({ error: 'Failed to check setup status', details: String(error) }, 500);
  }
});

// Initial setup - Create first admin (no auth required, only works if no users exist)
app.post('/make-server-2c0f842e/initial-setup', async (c) => {
  try {
    // Check if any users already exist
    const existingUsers = await kv.getByPrefix('user:');
    if (existingUsers && existingUsers.length > 0) {
      return c.json({ error: 'Setup already completed. Use admin login to create additional users.' }, 400);
    }

    const { email, fullName, password } = await c.req.json();
    
    if (!email || !fullName || !password) {
      return c.json({ error: 'Missing required fields: email, fullName, password' }, 400);
    }

    // Validate password
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return c.json({ error: pwCheck.error || 'Invalid password' }, 400);
    }

    // Create user in database
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    const user = {
      id: userId,
      email,
      fullName,
      role: 'admin',
      isActive: true,
      createdAt: now,
      lastPasswordChange: now
    };

    await kv.set(`user:${email}`, user);

    // Create Supabase auth user
    console.log('[Initial Setup] Creating Supabase auth user for:', email);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server isn't configured
      user_metadata: { 
        fullName, 
        role: 'admin',
        lastPasswordChange: now
      }
    });

    if (authError) {
      console.error('[Initial Setup] Supabase auth creation error:', authError);
      // Delete the KV user since auth creation failed
      await kv.del(`user:${email}`);
      return c.json({ 
        error: 'Failed to create authentication user. Please try again.',
        details: authError.message,
        hint: 'Make sure the Email provider is enabled in your Supabase dashboard under Authentication → Providers'
      }, 500);
    }
    
    console.log('[Initial Setup] Successfully created admin user:', email, 'with Supabase auth ID:', authData.user.id);
    
    return c.json({ 
      success: true, 
      user,
      message: 'Admin account created successfully! You can now login.'
    });
  } catch (error) {
    console.error('Error in initial setup:', error);
    return c.json({ error: 'Failed to create admin account', details: String(error) }, 500);
  }
});

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

// Admin/Editor Login
app.post('/make-server-2c0f842e/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      await createAuditLog('login_failed', '', email || 'unknown', { 
        reason: 'missing_credentials' 
      }, c.req.raw, false);
      return c.json({ error: 'Email and password are required' }, 400);
    }

    console.log('[Login] Attempting login for:', email);

    // Get user from KV store
    const user = await kv.get(`user:${email}`);
    
    if (!user) {
      console.log('[Login] User not found in KV:', email);
      await createAuditLog('login_failed', '', email, { 
        reason: 'invalid_credentials' 
      }, c.req.raw, false);
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Check if user is admin or editor
    if (user.role !== 'admin' && user.role !== 'editor') {
      console.log('[Login] User role not authorized:', user.role);
      await createAuditLog('login_failed', user.id, email, { 
        reason: 'unauthorized_role',
        userName: user.fullName,
        userRole: user.role
      }, c.req.raw, false);
      return c.json({ error: 'Unauthorized. Admin/Editor access only.' }, 401);
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('[Login] User account is inactive:', email);
      await createAuditLog('login_failed', user.id, email, { 
        reason: 'inactive_account',
        userName: user.fullName,
        userRole: user.role
      }, c.req.raw, false);
      return c.json({ error: 'Account is inactive. Please contact an administrator.' }, 401);
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('[Login] Supabase auth error:', authError);
      await createAuditLog('login_failed', user.id, email, { 
        reason: 'authentication_failed',
        userName: user.fullName,
        userRole: user.role,
        errorDetails: authError.message
      }, c.req.raw, false);
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    if (!authData.session) {
      console.error('[Login] No session returned from Supabase');
      await createAuditLog('login_error', user.id, email, { 
        reason: 'system_error',
        userName: user.fullName,
        userRole: user.role
      }, c.req.raw, false);
      return c.json({ error: 'Failed to create session' }, 500);
    }

    // Check password expiry for admin/editor
    let passwordExpired = false;
    let daysRemaining = 90;
    
    if (user.role === 'admin' || user.role === 'editor') {
      const lastChange = user.lastPasswordChange ? new Date(user.lastPasswordChange) : null;
      const now = new Date();
      
      if (lastChange) {
        const daysSinceChange = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
        daysRemaining = Math.max(0, 90 - daysSinceChange);
        passwordExpired = daysRemaining <= 0;
      } else {
        passwordExpired = true;
        daysRemaining = 0;
      }
    }

    console.log('[Login] Login successful for:', email);

    // Log successful login
    await createAuditLog('login_success', user.id, email, { 
      userName: user.fullName,
      userRole: user.role,
      passwordExpired,
      daysRemaining
    }, c.req.raw, true);

    return c.json({
      success: true,
      user,
      accessToken: authData.session.access_token,
      token: authData.session.access_token, // Keep for backward compatibility
      passwordExpired,
      daysRemaining
    });
  } catch (error) {
    console.error('[Login] Error:', error);
    await createAuditLog('login_error', '', 'unknown', { 
      reason: 'system_error',
      errorDetails: String(error)
    }, c.req.raw, false);
    return c.json({ error: 'Login failed', details: String(error) }, 500);
  }
});

// Validate token
app.get('/make-server-2c0f842e/validate-token', async (c) => {
  const user = await verifyAnyAuth(c.req.raw, true);
  
  if (!user) {
    return c.json({ valid: false, error: 'Invalid or expired token' }, 401);
  }

  return c.json({ valid: true, user });
});

// Refresh token
app.post('/make-server-2c0f842e/refresh-token', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'No token provided' }, 401);
  }
  
  try {
    // Use Supabase to refresh the session
    const { data, error } = await supabaseAuth.auth.setSession({
      access_token: accessToken,
      refresh_token: '' // This will attempt to refresh if possible
    });
    
    if (error || !data.session) {
      console.error('[Refresh Token] Failed to refresh:', error);
      return c.json({ error: 'Failed to refresh token', details: error?.message }, 401);
    }
    
    console.log('[Refresh Token] Token refreshed successfully');
    
    return c.json({ 
      success: true,
      token: data.session.access_token,
      user: data.user
    });
  } catch (error) {
    console.error('[Refresh Token] Exception:', error);
    return c.json({ error: 'Failed to refresh token', details: String(error) }, 500);
  }
});

// Check password expiry
app.get('/make-server-2c0f842e/check-password-expiry', async (c) => {
  const user = await verifyAuth(c.req.raw, true);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Only check for admin/editor
  if (user.role !== 'admin' && user.role !== 'editor') {
    return c.json({ expired: false });
  }

  const lastChange = user.lastPasswordChange ? new Date(user.lastPasswordChange) : null;
  const now = new Date();
  
  if (!lastChange) {
    return c.json({ expired: true, daysRemaining: 0 });
  }

  const daysSinceChange = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = 90 - daysSinceChange;

  return c.json({
    expired: daysRemaining <= 0,
    daysRemaining: Math.max(0, daysRemaining)
  });
});

// Change password
app.post('/make-server-2c0f842e/change-password', async (c) => {
  const user = await verifyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Current and new passwords are required' }, 400);
    }

    // Validate new password
    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.valid) {
      return c.json({ error: pwCheck.error || 'Invalid password' }, 400);
    }

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });

    if (signInError) {
      return c.json({ error: 'Current password is incorrect' }, 401);
    }

    // Get the auth user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      throw listError;
    }

    const authUser = users.find(u => u.email === user.email);
    if (!authUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(authUser.id, {
      password: newPassword
    });

    if (updateError) {
      throw updateError;
    }

    // Update lastPasswordChange in KV store
    const now = new Date().toISOString();
    user.lastPasswordChange = now;
    await kv.set(`user:${user.email}`, user);

    await createAuditLog('password_changed', user.id, user.email, {
      userName: user.fullName,
      userRole: user.role
    }, c.req.raw, true);

    return c.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('[Change Password] Error:', error);
    return c.json({ error: 'Failed to change password', details: String(error) }, 500);
  }
});

// Forgot password
app.post('/make-server-2c0f842e/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Check if user exists
    const user = await kv.get(`user:${email}`);
    
    if (!user) {
      // Don't reveal if user exists or not
      return c.json({ 
        success: true, 
        message: 'If an account exists with this email, a password reset link has been generated.' 
      });
    }

    // Generate reset token
    const token = generateToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await kv.set(`reset:${token}`, {
      email: user.email,
      expiry: expiry.toISOString(),
      used: false
    });

    // In production, you would send an email here
    const resetLink = `${Deno.env.get('SUPABASE_URL')}/reset-password?token=${token}`;

    console.log('[Forgot Password] Reset link generated for:', email);
    console.log('[Forgot Password] Reset link:', resetLink);

    // For development, return the link (remove this in production)
    return c.json({ 
      success: true, 
      message: 'Password reset link generated.',
      resetLink // Remove this in production
    });
  } catch (error) {
    console.error('[Forgot Password] Error:', error);
    return c.json({ error: 'Failed to process request', details: String(error) }, 500);
  }
});

// Reset password
app.post('/make-server-2c0f842e/reset-password', async (c) => {
  try {
    const { token, newPassword } = await c.req.json();

    if (!token || !newPassword) {
      return c.json({ error: 'Token and new password are required' }, 400);
    }

    // Validate password
    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.valid) {
      return c.json({ error: pwCheck.error || 'Invalid password' }, 400);
    }

    // Get reset token
    const resetData = await kv.get(`reset:${token}`);
    
    if (!resetData) {
      return c.json({ error: 'Invalid or expired reset token' }, 400);
    }

    if (resetData.used) {
      return c.json({ error: 'This reset token has already been used' }, 400);
    }

    if (new Date(resetData.expiry) < new Date()) {
      return c.json({ error: 'Reset token has expired' }, 400);
    }

    // Get user
    const user = await kv.get(`user:${resetData.email}`);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Get the auth user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      throw listError;
    }

    const authUser = users.find(u => u.email === resetData.email);
    if (!authUser) {
      return c.json({ error: 'Auth user not found' }, 404);
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(authUser.id, {
      password: newPassword
    });

    if (updateError) {
      throw updateError;
    }

    // Update lastPasswordChange in KV store
    const now = new Date().toISOString();
    user.lastPasswordChange = now;
    await kv.set(`user:${user.email}`, user);

    // Mark token as used
    resetData.used = true;
    await kv.set(`reset:${token}`, resetData);

    await createAuditLog('password_reset', user.id, user.email, {
      userName: user.fullName,
      userRole: user.role
    }, c.req.raw, true);

    return c.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('[Reset Password] Error:', error);
    return c.json({ error: 'Failed to reset password', details: String(error) }, 500);
  }
});

// ============================================================================
// MAGIC LINK AUTHENTICATION
// ============================================================================

// Verify magic link user
app.post('/make-server-2c0f842e/verify-magic-link-user', async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    console.log('[Verify Magic Link] Checking user:', email);

    // Get user from KV store
    const user = await kv.get(`user:${email}`);
    
    if (!user) {
      console.log('[Verify Magic Link] User not found:', email);
      return c.json({ error: 'User not authorized' }, 401);
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('[Verify Magic Link] User inactive:', email);
      return c.json({ error: 'Account is inactive' }, 401);
    }

    console.log('[Verify Magic Link] User verified:', email, 'Role:', user.role);

    return c.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('[Verify Magic Link] Error:', error);
    return c.json({ error: 'Verification failed', details: String(error) }, 500);
  }
});

// Check if user exists
app.post('/make-server-2c0f842e/check-user-exists', async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const user = await kv.get(`user:${email}`);
    
    return c.json({ 
      exists: !!user,
      isActive: user ? user.isActive : false
    });
  } catch (error) {
    console.error('[Check User Exists] Error:', error);
    return c.json({ error: 'Check failed', details: String(error) }, 500);
  }
});

// ============================================================================
// USER MANAGEMENT ENDPOINTS
// ============================================================================

// Get all users (admin/editor only)
app.get('/make-server-2c0f842e/users', async (c) => {
  const authUser = await verifyAuth(c.req.raw);
  
  if (!authUser) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const users = await kv.getByPrefix('user:');
    return c.json({ users });
  } catch (error) {
    console.error('[Get Users] Error:', error);
    return c.json({ error: 'Failed to fetch users', details: String(error) }, 500);
  }
});

// Create user (admin only)
app.post('/make-server-2c0f842e/admin/create-user', async (c) => {
  const authUser = await verifyAuth(c.req.raw);
  
  if (!authUser || authUser.role !== 'admin') {
    return c.json({ error: 'Unauthorized. Admin access required.' }, 401);
  }

  try {
    const { email, fullName, role, password } = await c.req.json();

    if (!email || !fullName || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Check if user already exists
    const existing = await kv.get(`user:${email}`);
    if (existing) {
      return c.json({ error: 'User with this email already exists' }, 400);
    }

    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const user = {
      id: userId,
      email,
      fullName,
      role,
      isActive: true,
      createdAt: now,
      lastPasswordChange: role === 'admin' || role === 'editor' ? now : undefined
    };

    // For admin/editor, require password
    if ((role === 'admin' || role === 'editor')) {
      if (!password) {
        return c.json({ error: 'Password is required for admin and editor accounts' }, 400);
      }

      const pwCheck = validatePassword(password);
      if (!pwCheck.valid) {
        return c.json({ error: pwCheck.error || 'Invalid password' }, 400);
      }

      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { 
          fullName, 
          role,
          lastPasswordChange: now
        }
      });

      if (authError) {
        console.error('[Create User] Supabase auth error:', authError);
        return c.json({ error: 'Failed to create auth user', details: authError.message }, 500);
      }

      console.log('[Create User] Created auth user:', authData.user.id);
    } else {
      // For students/teachers, create without password (magic link only)
      const tempPassword = crypto.randomUUID(); // Temporary password they'll never use
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { fullName, role }
      });

      if (authError) {
        console.error('[Create User] Supabase auth error:', authError);
        return c.json({ error: 'Failed to create auth user', details: authError.message }, 500);
      }
    }

    await kv.set(`user:${email}`, user);
    await createAuditLog('user_created', authUser.id, authUser.email, { 
      createdUser: email, 
      role,
      performedBy: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.fullName,
        role: authUser.role
      },
      targetUser: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role
      }
    }, c.req.raw, true);

    console.log('[Create User] Successfully created user:', email, 'Role:', role);

    return c.json({ success: true, user });
  } catch (error) {
    console.error('[Create User] Error:', error);
    return c.json({ error: 'Failed to create user', details: String(error) }, 500);
  }
});

// Update user (admin only)
app.put('/make-server-2c0f842e/admin/update-user', async (c) => {
  const authUser = await verifyAuth(c.req.raw);
  
  if (!authUser || authUser.role !== 'admin') {
    return c.json({ error: 'Unauthorized. Admin access required.' }, 401);
  }

  try {
    const { userId, email, fullName, role, password } = await c.req.json();

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Find user by ID
    const allUsers = await kv.getByPrefix('user:');
    const user = allUsers.find((u: any) => u.id === userId);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const oldEmail = user.email;
    const emailChanged = email && email !== oldEmail;

    // Update user data
    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    if (email) user.email = email;

    // Get the auth user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      throw listError;
    }

    const authUserToUpdate = users.find(u => u.email === oldEmail);
    if (!authUserToUpdate) {
      return c.json({ error: 'Auth user not found' }, 404);
    }

    // Update in Supabase Auth
    const updateData: any = {
      user_metadata: { 
        fullName: user.fullName, 
        role: user.role 
      }
    };

    if (emailChanged) {
      updateData.email = email;
    }

    if (password) {
      const pwCheck = validatePassword(password);
      if (!pwCheck.valid) {
        return c.json({ error: pwCheck.error || 'Invalid password' }, 400);
      }
      updateData.password = password;
      
      const now = new Date().toISOString();
      user.lastPasswordChange = now;
      updateData.user_metadata.lastPasswordChange = now;
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      authUserToUpdate.id,
      updateData
    );

    if (updateError) {
      throw updateError;
    }

    // Update in KV store
    if (emailChanged) {
      await kv.del(`user:${oldEmail}`);
      await kv.set(`user:${email}`, user);
    } else {
      await kv.set(`user:${user.email}`, user);
    }

    await createAuditLog('user_updated', authUser.id, authUser.email, { 
      updatedUser: user.email, 
      changes: { fullName, role, emailChanged, passwordChanged: !!password },
      performedBy: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.fullName,
        role: authUser.role
      },
      targetUser: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role
      }
    }, c.req.raw, true);

    return c.json({ success: true, user });
  } catch (error) {
    console.error('[Update User] Error:', error);
    return c.json({ error: 'Failed to update user', details: String(error) }, 500);
  }
});

// Toggle user status (admin only)
app.put('/make-server-2c0f842e/admin/toggle-user-status', async (c) => {
  const authUser = await verifyAuth(c.req.raw);
  
  if (!authUser || authUser.role !== 'admin') {
    return c.json({ error: 'Unauthorized. Admin access required.' }, 401);
  }

  try {
    const { userId, isActive } = await c.req.json();

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Find user by ID
    const allUsers = await kv.getByPrefix('user:');
    const user = allUsers.find((u: any) => u.id === userId);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Don't allow deactivating yourself
    if (user.email === authUser.email) {
      return c.json({ error: 'You cannot deactivate your own account' }, 400);
    }

    user.isActive = isActive;
    await kv.set(`user:${user.email}`, user);

    await createAuditLog('user_status_changed', authUser.id, authUser.email, { 
      targetUser: user.email, 
      isActive,
      action: isActive ? 'activated' : 'deactivated',
      performedBy: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.fullName,
        role: authUser.role
      },
      targetUser: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role
      }
    }, c.req.raw, true);

    return c.json({ success: true, user });
  } catch (error) {
    console.error('[Toggle User Status] Error:', error);
    return c.json({ error: 'Failed to toggle user status', details: String(error) }, 500);
  }
});

// Delete user (admin only)
app.delete('/make-server-2c0f842e/admin/delete-user', async (c) => {
  console.log('🗑️ [Delete User] Request received');
  
  const authUser = await verifyAuth(c.req.raw);
  
  if (!authUser || authUser.role !== 'admin') {
    console.log('🗑️ [Delete User] Unauthorized:', authUser?.email, authUser?.role);
    return c.json({ error: 'Unauthorized. Admin access required.' }, 401);
  }

  try {
    const { userId } = await c.req.json();
    console.log('🗑️ [Delete User] Target user ID:', userId);

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Find user by ID
    const allUsers = await kv.getByPrefix('user:');
    console.log('🗑️ [Delete User] Total users in DB:', allUsers.length);
    
    const user = allUsers.find((u: any) => u.id === userId);
    console.log('🗑️ [Delete User] Found user:', user?.email);

    if (!user) {
      console.log('🗑️ [Delete User] User not found with ID:', userId);
      return c.json({ error: 'User not found' }, 404);
    }

    // Don't allow deleting yourself
    if (user.email === authUser.email) {
      console.log('🗑️ [Delete User] Cannot delete self');
      return c.json({ error: 'You cannot delete your own account' }, 400);
    }

    // Get the auth user
    console.log('🗑️ [Delete User] Fetching from Supabase Auth...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('🗑️ [Delete User] Error listing users from Auth:', listError);
      throw listError;
    }

    const authUserToDelete = users.find(u => u.email === user.email);
    if (authUserToDelete) {
      console.log('🗑️ [Delete User] Deleting from Supabase Auth:', authUserToDelete.id);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authUserToDelete.id);
      if (deleteError) {
        console.error('🗑️ [Delete User] Error deleting from Supabase:', deleteError);
        // Continue anyway to delete from KV store
      } else {
        console.log('🗑️ [Delete User] Successfully deleted from Supabase Auth');
      }
    } else {
      console.log('🗑️ [Delete User] User not found in Supabase Auth, skipping...');
    }

    // Delete from KV store
    console.log('🗑️ [Delete User] Deleting from KV store:', `user:${user.email}`);
    await kv.del(`user:${user.email}`);
    console.log('🗑️ [Delete User] Successfully deleted from KV store');

    await createAuditLog('user_deleted', authUser.id, authUser.email, { 
      deletedUser: user.email,
      performedBy: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.fullName,
        role: authUser.role
      },
      targetUser: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role
      }
    }, c.req.raw, true);

    console.log('🗑️ [Delete User] ✅ Success!');
    return c.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('🗑️ [Delete User] ❌ Error:', error);
    return c.json({ error: 'Failed to delete user', details: String(error) }, 500);
  }
});

// Bulk create users (admin only)
app.post('/make-server-2c0f842e/admin/bulk-create-users', async (c) => {
  const authUser = await verifyAuth(c.req.raw);
  
  if (!authUser || authUser.role !== 'admin') {
    return c.json({ error: 'Unauthorized. Admin access required.' }, 401);
  }

  try {
    const { users } = await c.req.json();

    if (!users || !Array.isArray(users)) {
      return c.json({ error: 'Invalid users data' }, 400);
    }

    const results = {
      success: [] as any[],
      failed: [] as any[]
    };

    for (const userData of users) {
      try {
        const { email, fullName, role } = userData;

        if (!email || !fullName || !role) {
          results.failed.push({ email, error: 'Missing required fields' });
          continue;
        }

        // Check if user already exists
        const existing = await kv.get(`user:${email}`);
        if (existing) {
          results.failed.push({ email, error: 'User already exists' });
          continue;
        }

        const userId = crypto.randomUUID();
        const now = new Date().toISOString();
        const tempPassword = crypto.randomUUID();

        const user = {
          id: userId,
          email,
          fullName,
          role,
          isActive: true,
          createdAt: now
        };

        // Create Supabase auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { fullName, role }
        });

        if (authError) {
          results.failed.push({ email, error: authError.message });
          continue;
        }

        await kv.set(`user:${email}`, user);
        results.success.push(user);
      } catch (err) {
        results.failed.push({ email: userData.email, error: String(err) });
      }
    }

    await createAuditLog('bulk_users_created', authUser.id, authUser.email, { 
      successCount: results.success.length,
      failedCount: results.failed.length,
      performedBy: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.fullName,
        role: authUser.role
      }
    }, c.req.raw, true);

    return c.json({ success: true, results });
  } catch (error) {
    console.error('[Bulk Create Users] Error:', error);
    return c.json({ error: 'Failed to create users', details: String(error) }, 500);
  }
});

// Create test audit log (admin only) - FOR TESTING PURPOSES
app.post('/make-server-2c0f842e/admin/audit-logs/test', async (c) => {
  const authUser = await verifyAuth(c.req.raw);
  
  if (!authUser || authUser.role !== 'admin') {
    return c.json({ error: 'Unauthorized. Admin access required.' }, 401);
  }

  try {
    await createAuditLog('login_success', authUser.id, authUser.email, {
      userName: authUser.fullName,
      userRole: authUser.role,
      passwordExpired: false,
      daysRemaining: 90
    }, c.req.raw, true);

    await createAuditLog('login_failed', '', 'test@example.com', {
      reason: 'invalid_credentials',
      userName: 'Test User',
      userRole: 'editor'
    }, c.req.raw, false);

    await createAuditLog('user_created', authUser.id, authUser.email, {
      performedBy: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.fullName,
        role: authUser.role
      },
      targetUser: {
        id: 'test-123',
        email: 'newuser@example.com',
        name: 'New Test User',
        role: 'reader'
      }
    }, c.req.raw, true);

    return c.json({ 
      success: true, 
      message: 'Created 3 test audit log entries' 
    });
  } catch (error) {
    console.error('[Create Test Audit Logs] Error:', error);
    return c.json({ error: 'Failed to create test logs', details: String(error) }, 500);
  }
});

// Get audit logs (admin only)
app.get('/make-server-2c0f842e/admin/audit-logs', async (c) => {
  const authUser = await verifyAuth(c.req.raw);
  
  if (!authUser || authUser.role !== 'admin') {
    return c.json({ error: 'Unauthorized. Admin access required.' }, 401);
  }

  try {
    let logs = await kv.getByPrefix('audit:');
    
    // Transform old logs to new schema (action -> type, userEmail -> email)
    logs = logs.map((log: any) => {
      const transformed = { ...log };
      
      // Convert old field names to new ones
      if (log.action && !log.type) {
        transformed.type = log.action;
        delete transformed.action;
      }
      
      if (log.userEmail && !log.email) {
        transformed.email = log.userEmail;
        delete transformed.userEmail;
      }
      
      // Ensure required fields exist with defaults
      if (!transformed.type) transformed.type = 'unknown';
      if (!transformed.ipAddress) transformed.ipAddress = 'unknown';
      if (!transformed.userAgent) transformed.userAgent = 'unknown';
      if (transformed.success === undefined) transformed.success = true;
      
      return transformed;
    });
    
    // Apply filters from query parameters
    const filterType = c.req.query('type');
    const filterEmail = c.req.query('email');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    const limit = parseInt(c.req.query('limit') || '100');
    
    console.log('[Get Audit Logs] Total logs:', logs.length, 'Filters:', { filterType, filterEmail, startDate, endDate, limit });
    console.log('[Get Audit Logs] Sample log (first):', logs.length > 0 ? JSON.stringify(logs[0]) : 'No logs found');
    
    // Filter by type
    if (filterType && filterType !== 'all') {
      logs = logs.filter((log: any) => log.type === filterType);
    }
    
    // Filter by email
    if (filterEmail) {
      logs = logs.filter((log: any) => 
        log.email?.toLowerCase().includes(filterEmail.toLowerCase()) ||
        log.performedBy?.email?.toLowerCase().includes(filterEmail.toLowerCase()) ||
        log.targetUser?.email?.toLowerCase().includes(filterEmail.toLowerCase())
      );
    }
    
    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      logs = logs.filter((log: any) => new Date(log.timestamp) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include entire end date
      logs = logs.filter((log: any) => new Date(log.timestamp) <= end);
    }
    
    // Sort by timestamp descending
    logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply limit
    logs = logs.slice(0, limit);
    
    console.log('[Get Audit Logs] Returning', logs.length, 'filtered logs');

    return c.json({ logs });
  } catch (error) {
    console.error('[Get Audit Logs] Error:', error);
    return c.json({ error: 'Failed to fetch audit logs', details: String(error) }, 500);
  }
});

// Debug auth endpoint
app.get('/make-server-2c0f842e/debug-auth', async (c) => {
  const user = await verifyAuth(c.req.raw, true);
  
  return c.json({ 
    success: !!user,
    authenticated: !!user,
    user: user || null,
    message: user ? 'Authentication successful' : 'Authentication failed'
  });
});

// ============================================================================
// FILE UPLOAD ENDPOINTS
// ============================================================================

// Upload file
app.post('/make-server-2c0f842e/upload-file', async (c) => {
  const user = await verifyAnyAuth(c.req.raw, false);
  
  if (!user) {
    console.error('[Upload File] Authentication failed');
    return c.json({ error: 'Invalid JWT', message: 'Authentication failed. Please log in again.' }, 401);
  }
  
  console.log('[Upload File] Authenticated user:', user.email, 'Role:', user.role);

  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'document';

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    console.log('[Upload File] Uploading file:', file.name, 'Type:', type, 'Size:', file.size);

    // Create bucket name based on type
    const bucketName = `make-2c0f842e-${type}s`;

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('[Upload File] Creating bucket:', bucketName);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false
      });
      
      if (createError) {
        console.error('[Upload File] Error creating bucket:', createError);
        return c.json({ error: 'Failed to create storage bucket', details: createError.message }, 500);
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${user.email}/${fileName}`;

    // Convert File to ArrayBuffer then to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('[Upload File] Upload error:', uploadError);
      return c.json({ error: 'Failed to upload file', details: uploadError.message }, 500);
    }

    // Get signed URL (valid for 1 year)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 31536000); // 1 year in seconds

    if (urlError) {
      console.error('[Upload File] URL generation error:', urlError);
      return c.json({ error: 'Failed to generate file URL', details: urlError.message }, 500);
    }

    console.log('[Upload File] File uploaded successfully:', filePath);

    return c.json({ 
      success: true, 
      url: urlData.signedUrl,
      path: filePath,
      bucket: bucketName
    });
  } catch (error) {
    console.error('[Upload File] Error:', error);
    return c.json({ error: 'Failed to upload file', details: String(error) }, 500);
  }
});

// ============================================================================
// SUBMISSION ENDPOINTS
// ============================================================================

// Get submissions
app.get('/make-server-2c0f842e/submissions', async (c) => {
  const user = await verifyAnyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    let submissions = await kv.getByPrefix('submission:');
    const showTrash = c.req.query('trash') === 'true';
    
    console.log(`[Get Submissions] Total: ${submissions.length}, ShowTrash: ${showTrash}, User: ${user.email}`);

    // Filter out trashed submissions (unless explicitly requesting trash)
    if (!showTrash) {
      const beforeCount = submissions.length;
      submissions = submissions.filter((s: any) => !s.isTrashed);
      console.log(`[Get Submissions] Filtered inbox: ${beforeCount} → ${submissions.length} (removed ${beforeCount - submissions.length} trashed)`);
    } else {
      // If showing trash, only show trashed items
      const beforeCount = submissions.length;
      submissions = submissions.filter((s: any) => s.isTrashed === true);
      console.log(`[Get Submissions] Filtered trash: ${beforeCount} → ${submissions.length} (showing only trashed)`);
    }

    // Filter based on user role
    if (user.role === 'student' || user.role === 'teacher') {
      // Students and teachers can only see their own submissions
      submissions = submissions.filter((s: any) => s.authorEmail === user.email);
    }
    // Admins and editors can see all submissions

    // Sort by creation date descending
    submissions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`[Get Submissions] Returning ${submissions.length} submissions`);
    return c.json({ submissions });
  } catch (error) {
    console.error('[Get Submissions] Error:', error);
    return c.json({ error: 'Failed to fetch submissions', details: String(error) }, 500);
  }
});

// Get accepted submissions for an issue
app.get('/make-server-2c0f842e/submissions/accepted', async (c) => {
  const user = await verifyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const issueId = c.req.query('issueId');
    
    let submissions = await kv.getByPrefix('submission:');
    
    // Filter accepted submissions
    submissions = submissions.filter((s: any) => s.status === 'accepted');
    
    // If issueId provided, filter by that issue
    if (issueId) {
      submissions = submissions.filter((s: any) => s.issueId === issueId);
    }

    submissions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ submissions });
  } catch (error) {
    console.error('[Get Accepted Submissions] Error:', error);
    return c.json({ error: 'Failed to fetch submissions', details: String(error) }, 500);
  }
});

// Create submission
app.post('/make-server-2c0f842e/submissions', async (c) => {
  const user = await verifyAnyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { type, title, content, fileUrl, contributorStatus, authorName, authorEmail } = await c.req.json();

    if (!type || !title) {
      return c.json({ error: 'Type and title are required' }, 400);
    }

    const submissionId = crypto.randomUUID();
    const now = new Date().toISOString();

    const submission = {
      id: submissionId,
      type,
      title,
      content: content || '',
      fileUrl: fileUrl || '',
      authorEmail: authorEmail || '',
      authorName: authorName || '',
      contributorStatus: contributorStatus || '',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      isTrashed: false,
      submittedBy: user.email
    };

    await kv.set(`submission:${submissionId}`, submission);

    console.log('[Create Submission] Created:', submissionId, 'by', user.email);

    return c.json({ success: true, submission });
  } catch (error) {
    console.error('[Create Submission] Error:', error);
    return c.json({ error: 'Failed to create submission', details: String(error) }, 500);
  }
});

// Update submission
app.put('/make-server-2c0f842e/submissions/:id', async (c) => {
  const user = await verifyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const submissionId = c.req.param('id');
    const updates = await c.req.json();

    const submission = await kv.get(`submission:${submissionId}`);
    
    if (!submission) {
      return c.json({ error: 'Submission not found' }, 404);
    }

    // Update allowed fields
    const allowedFields = ['status', 'feedback', 'issueId', 'title', 'content', 'fileUrl', 'isTrashed', 'type', 'authorName', 'authorEmail', 'contributorStatus'];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        submission[field] = updates[field];
      }
    }

    submission.updatedAt = new Date().toISOString();
    submission.updatedBy = user.email;

    await kv.set(`submission:${submissionId}`, submission);

    console.log('[Update Submission] Updated:', submissionId, 'by', user.email);

    return c.json({ success: true, submission });
  } catch (error) {
    console.error('[Update Submission] Error:', error);
    return c.json({ error: 'Failed to update submission', details: String(error) }, 500);
  }
});

// Delete submission (permanent)
app.delete('/make-server-2c0f842e/submissions/:id', async (c) => {
  const user = await verifyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const submissionId = c.req.param('id');
    
    const submission = await kv.get(`submission:${submissionId}`);
    
    if (!submission) {
      return c.json({ error: 'Submission not found' }, 404);
    }

    await kv.del(`submission:${submissionId}`);

    await createAuditLog('submission_deleted', user.id, user.email, { 
      submissionId,
      title: submission.title,
      performedBy: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role
      }
    }, c.req.raw, true);

    console.log('[Delete Submission] Deleted:', submissionId, 'by', user.email);

    return c.json({ success: true, message: 'Submission deleted permanently' });
  } catch (error) {
    console.error('[Delete Submission] Error:', error);
    return c.json({ error: 'Failed to delete submission', details: String(error) }, 500);
  }
});

// Move submission to trash
app.post('/make-server-2c0f842e/submissions/:id/trash', async (c) => {
  const user = await verifyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const submissionId = c.req.param('id');
    
    const submission = await kv.get(`submission:${submissionId}`);
    
    if (!submission) {
      return c.json({ error: 'Submission not found' }, 404);
    }

    submission.isTrashed = true;
    submission.trashedAt = new Date().toISOString();
    submission.trashedBy = user.email;

    await kv.set(`submission:${submissionId}`, submission);

    console.log('[Trash Submission] Trashed:', submissionId, 'by', user.email);

    return c.json({ success: true, submission });
  } catch (error) {
    console.error('[Trash Submission] Error:', error);
    return c.json({ error: 'Failed to trash submission', details: String(error) }, 500);
  }
});

// Restore submission from trash
app.post('/make-server-2c0f842e/submissions/:id/restore', async (c) => {
  const user = await verifyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const submissionId = c.req.param('id');
    
    const submission = await kv.get(`submission:${submissionId}`);
    
    if (!submission) {
      return c.json({ error: 'Submission not found' }, 404);
    }

    submission.isTrashed = false;
    delete submission.trashedAt;
    delete submission.trashedBy;

    await kv.set(`submission:${submissionId}`, submission);

    console.log('[Restore Submission] Restored:', submissionId, 'by', user.email);

    return c.json({ success: true, submission });
  } catch (error) {
    console.error('[Restore Submission] Error:', error);
    return c.json({ error: 'Failed to restore submission', details: String(error) }, 500);
  }
});

// Empty trash
app.post('/make-server-2c0f842e/submissions/empty-trash', async (c) => {
  const user = await verifyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const submissions = await kv.getByPrefix('submission:');
    const trashedSubmissions = submissions.filter((s: any) => s.isTrashed);

    for (const submission of trashedSubmissions) {
      await kv.del(`submission:${submission.id}`);
    }

    await createAuditLog('trash_emptied', user.id, user.email, { 
      count: trashedSubmissions.length,
      performedBy: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role
      }
    }, c.req.raw, true);

    console.log('[Empty Trash] Deleted', trashedSubmissions.length, 'submissions by', user.email);

    return c.json({ 
      success: true, 
      message: `Deleted ${trashedSubmissions.length} submissions permanently` 
    });
  } catch (error) {
    console.error('[Empty Trash] Error:', error);
    return c.json({ error: 'Failed to empty trash', details: String(error) }, 500);
  }
});

// Send email for submission
app.post('/make-server-2c0f842e/submissions/:id/send-email', async (c) => {
  const user = await verifyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const submissionId = c.req.param('id');
    const { message } = await c.req.json();

    const submission = await kv.get(`submission:${submissionId}`);
    
    if (!submission) {
      return c.json({ error: 'Submission not found' }, 404);
    }

    // In a production app, you would send an actual email here
    console.log('[Send Email] To:', submission.authorEmail);
    console.log('[Send Email] Message:', message);

    await createAuditLog('email_sent', user.id, user.email, { 
      to: submission.authorEmail,
      submissionId,
      submissionTitle: submission.title,
      performedBy: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role
      }
    }, c.req.raw, true);

    return c.json({ 
      success: true, 
      message: 'Email sent successfully (simulated)' 
    });
  } catch (error) {
    console.error('[Send Email] Error:', error);
    return c.json({ error: 'Failed to send email', details: String(error) }, 500);
  }
});

// ============================================================================
// ISSUE ENDPOINTS
// ============================================================================

// Get all issues
app.get('/make-server-2c0f842e/issues', async (c) => {
  try {
    const issues = await kv.getByPrefix('issue:');
    
    // Sort by creation date descending
    issues.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ issues });
  } catch (error) {
    console.error('[Get Issues] Error:', error);
    return c.json({ error: 'Failed to fetch issues', details: String(error) }, 500);
  }
});

// Create issue
app.post('/make-server-2c0f842e/issues', async (c) => {
  const user = await verifyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { title, description, coverImage, theme } = await c.req.json();

    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    const issueId = crypto.randomUUID();
    const now = new Date().toISOString();

    const issue = {
      id: issueId,
      title,
      description: description || '',
      coverImage: coverImage || '',
      theme: theme || 'default',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      createdBy: user.email
    };

    await kv.set(`issue:${issueId}`, issue);

    console.log('[Create Issue] Created:', issueId, 'by', user.email);

    return c.json({ success: true, issue });
  } catch (error) {
    console.error('[Create Issue] Error:', error);
    return c.json({ error: 'Failed to create issue', details: String(error) }, 500);
  }
});

// Update issue
app.put('/make-server-2c0f842e/issues/:id', async (c) => {
  const user = await verifyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const issueId = c.req.param('id');
    const updates = await c.req.json();

    const issue = await kv.get(`issue:${issueId}`);
    
    if (!issue) {
      return c.json({ error: 'Issue not found' }, 404);
    }

    // Update allowed fields
    const allowedFields = ['title', 'description', 'coverImage', 'theme', 'status'];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        issue[field] = updates[field];
      }
    }

    issue.updatedAt = new Date().toISOString();
    issue.updatedBy = user.email;

    await kv.set(`issue:${issueId}`, issue);

    console.log('[Update Issue] Updated:', issueId, 'by', user.email);

    return c.json({ success: true, issue });
  } catch (error) {
    console.error('[Update Issue] Error:', error);
    return c.json({ error: 'Failed to update issue', details: String(error) }, 500);
  }
});

// Publish issue
app.post('/make-server-2c0f842e/issues/:id/publish', async (c) => {
  const user = await verifyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const issueId = c.req.param('id');
    
    const issue = await kv.get(`issue:${issueId}`);
    
    if (!issue) {
      return c.json({ error: 'Issue not found' }, 404);
    }

    issue.status = 'published';
    issue.publishedAt = new Date().toISOString();
    issue.publishedBy = user.email;
    issue.updatedAt = new Date().toISOString();

    await kv.set(`issue:${issueId}`, issue);

    // Update all submissions assigned to this issue to "published" status
    const allSubmissions = await kv.getByPrefix('submission:');
    let updatedCount = 0;
    let alreadyPublishedCount = 0;
    
    for (const submission of allSubmissions) {
      if (submission.issueId === issueId) {
        if (submission.status === 'accepted') {
          submission.status = 'published';
          submission.publishedAt = new Date().toISOString();
          await kv.set(`submission:${submission.id}`, submission);
          updatedCount++;
          console.log('[Publish Issue] Updated submission to published:', submission.id);
        } else if (submission.status === 'published') {
          alreadyPublishedCount++;
          console.log('[Publish Issue] Submission already published:', submission.id);
        }
      }
    }

    const totalPublished = updatedCount + alreadyPublishedCount;

    await createAuditLog('issue_published', user.id, user.email, { 
      issueId,
      title: issue.title,
      updatedSubmissions: updatedCount,
      alreadyPublished: alreadyPublishedCount,
      totalPublished: totalPublished,
      performedBy: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role
      }
    }, c.req.raw, true);

    console.log('[Publish Issue] Published:', issueId, 'by', user.email, '- Updated', updatedCount, 'submissions,', alreadyPublishedCount, 'already published');

    return c.json({ 
      success: true, 
      issue, 
      updatedSubmissions: updatedCount,
      alreadyPublished: alreadyPublishedCount,
      totalPublished: totalPublished
    });
  } catch (error) {
    console.error('[Publish Issue] Error:', error);
    return c.json({ error: 'Failed to publish issue', details: String(error) }, 500);
  }
});

// Get issue pages
app.get('/make-server-2c0f842e/issues/:id/pages', async (c) => {
  const user = await verifyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const issueId = c.req.param('id');
    
    const pages = await kv.getByPrefix(`page:${issueId}:`);
    
    // Sort by page number
    pages.sort((a: any, b: any) => a.pageNumber - b.pageNumber);

    return c.json({ pages });
  } catch (error) {
    console.error('[Get Issue Pages] Error:', error);
    return c.json({ error: 'Failed to fetch pages', details: String(error) }, 500);
  }
});

// Save issue pages
app.post('/make-server-2c0f842e/issues/:id/pages', async (c) => {
  const user = await verifyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const issueId = c.req.param('id');
    const { pages } = await c.req.json();

    if (!pages || !Array.isArray(pages)) {
      return c.json({ error: 'Pages array is required' }, 400);
    }

    // Delete existing pages for this issue
    const existingPages = await kv.getByPrefix(`page:${issueId}:`);
    for (const page of existingPages) {
      await kv.del(`page:${issueId}:${page.pageNumber}`);
    }

    // Save new pages
    for (const page of pages) {
      const pageKey = `page:${issueId}:${page.pageNumber}`;
      await kv.set(pageKey, {
        ...page,
        issueId,
        updatedAt: new Date().toISOString(),
        updatedBy: user.email
      });
    }

    console.log('[Save Pages] Saved', pages.length, 'pages for issue:', issueId);

    return c.json({ success: true, message: `Saved ${pages.length} pages` });
  } catch (error) {
    console.error('[Save Pages] Error:', error);
    return c.json({ error: 'Failed to save pages', details: String(error) }, 500);
  }
});

// ============================================================================
// COMMENT ENDPOINTS
// ============================================================================

// Get pending comments
app.get('/make-server-2c0f842e/comments-pending', async (c) => {
  const user = await verifyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const comments = await kv.getByPrefix('comment:');
    
    // Filter pending comments
    const pendingComments = comments.filter((comment: any) => comment.status === 'pending');
    
    // Sort by creation date descending
    pendingComments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ comments: pendingComments });
  } catch (error) {
    console.error('[Get Pending Comments] Error:', error);
    return c.json({ error: 'Failed to fetch comments', details: String(error) }, 500);
  }
});

// Get comments for a submission
app.get('/make-server-2c0f842e/comments/:submissionId', async (c) => {
  try {
    const submissionId = c.req.param('submissionId');
    
    const allComments = await kv.getByPrefix('comment:');
    
    // Filter approved comments for this submission
    const comments = allComments.filter((comment: any) => 
      comment.submissionId === submissionId && comment.status === 'approved'
    );
    
    // Sort by creation date ascending (oldest first)
    comments.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return c.json({ comments });
  } catch (error) {
    console.error('[Get Comments] Error:', error);
    return c.json({ error: 'Failed to fetch comments', details: String(error) }, 500);
  }
});

// Create comment
app.post('/make-server-2c0f842e/comments', async (c) => {
  const user = await verifyAnyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { submissionId, content } = await c.req.json();

    if (!submissionId || !content) {
      return c.json({ error: 'Submission ID and content are required' }, 400);
    }

    const commentId = crypto.randomUUID();
    const now = new Date().toISOString();

    const comment = {
      id: commentId,
      submissionId,
      content,
      authorEmail: user.email,
      authorName: user.fullName,
      status: 'pending',
      createdAt: now
    };

    await kv.set(`comment:${commentId}`, comment);

    console.log('[Create Comment] Created:', commentId, 'by', user.email);

    return c.json({ success: true, comment });
  } catch (error) {
    console.error('[Create Comment] Error:', error);
    return c.json({ error: 'Failed to create comment', details: String(error) }, 500);
  }
});

// Approve comment
app.post('/make-server-2c0f842e/comments/:id/approve', async (c) => {
  const user = await verifyAuth(c.req.raw);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const commentId = c.req.param('id');
    
    const comment = await kv.get(`comment:${commentId}`);
    
    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }

    comment.status = 'approved';
    comment.approvedAt = new Date().toISOString();
    comment.approvedBy = user.email;

    await kv.set(`comment:${commentId}`, comment);

    console.log('[Approve Comment] Approved:', commentId, 'by', user.email);

    return c.json({ success: true, comment });
  } catch (error) {
    console.error('[Approve Comment] Error:', error);
    return c.json({ error: 'Failed to approve comment', details: String(error) }, 500);
  }
});

// ============================================================================
// CONTRIBUTOR STATUS MANAGEMENT
// ============================================================================

// Get all contributor statuses
app.get('/make-server-2c0f842e/contributor-statuses', async (c) => {
  try {
    console.log('[Get Contributor Statuses] Fetching from database...');
    // Fetch all contributor statuses
    let statuses = await kv.getByPrefix('contributor-status:');
    console.log('[Get Contributor Statuses] Found statuses:', statuses.length, statuses);
    
    // If no statuses exist, initialize with default statuses
    if (!statuses || statuses.length === 0) {
      console.log('[Get Contributor Statuses] No statuses found, initializing defaults...');
      const defaultStatuses = [
        { id: 'status-1', value: 'student', label: 'Student', description: 'Current student contributor', order: 1 },
        { id: 'status-2', value: 'teacher', label: 'Teacher', description: 'Faculty member contributor', order: 2 },
        { id: 'status-3', value: 'hi-staff', label: 'HI Staff', description: 'Mosaic Magazine HI staff member', order: 3 },
        { id: 'status-4', value: 'guest', label: 'Guest', description: 'Guest contributor', order: 4 }
      ];
      
      // Store default statuses
      for (const status of defaultStatuses) {
        await kv.set(`contributor-status:${status.id}`, status);
      }
      
      statuses = defaultStatuses;
    }
    
    // Sort by order
    statuses.sort((a: any, b: any) => a.order - b.order);
    
    console.log('[Get Contributor Statuses] Returning statuses:', statuses);
    return c.json({ statuses });
  } catch (error) {
    console.error('[Get Contributor Statuses] Error:', error);
    return c.json({ error: 'Failed to fetch contributor statuses', details: String(error) }, 500);
  }
});

// Create contributor status (admin/editor only)
app.post('/make-server-2c0f842e/contributor-statuses', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { value, label, description } = await c.req.json();
    
    if (!value || !label) {
      return c.json({ error: 'Value and label are required' }, 400);
    }
    
    // Check if value already exists
    const existingStatuses = await kv.getByPrefix('contributor-status:');
    const duplicate = existingStatuses.find((s: any) => s.value === value);
    if (duplicate) {
      return c.json({ error: 'A contributor status with this value already exists' }, 400);
    }
    
    // Generate ID
    const id = `status-${Date.now()}`;
    
    // Get max order
    const maxOrder = existingStatuses.reduce((max: number, s: any) => Math.max(max, s.order || 0), 0);
    
    const newStatus = {
      id,
      value,
      label,
      description: description || '',
      order: maxOrder + 1
    };
    
    await kv.set(`contributor-status:${id}`, newStatus);
    
    // Log audit
    await kv.set(`audit:${Date.now()}-create-status`, {
      action: 'create_contributor_status',
      userId: user.id,
      userName: user.fullName,
      timestamp: new Date().toISOString(),
      details: { statusId: id, label }
    });
    
    return c.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('[Create Contributor Status] Error:', error);
    return c.json({ error: 'Failed to create contributor status', details: String(error) }, 500);
  }
});

// Update contributor status (admin/editor only)
app.put('/make-server-2c0f842e/contributor-statuses/:id', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = c.req.param('id');
    const { value, label, description } = await c.req.json();
    
    if (!value || !label) {
      return c.json({ error: 'Value and label are required' }, 400);
    }
    
    // Get existing status
    const existingStatus = await kv.get(`contributor-status:${id}`);
    if (!existingStatus) {
      return c.json({ error: 'Contributor status not found' }, 404);
    }
    
    // Check if new value conflicts with other statuses
    const allStatuses = await kv.getByPrefix('contributor-status:');
    const duplicate = allStatuses.find((s: any) => s.value === value && s.id !== id);
    if (duplicate) {
      return c.json({ error: 'A contributor status with this value already exists' }, 400);
    }
    
    const updatedStatus = {
      ...existingStatus,
      value,
      label,
      description: description || ''
    };
    
    await kv.set(`contributor-status:${id}`, updatedStatus);
    
    // Log audit
    await kv.set(`audit:${Date.now()}-update-status`, {
      action: 'update_contributor_status',
      userId: user.id,
      userName: user.fullName,
      timestamp: new Date().toISOString(),
      details: { statusId: id, label }
    });
    
    return c.json({ success: true, status: updatedStatus });
  } catch (error) {
    console.error('[Update Contributor Status] Error:', error);
    return c.json({ error: 'Failed to update contributor status', details: String(error) }, 500);
  }
});

// Delete contributor status (admin/editor only)
app.delete('/make-server-2c0f842e/contributor-statuses/:id', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = c.req.param('id');
    
    // Get existing status
    const existingStatus = await kv.get(`contributor-status:${id}`);
    if (!existingStatus) {
      return c.json({ error: 'Contributor status not found' }, 404);
    }
    
    // Delete the status
    await kv.del(`contributor-status:${id}`);
    
    // Log audit
    await kv.set(`audit:${Date.now()}-delete-status`, {
      action: 'delete_contributor_status',
      userId: user.id,
      userName: user.fullName,
      timestamp: new Date().toISOString(),
      details: { statusId: id, label: existingStatus.label }
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.error('[Delete Contributor Status] Error:', error);
    return c.json({ error: 'Failed to delete contributor status', details: String(error) }, 500);
  }
});

// ============================================================================
// CONTENT TYPE MANAGEMENT
// ============================================================================

// Get all content types
app.get('/make-server-2c0f842e/content-types', async (c) => {
  try {
    // Fetch all content types
    let types = await kv.getByPrefix('content-type:');
    
    // If no types exist, initialize with default types
    if (!types || types.length === 0) {
      const defaultTypes = [
        { id: 'type-1', value: 'writing', label: 'Writing', icon: 'FileText', order: 1 },
        { id: 'type-2', value: 'poem', label: 'Poem', icon: 'BookOpen', order: 2 },
        { id: 'type-3', value: 'photography', label: 'Photography', icon: 'Image', order: 3 },
        { id: 'type-4', value: 'visual-art', label: 'Visual Art', icon: 'Palette', order: 4 },
        { id: 'type-5', value: 'crafts', label: 'Crafts', icon: 'Palette', order: 5 },
        { id: 'type-6', value: 'short-story', label: 'Short Story', icon: 'BookOpen', order: 6 },
        { id: 'type-7', value: 'reflection', label: 'Reflection', icon: 'FileText', order: 7 },
        { id: 'type-8', value: 'news', label: 'News', icon: 'Newspaper', order: 8 },
        { id: 'type-9', value: 'opinion', label: 'Opinion', icon: 'MessageSquare', order: 9 }
      ];
      
      // Store default types
      for (const type of defaultTypes) {
        await kv.set(`content-type:${type.id}`, type);
      }
      
      types = defaultTypes;
    }
    
    // Sort by order
    types.sort((a: any, b: any) => a.order - b.order);
    
    return c.json({ types });
  } catch (error) {
    console.error('[Get Content Types] Error:', error);
    return c.json({ error: 'Failed to fetch content types', details: String(error) }, 500);
  }
});

// Create content type (admin/editor only)
app.post('/make-server-2c0f842e/content-types', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { value, label, icon } = await c.req.json();
    
    if (!value || !label) {
      return c.json({ error: 'Value and label are required' }, 400);
    }
    
    // Check if value already exists
    const existingTypes = await kv.getByPrefix('content-type:');
    const duplicate = existingTypes.find((t: any) => t.value === value);
    if (duplicate) {
      return c.json({ error: 'A content type with this value already exists' }, 400);
    }
    
    // Generate ID
    const id = `type-${Date.now()}`;
    
    // Get max order
    const maxOrder = existingTypes.reduce((max: number, t: any) => Math.max(max, t.order || 0), 0);
    
    const newType = {
      id,
      value,
      label,
      icon: icon || 'FileText',
      order: maxOrder + 1
    };
    
    await kv.set(`content-type:${id}`, newType);
    
    // Log audit
    await kv.set(`audit:${Date.now()}-create-type`, {
      action: 'create_content_type',
      userId: user.id,
      userName: user.fullName,
      timestamp: new Date().toISOString(),
      details: { typeId: id, label }
    });
    
    return c.json({ success: true, type: newType });
  } catch (error) {
    console.error('[Create Content Type] Error:', error);
    return c.json({ error: 'Failed to create content type', details: String(error) }, 500);
  }
});

// Update content type (admin/editor only)
app.put('/make-server-2c0f842e/content-types/:id', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = c.req.param('id');
    const { value, label, icon } = await c.req.json();
    
    if (!value || !label) {
      return c.json({ error: 'Value and label are required' }, 400);
    }
    
    // Get existing type
    const existingType = await kv.get(`content-type:${id}`);
    if (!existingType) {
      return c.json({ error: 'Content type not found' }, 404);
    }
    
    // Check if new value conflicts with other types
    const allTypes = await kv.getByPrefix('content-type:');
    const duplicate = allTypes.find((t: any) => t.value === value && t.id !== id);
    if (duplicate) {
      return c.json({ error: 'A content type with this value already exists' }, 400);
    }
    
    const updatedType = {
      ...existingType,
      value,
      label,
      icon: icon || existingType.icon
    };
    
    await kv.set(`content-type:${id}`, updatedType);
    
    // Log audit
    await kv.set(`audit:${Date.now()}-update-type`, {
      action: 'update_content_type',
      userId: user.id,
      userName: user.fullName,
      timestamp: new Date().toISOString(),
      details: { typeId: id, label }
    });
    
    return c.json({ success: true, type: updatedType });
  } catch (error) {
    console.error('[Update Content Type] Error:', error);
    return c.json({ error: 'Failed to update content type', details: String(error) }, 500);
  }
});

// Delete content type (admin/editor only)
app.delete('/make-server-2c0f842e/content-types/:id', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = c.req.param('id');
    
    // Get existing type
    const existingType = await kv.get(`content-type:${id}`);
    if (!existingType) {
      return c.json({ error: 'Content type not found' }, 404);
    }
    
    // Delete the type
    await kv.del(`content-type:${id}`);
    
    // Log audit
    await kv.set(`audit:${Date.now()}-delete-type`, {
      action: 'delete_content_type',
      userId: user.id,
      userName: user.fullName,
      timestamp: new Date().toISOString(),
      details: { typeId: id, label: existingType.label }
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.error('[Delete Content Type] Error:', error);
    return c.json({ error: 'Failed to delete content type', details: String(error) }, 500);
  }
});

// ============================================================================
// START SERVER
// ============================================================================

Deno.serve(app.fetch);
