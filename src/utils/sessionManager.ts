/**
 * Session Management Utilities
 * Handles automatic logout on session expiry
 */

let logoutCallback: (() => void) | null = null;

export function registerLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

export function handleSessionExpiry() {
  if (logoutCallback) {
    console.log('[SessionManager] Session expired, triggering automatic logout');
    alert('Your session has expired. Please log in again.');
    logoutCallback();
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, options);
  
  if (response.status === 401) {
    handleSessionExpiry();
    throw new Error('Session expired');
  }
  
  return response;
}

export function checkSessionExpiry(): boolean {
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  
  if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
    return true; // Expired
  }
  
  return false; // Valid
}
