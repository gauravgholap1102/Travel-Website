/**
 * TravelEase Authentication Manager
 * Handles user login, registration, session management, and admin role checking using localStorage.
 */

const AUTH_STORAGE_KEY = 'travelease_current_user';
const USERS_STORAGE_KEY = 'travelease_all_users';

// Initialize default test users if missing
function initDefaultUsers() {
  let users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY));
  if (!users || !Array.isArray(users)) {
    users = [
      {
        id: 'u-admin',
        name: 'Gaurav Gholap (Admin)',
        email: 'gauravgholap2005@gmail.com',
        phone: '862383062',
        role: 'admin',
        password: 'admin123',
        createdAt: '2026-01-01'
      },
      {
        id: 'u-demo',
        name: 'Indian Traveler',
        email: 'traveler@india.com',
        phone: '9876543210',
        role: 'user',
        password: 'user123',
        createdAt: '2026-02-15'
      }
    ];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }
}

// Get current logged-in user or null
function getLoggedInUser() {
  const data = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

// Login function
function loginUser(email, password) {
  initDefaultUsers();
  const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
  
  if (!found) {
    return { success: false, message: 'Invalid email or password.' };
  }

  // Save session (excluding password)
  const sessionUser = {
    id: found.id,
    name: found.name,
    email: found.email,
    phone: found.phone,
    role: found.role
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
  return { success: true, user: sessionUser };
}

// Register function
function registerUser(name, email, phone, password) {
  initDefaultUsers();
  const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  
  const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  const newUser = {
    id: 'u-' + Date.now(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim() || '862383062',
    role: 'user',
    password: password,
    createdAt: new Date().toISOString().split('T')[0]
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // Log in user automatically
  const sessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));

  return { success: true, user: sessionUser };
}

// Logout
function logoutUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  showToast('You have logged out successfully.', 'info');
  updateAuthUI();
  // If in admin view, return to home
  if (window.currentView === 'admin') {
    switchView('home');
  }
}

// Update Header / Nav UI based on auth state
function updateAuthUI() {
  const user = getLoggedInUser();
  const authNav = document.getElementById('auth-nav-container');
  const adminTab = document.getElementById('nav-admin-tab');

  if (adminTab) {
    if (user && user.role === 'admin') {
      adminTab.classList.remove('hidden');
    } else {
      adminTab.classList.add('hidden');
    }
  }

  if (authNav) {
    if (user) {
      authNav.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="flex flex-col text-right hidden sm:block">
            <span class="text-xs font-semibold text-emerald-400">${user.role === 'admin' ? '👑 Admin' : '✈️ Traveler'}</span>
            <span class="text-sm font-bold text-white max-w-[120px] truncate">${user.name}</span>
          </div>
          <button onclick="logoutUser()" class="px-3 py-1.5 text-xs font-semibold text-rose-300 border border-rose-500/40 rounded-lg hover:bg-rose-500/20 transition-all">
            Logout
          </button>
        </div>
      `;
    } else {
      authNav.innerHTML = `
        <button onclick="openAuthModal('login')" class="px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-all">
          Sign In
        </button>
        <button onclick="openAuthModal('register')" class="px-4 py-2 text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-gray-900 rounded-xl shadow-lg transition-all">
          Register
        </button>
      `;
    }
  }
}

// Initialize on script load
document.addEventListener('DOMContentLoaded', () => {
  initDefaultUsers();
  updateAuthUI();
});
