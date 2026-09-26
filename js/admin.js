/**
 * TravelEase Admin Panel Logic
 * Provides full CRUD and status management for users, bookings, packages, and destinations in localStorage.
 */

const BOOKINGS_STORAGE_KEY = 'travelease_all_bookings';

// Initialize sample bookings if empty
function initSampleBookings() {
  let bookings = JSON.parse(localStorage.getItem(BOOKINGS_STORAGE_KEY));
  if (!bookings || !Array.isArray(bookings)) {
    bookings = [
      {
        id: 'BK-1001',
        customerName: 'Gaurav Gholap',
        customerPhone: '862383062',
        customerEmail: 'gauravgholap2005@gmail.com',
        type: 'Package',
        itemName: 'Goa Beach Escape',
        travelers: 2,
        totalPrice: 19998,
        bookingDate: '2026-09-20',
        status: 'Confirmed'
      },
      {
        id: 'BK-1002',
        customerName: 'Ananya Deshmukh',
        customerPhone: '9822334455',
        customerEmail: 'ananya@gmail.com',
        type: 'Hotel',
        itemName: 'Manali Alpine Pine Retreat',
        travelers: 2,
        totalPrice: 9196,
        bookingDate: '2026-09-22',
        status: 'Confirmed'
      },
      {
        id: 'BK-1003',
        customerName: 'Vikram Singh',
        customerPhone: '9988776655',
        customerEmail: 'vikram@yahoo.com',
        type: 'Flight',
        itemName: 'Delhi → Srinagar (IndiGo)',
        travelers: 1,
        totalPrice: 4999,
        bookingDate: '2026-09-24',
        status: 'Pending'
      }
    ];
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  }
}

// Get all bookings
function getAllBookings() {
  initSampleBookings();
  return JSON.parse(localStorage.getItem(BOOKINGS_STORAGE_KEY)) || [];
}

// Save new booking
function createBooking(bookingData) {
  initSampleBookings();
  const bookings = getAllBookings();
  const newBooking = {
    id: 'BK-' + Math.floor(1000 + Math.random() * 9000),
    customerName: bookingData.customerName || 'Traveler',
    customerPhone: bookingData.customerPhone || '862383062',
    customerEmail: bookingData.customerEmail || 'gauravgholap2005@gmail.com',
    type: bookingData.type || 'Package',
    itemName: bookingData.itemName || 'Custom Booking',
    travelers: bookingData.travelers || 1,
    totalPrice: bookingData.totalPrice || 0,
    bookingDate: new Date().toISOString().split('T')[0],
    status: 'Confirmed'
  };

  bookings.unshift(newBooking);
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  return newBooking;
}

// Render Admin Dashboard Stats & Tables
function renderAdminDashboard() {
  const currentUser = getLoggedInUser();
  const adminContainer = document.getElementById('admin-content-area');
  
  if (!adminContainer) return;

  if (!currentUser || currentUser.role !== 'admin') {
    adminContainer.innerHTML = `
      <div class="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-8 text-center max-w-xl mx-auto my-12 backdrop-blur-md">
        <i class="fa-solid fa-lock text-5xl text-rose-400 mb-4"></i>
        <h3 class="text-2xl font-bold text-white mb-2">Admin Access Required</h3>
        <p class="text-gray-300 text-sm mb-6">You must be logged in as an administrator to access the admin panel.</p>
        <button onclick="openAuthModal('login')" class="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold rounded-xl shadow-lg transition-all">
          Sign In as Admin
        </button>
      </div>
    `;
    return;
  }

  const bookings = getAllBookings();
  const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  
  const totalRevenue = bookings.reduce((sum, b) => b.status === 'Confirmed' ? sum + Number(b.totalPrice) : sum, 0);

  adminContainer.innerHTML = `
    <div class="space-y-8">
      <!-- Admin Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-800/60 p-6 rounded-2xl border border-gray-700/60">
        <div>
          <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-semibold text-xs rounded-full uppercase">Control Center</span>
          <h2 class="text-2xl font-black text-white mt-1">TravelEase Management Dashboard</h2>
          <p class="text-gray-400 text-xs mt-0.5">Manage Users, Bookings, Packages, and Indian Destination Listings</p>
        </div>
        <button onclick="openAddPackageModal()" class="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg transition-all">
          <i class="fa-solid fa-plus"></i> Add Tour Package
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-gray-800/80 p-5 rounded-2xl border border-gray-700/60 shadow-xl">
          <div class="flex items-center justify-between">
            <span class="text-gray-400 text-xs font-medium uppercase">Total Bookings</span>
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg"><i class="fa-solid fa-receipt"></i></div>
          </div>
          <div class="text-3xl font-black text-white mt-2">${bookings.length}</div>
          <div class="text-emerald-400 text-xs mt-1"><i class="fa-solid fa-arrow-trend-up"></i> Active System State</div>
        </div>

        <div class="bg-gray-800/80 p-5 rounded-2xl border border-gray-700/60 shadow-xl">
          <div class="flex items-center justify-between">
            <span class="text-gray-400 text-xs font-medium uppercase">Total Revenue (INR)</span>
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg"><i class="fa-solid fa-indian-rupee-sign"></i></div>
          </div>
          <div class="text-3xl font-black text-amber-400 mt-2">${formatCurrency(totalRevenue)}</div>
          <div class="text-gray-400 text-xs mt-1">From confirmed bookings</div>
        </div>

        <div class="bg-gray-800/80 p-5 rounded-2xl border border-gray-700/60 shadow-xl">
          <div class="flex items-center justify-between">
            <span class="text-gray-400 text-xs font-medium uppercase">Registered Users</span>
            <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg"><i class="fa-solid fa-users"></i></div>
          </div>
          <div class="text-3xl font-black text-white mt-2">${users.length}</div>
          <div class="text-indigo-400 text-xs mt-1">Travelers & Admins</div>
        </div>

        <div class="bg-gray-800/80 p-5 rounded-2xl border border-gray-700/60 shadow-xl">
          <div class="flex items-center justify-between">
            <span class="text-gray-400 text-xs font-medium uppercase">Indian Destinations</span>
            <div class="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-lg"><i class="fa-solid fa-map-location-dot"></i></div>
          </div>
          <div class="text-3xl font-black text-white mt-2">40</div>
          <div class="text-cyan-400 text-xs mt-1">Full database loaded</div>
        </div>
      </div>

      <!-- Bookings Table -->
      <div class="bg-gray-800/80 rounded-2xl border border-gray-700/60 shadow-xl overflow-hidden">
        <div class="p-6 border-b border-gray-700/60 flex items-center justify-between">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-list-check text-emerald-400"></i> Recent Customer Bookings
          </h3>
          <span class="text-xs text-gray-400">Manage status & reservations</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-300">
            <thead class="bg-gray-900/60 text-xs uppercase text-gray-400 font-semibold border-b border-gray-700">
              <tr>
                <th class="p-4">Booking ID</th>
                <th class="p-4">Customer</th>
                <th class="p-4">Item / Details</th>
                <th class="p-4">Travelers</th>
                <th class="p-4">Total Price (INR)</th>
                <th class="p-4">Date</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700/60">
              ${bookings.map(b => `
                <tr class="hover:bg-gray-700/30 transition-all">
                  <td class="p-4 font-mono font-bold text-emerald-400">${b.id}</td>
                  <td class="p-4">
                    <div class="font-bold text-white">${b.customerName}</div>
                    <div class="text-xs text-gray-400">${b.customerPhone}</div>
                  </td>
                  <td class="p-4">
                    <span class="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-gray-700 text-gray-300 mr-1">${b.type}</span>
                    <span class="font-medium text-white">${b.itemName}</span>
                  </td>
                  <td class="p-4 font-semibold text-gray-200">${b.travelers}</td>
                  <td class="p-4 font-bold text-amber-400">${formatCurrency(b.totalPrice)}</td>
                  <td class="p-4 text-xs text-gray-400">${b.bookingDate}</td>
                  <td class="p-4">
                    <span class="px-2.5 py-1 text-xs font-bold rounded-full ${
                      b.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      b.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }">
                      ${b.status}
                    </span>
                  </td>
                  <td class="p-4 text-right space-x-2">
                    ${b.status !== 'Confirmed' ? `
                      <button onclick="updateBookingStatus('${b.id}', 'Confirmed')" class="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all">
                        Approve
                      </button>
                    ` : ''}
                    ${b.status !== 'Cancelled' ? `
                      <button onclick="updateBookingStatus('${b.id}', 'Cancelled')" class="px-2.5 py-1 text-xs font-semibold bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg transition-all">
                        Cancel
                      </button>
                    ` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-gray-800/80 rounded-2xl border border-gray-700/60 shadow-xl overflow-hidden">
        <div class="p-6 border-b border-gray-700/60 flex items-center justify-between">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-users-gear text-indigo-400"></i> Registered Users Management
          </h3>
          <span class="text-xs text-gray-400">System user accounts</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-300">
            <thead class="bg-gray-900/60 text-xs uppercase text-gray-400 font-semibold border-b border-gray-700">
              <tr>
                <th class="p-4">Name</th>
                <th class="p-4">Email</th>
                <th class="p-4">Phone</th>
                <th class="p-4">Role</th>
                <th class="p-4">Joined Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700/60">
              ${users.map(u => `
                <tr class="hover:bg-gray-700/30 transition-all">
                  <td class="p-4 font-bold text-white">${u.name}</td>
                  <td class="p-4 text-gray-300 font-mono text-xs">${u.email}</td>
                  <td class="p-4 text-gray-300">${u.phone || '862383062'}</td>
                  <td class="p-4">
                    <span class="px-2.5 py-1 text-xs font-bold rounded-full ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'}">
                      ${u.role.toUpperCase()}
                    </span>
                  </td>
                  <td class="p-4 text-xs text-gray-400">${u.createdAt || '2026-01-01'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Update booking status
function updateBookingStatus(bookingId, newStatus) {
  const bookings = getAllBookings();
  const target = bookings.find(b => b.id === bookingId);
  if (target) {
    target.status = newStatus;
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    showToast(`Booking ${bookingId} status updated to ${newStatus}.`, 'success');
    renderAdminDashboard();
  }
}
