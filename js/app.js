/**
 * TravelEase Main Application Logic
 * Orchestrates navigation, filtering, renderers, modals, booking workflows, reviews, and contact form handling.
 */

window.currentView = 'home';
let activeRegionFilter = 'ALL';
let activeTypeFilter = 'ALL';
let activeBudgetFilter = 'ALL';
let searchQuery = '';

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderDestinations();
  renderRegionalBudgets();
  renderPackages();
  renderHotels();
  renderFlights();
  renderInternationalDestinations();
  renderGallery('ALL');
  renderReviews();
  setupFilterEvents();
}

// Navigation View Switcher
function switchView(viewName) {
  window.currentView = viewName;

  // Hide all view sections
  const sections = document.querySelectorAll('.view-section');
  sections.forEach(sec => sec.classList.add('hidden'));

  // Show target section
  const target = document.getElementById(`view-${viewName}`);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update navigation tab highlights
  const navTabs = document.querySelectorAll('.nav-tab-btn');
  navTabs.forEach(tab => {
    if (tab.dataset.view === viewName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Re-render Admin if switching to admin view
  if (viewName === 'admin') {
    renderAdminDashboard();
  }
}

// Setup Filters & Search Events
function setupFilterEvents() {
  const searchInput = document.getElementById('search-destinations-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderDestinations();
    });
  }

  const regionSelect = document.getElementById('filter-region');
  if (regionSelect) {
    regionSelect.addEventListener('change', (e) => {
      activeRegionFilter = e.target.value;
      renderDestinations();
    });
  }

  const typeSelect = document.getElementById('filter-type');
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      activeTypeFilter = e.target.value;
      renderDestinations();
    });
  }

  const budgetSelect = document.getElementById('filter-budget');
  if (budgetSelect) {
    budgetSelect.addEventListener('change', (e) => {
      activeBudgetFilter = e.target.value;
      renderDestinations();
    });
  }
}

// Filter Logic for 40 Destinations
function getFilteredDestinations() {
  return INITIAL_DESTINATIONS.filter(dest => {
    // Search Query
    if (searchQuery) {
      const matchName = dest.name.toLowerCase().includes(searchQuery);
      const matchCity = dest.cityState.toLowerCase().includes(searchQuery);
      const matchAttraction = dest.attractions.some(a => a.toLowerCase().includes(searchQuery));
      if (!matchName && !matchCity && !matchAttraction) return false;
    }

    // Region Filter
    if (activeRegionFilter !== 'ALL' && dest.region !== activeRegionFilter) {
      return false;
    }

    // Travel Type Filter
    if (activeTypeFilter !== 'ALL' && dest.travelType !== activeTypeFilter) {
      return false;
    }

    // Budget Filter Range
    if (activeBudgetFilter !== 'ALL') {
      const b = dest.budgetStarting;
      if (activeBudgetFilter === 'under-5000' && b >= 5000) return false;
      if (activeBudgetFilter === '5000-10000' && (b < 5000 || b > 10000)) return false;
      if (activeBudgetFilter === '10000-20000' && (b < 10000 || b > 20000)) return false;
      if (activeBudgetFilter === '20000-50000' && (b < 20000 || b > 50000)) return false;
      if (activeBudgetFilter === '50000-plus' && b < 50000) return false;
    }

    return true;
  });
}

// Render Destination Cards Grid
function renderDestinations() {
  const container = document.getElementById('destinations-grid');
  const countBadge = document.getElementById('destinations-count-badge');
  const homePopularGrid = document.getElementById('home-popular-destinations-grid');
  
  const filtered = getFilteredDestinations();

  if (countBadge) {
    countBadge.textContent = `Showing ${filtered.length} of ${INITIAL_DESTINATIONS.length} Indian Destinations`;
  }

  // Render Homepage Featured Cards (Popular subset)
  if (homePopularGrid) {
    const populars = INITIAL_DESTINATIONS.filter(d => d.isPopular).slice(0, 6);
    homePopularGrid.innerHTML = populars.map(d => renderDestinationCardHTML(d)).join('');
  }

  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full bg-gray-800/60 p-12 text-center rounded-3xl border border-gray-700/60 my-6">
        <i class="fa-solid fa-compass-slash text-5xl text-emerald-400 mb-4"></i>
        <h4 class="text-xl font-bold text-white mb-1">No Indian Destinations Found</h4>
        <p class="text-gray-400 text-sm mb-4">Try clearing your search query or adjusting region/budget filters.</p>
        <button onclick="resetFilters()" class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold rounded-xl text-sm transition-all">
          Reset All Filters
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(d => renderDestinationCardHTML(d)).join('');
}

// Helper: Single Destination Card HTML Component
function renderDestinationCardHTML(dest) {
  return `
    <div class="glass-card rounded-2xl overflow-hidden flex flex-col transition-all duration-300 group">
      <!-- Image Container -->
      <div class="relative h-56 overflow-hidden">
        <img src="${dest.image}" alt="${dest.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <div class="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-transparent to-black/30"></div>
        
        <!-- Badges -->
        <span class="absolute top-3 left-3 px-3 py-1 bg-emerald-600/90 backdrop-blur-md text-white font-bold text-xs rounded-full shadow-lg">
          ${dest.region}
        </span>
        <span class="absolute top-3 right-3 px-3 py-1 bg-gray-900/80 backdrop-blur-md text-emerald-400 font-bold text-xs rounded-full border border-emerald-500/30">
          ${dest.travelType}
        </span>

        <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <h3 class="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">${dest.name}</h3>
            <span class="text-xs text-gray-300 flex items-center gap-1"><i class="fa-solid fa-location-dot text-rose-400"></i> ${dest.cityState}</span>
          </div>
          <div class="bg-gray-900/90 px-2.5 py-1 rounded-xl text-xs font-bold text-amber-400 flex items-center gap-1 border border-amber-500/20">
            <i class="fa-solid fa-star"></i> ${dest.rating}
          </div>
        </div>
      </div>

      <!-- Card Body -->
      <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
        <p class="text-xs text-gray-300 line-clamp-2 leading-relaxed">${dest.shortDesc}</p>

        <!-- Travel Metadata Grid -->
        <div class="grid grid-cols-2 gap-2 text-xs bg-gray-900/50 p-3 rounded-xl border border-gray-800">
          <div>
            <span class="text-gray-400 block text-[10px] uppercase font-semibold">Best Time</span>
            <span class="font-bold text-white">${dest.bestTime}</span>
          </div>
          <div>
            <span class="text-gray-400 block text-[10px] uppercase font-semibold">Ideal Duration</span>
            <span class="font-bold text-emerald-400">${dest.numDays}</span>
          </div>
          <div>
            <span class="text-gray-400 block text-[10px] uppercase font-semibold">Budget Starting</span>
            <span class="font-extrabold text-amber-400">${formatCurrency(dest.budgetStarting)}</span>
          </div>
          <div>
            <span class="text-gray-400 block text-[10px] uppercase font-semibold">Avg Daily Budget</span>
            <span class="font-bold text-gray-200">${formatCurrency(dest.avgDailyBudget)}/day</span>
          </div>
        </div>

        <!-- Attractions Tags -->
        <div class="space-y-1.5">
          <span class="text-[10px] uppercase font-bold text-gray-400 block">Popular Attractions:</span>
          <div class="flex flex-wrap gap-1">
            ${dest.attractions.slice(0, 4).map(att => `
              <span class="px-2 py-0.5 bg-gray-800 text-gray-300 text-[11px] rounded-md font-medium border border-gray-700/60">${att}</span>
            `).join('')}
          </div>
        </div>

        <!-- Card Footer Action -->
        <div class="pt-2 flex items-center gap-2">
          <button onclick="openDestinationDetailModal('${dest.id}')" class="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1">
            <i class="fa-solid fa-compass"></i> Explore Destination
          </button>
          <button onclick="openBookingModal('Package', '${dest.name} Tour Package', ${dest.budgetStarting})" class="px-3 py-2.5 bg-gray-800 hover:bg-gray-700 text-emerald-400 rounded-xl border border-emerald-500/30 text-xs font-bold transition-all" title="Quick Book">
            <i class="fa-solid fa-bolt"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

// Reset Filters
function resetFilters() {
  activeRegionFilter = 'ALL';
  activeTypeFilter = 'ALL';
  activeBudgetFilter = 'ALL';
  searchQuery = '';

  const sInput = document.getElementById('search-destinations-input');
  if (sInput) sInput.value = '';

  const rSelect = document.getElementById('filter-region');
  if (rSelect) rSelect.value = 'ALL';

  const tSelect = document.getElementById('filter-type');
  if (tSelect) tSelect.value = 'ALL';

  const bSelect = document.getElementById('filter-budget');
  if (bSelect) bSelect.value = 'ALL';

  renderDestinations();
}

// Render Demo Regional Budget Guides
function renderRegionalBudgets() {
  const container = document.getElementById('regional-budgets-grid');
  if (!container) return;

  container.innerHTML = DEMO_REGIONAL_BUDGETS.map(b => `
    <div class="glass-card p-6 rounded-2xl border border-gray-800 space-y-4 hover:border-emerald-500/40 transition-all">
      <div class="flex items-center justify-between border-b border-gray-800 pb-3">
        <div>
          <h4 class="text-xl font-black text-white">${b.destination}</h4>
          <span class="text-xs text-emerald-400 font-semibold">${b.duration}</span>
        </div>
        <span class="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full border border-amber-500/30">
          DEMO BUDGET
        </span>
      </div>

      <div class="space-y-2 text-xs">
        <div class="flex justify-between items-center bg-gray-900/60 p-2.5 rounded-xl">
          <span class="text-gray-400 font-medium">Budget Traveler:</span>
          <span class="font-extrabold text-emerald-400">${b.budgetRange}</span>
        </div>
        <div class="flex justify-between items-center bg-gray-900/60 p-2.5 rounded-xl">
          <span class="text-gray-400 font-medium">Mid-Range Comfort:</span>
          <span class="font-extrabold text-amber-400">${b.midRange}</span>
        </div>
        <div class="flex justify-between items-center bg-gray-900/60 p-2.5 rounded-xl">
          <span class="text-gray-400 font-medium">Luxury Stay:</span>
          <span class="font-extrabold text-purple-400">${b.luxury}</span>
        </div>
      </div>

      <div>
        <span class="text-[10px] uppercase font-bold text-gray-400 block mb-1.5">Includes Key Places:</span>
        <div class="flex flex-wrap gap-1">
          ${b.places.map(p => `
            <span class="px-2 py-0.5 bg-gray-800 text-gray-300 text-[11px] rounded-md font-medium border border-gray-700">${p}</span>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

// Render Preset Tour Packages
function renderPackages() {
  const container = document.getElementById('tour-packages-grid');
  if (!container) return;

  container.innerHTML = INITIAL_PACKAGES.map(pkg => `
    <div class="glass-card rounded-2xl overflow-hidden flex flex-col group border border-gray-800 hover:border-emerald-500/40 transition-all">
      <div class="relative h-48 overflow-hidden">
        <img src="${pkg.image}" alt="${pkg.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/20"></div>
        <span class="absolute top-3 right-3 px-3 py-1 bg-amber-500/90 text-gray-950 font-black text-[10px] uppercase rounded-full shadow">
          ${pkg.tag}
        </span>
        <div class="absolute bottom-3 left-3 right-3">
          <h4 class="text-lg font-black text-white">${pkg.title}</h4>
          <span class="text-xs text-emerald-400 font-semibold"><i class="fa-regular fa-clock"></i> ${pkg.duration}</span>
        </div>
      </div>

      <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div class="space-y-2">
          <span class="text-[10px] uppercase font-bold text-gray-400 block">Package Highlights:</span>
          <ul class="text-xs space-y-1 text-gray-300">
            ${pkg.inclusions.map(inc => `
              <li class="flex items-center gap-2"><i class="fa-solid fa-circle-check text-emerald-400 text-[10px]"></i> ${inc}</li>
            `).join('')}
          </ul>
        </div>

        <div class="pt-3 border-t border-gray-800 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-gray-400 uppercase font-bold block">Starting From</span>
            <span class="text-xl font-black text-amber-400">${formatCurrency(pkg.pricePerPerson)}</span>
            <span class="text-[10px] text-gray-400 block">/ person</span>
          </div>
          <button onclick="openBookingModal('Package', '${pkg.title}', ${pkg.pricePerPerson})" class="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-extrabold text-xs rounded-xl shadow-lg transition-all">
            Book Package
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Render Hotels
function renderHotels() {
  const container = document.getElementById('hotels-grid');
  if (!container) return;

  container.innerHTML = SAMPLE_HOTELS.map(h => `
    <div class="glass-card rounded-2xl overflow-hidden border border-gray-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
      <div class="relative h-44">
        <img src="${h.image}" alt="${h.name}" class="w-full h-full object-cover">
        <div class="absolute top-3 left-3 px-2.5 py-1 bg-gray-900/80 backdrop-blur-md text-amber-400 font-bold text-xs rounded-lg border border-amber-500/20">
          ${h.tier}
        </div>
      </div>
      <div class="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-1">
            <h4 class="font-bold text-white text-base">${h.name}</h4>
            <span class="text-xs font-bold text-amber-400 flex items-center gap-1"><i class="fa-solid fa-star"></i> ${h.rating}</span>
          </div>
          <span class="text-xs text-gray-400 block mb-2"><i class="fa-solid fa-location-dot text-rose-400"></i> ${h.city}, India</span>
          
          <div class="flex flex-wrap gap-1">
            ${h.amenities.map(am => `
              <span class="px-2 py-0.5 bg-gray-800 text-gray-300 text-[10px] rounded font-medium">${am}</span>
            `).join('')}
          </div>
        </div>

        <div class="pt-3 border-t border-gray-800 flex items-center justify-between">
          <div>
            <span class="text-lg font-black text-emerald-400">${formatCurrency(h.pricePerNight)}</span>
            <span class="text-[10px] text-gray-400">/ night</span>
          </div>
          <button onclick="openBookingModal('Hotel', '${h.name}', ${h.pricePerNight})" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold text-xs rounded-xl transition-all">
            Book Hotel
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Render Flights
function renderFlights() {
  const container = document.getElementById('flights-list-container');
  if (!container) return;

  container.innerHTML = SAMPLE_FLIGHTS.map(f => `
    <div class="glass-card p-5 rounded-2xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-500/40 transition-all">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-black">
          <i class="fa-solid fa-plane"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-white text-base">${f.origin}</span>
            <i class="fa-solid fa-arrow-right text-emerald-400 text-xs"></i>
            <span class="font-extrabold text-white text-base">${f.destination}</span>
          </div>
          <div class="text-xs text-gray-400 mt-0.5">
            <span class="font-semibold text-gray-300">${f.airline}</span> • ${f.flightNo} • ${f.duration}
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-gray-800 pt-3 md:pt-0">
        <div>
          <span class="text-[10px] text-gray-400 uppercase font-bold block">Starting Fare</span>
          <span class="text-xl font-black text-emerald-400">${formatCurrency(f.startingPrice)}</span>
        </div>
        <button onclick="openBookingModal('Flight', '${f.origin} to ${f.destination} (${f.airline})', ${f.startingPrice})" class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-extrabold text-xs rounded-xl shadow-lg transition-all">
          Book Flight
        </button>
      </div>
    </div>
  `).join('');
}

// Render International Destinations
function renderInternationalDestinations() {
  const container = document.getElementById('international-destinations-grid');
  if (!container) return;

  container.innerHTML = INTERNATIONAL_DESTINATIONS.map(intl => `
    <div class="glass-card rounded-2xl overflow-hidden border border-gray-800 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
      <div class="relative h-44">
        <img src="${intl.image}" alt="${intl.name}" class="w-full h-full object-cover">
        <span class="absolute top-3 right-3 px-3 py-1 bg-gray-900/80 backdrop-blur-md text-emerald-400 font-bold text-xs rounded-full border border-emerald-500/30">
          Secondary Option
        </span>
      </div>
      <div class="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <h4 class="font-bold text-white text-lg">${intl.name}, ${intl.country}</h4>
          <p class="text-xs text-gray-400 mt-1">${intl.shortDesc}</p>
        </div>
        <div class="pt-3 border-t border-gray-800 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-gray-400 uppercase font-bold block">Starting From</span>
            <span class="text-lg font-black text-amber-400">${formatCurrency(intl.priceStarting)}</span>
          </div>
          <button onclick="openBookingModal('Package', '${intl.name} International Tour', ${intl.priceStarting})" class="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30 transition-all">
            Inquire
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Photo Gallery Renderer
function renderGallery(filterCategory = 'ALL') {
  const container = document.getElementById('gallery-grid');
  if (!container) return;

  const filtered = filterCategory === 'ALL' ? GALLERY_ITEMS : GALLERY_ITEMS.filter(g => g.category === filterCategory);

  container.innerHTML = filtered.map(item => `
    <div class="relative h-64 rounded-2xl overflow-hidden group border border-gray-800 cursor-pointer shadow-lg" onclick="openLightbox('${item.image}', '${item.title}', '${item.location}')">
      <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
      <div class="absolute bottom-4 left-4 right-4">
        <span class="px-2.5 py-0.5 bg-emerald-500 text-gray-950 font-black text-[10px] uppercase rounded-md">${item.category}</span>
        <h4 class="text-lg font-bold text-white mt-1">${item.title}</h4>
        <span class="text-xs text-gray-300"><i class="fa-solid fa-location-dot text-rose-400"></i> ${item.location}</span>
      </div>
    </div>
  `).join('');
}

function filterGallery(category) {
  const btns = document.querySelectorAll('.gallery-filter-btn');
  btns.forEach(b => {
    if (b.dataset.category === category) {
      b.classList.add('bg-emerald-500', 'text-gray-950');
      b.classList.remove('bg-gray-800', 'text-gray-300');
    } else {
      b.classList.remove('bg-emerald-500', 'text-gray-950');
      b.classList.add('bg-gray-800', 'text-gray-300');
    }
  });
  renderGallery(category);
}

// Lightbox Modal
function openLightbox(src, title, location) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  const locEl = document.getElementById('lightbox-location');

  if (modal && img) {
    img.src = src;
    if (titleEl) titleEl.textContent = title;
    if (locEl) locEl.textContent = location;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Reviews System
function renderReviews() {
  const container = document.getElementById('reviews-list-container');
  if (!container) return;

  const reviews = JSON.parse(localStorage.getItem('travelease_reviews')) || INITIAL_REVIEWS;

  container.innerHTML = reviews.map(r => `
    <div class="glass-card p-6 rounded-2xl border border-gray-800 space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-bold text-white text-base">${r.userName}</h4>
          <span class="text-xs text-gray-400">${r.userCity} • Destination: <strong class="text-emerald-400">${r.destination}</strong></span>
        </div>
        <div class="flex gap-1 text-sm">${renderStars(r.rating)}</div>
      </div>
      <p class="text-sm text-gray-300 italic leading-relaxed">"${r.comment}"</p>
      <div class="text-[10px] text-gray-500">${r.date}</div>
    </div>
  `).join('');
}

function handleReviewSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('rev-input-name').value;
  const city = document.getElementById('rev-input-city').value;
  const dest = document.getElementById('rev-input-dest').value;
  const rating = parseInt(document.getElementById('rev-input-rating').value) || 5;
  const comment = document.getElementById('rev-input-comment').value;

  const reviews = JSON.parse(localStorage.getItem('travelease_reviews')) || INITIAL_REVIEWS;

  const newRev = {
    id: 'rev-' + Date.now(),
    userName: name,
    userCity: city,
    destination: dest,
    rating: rating,
    date: new Date().toISOString().split('T')[0],
    comment: comment
  };

  reviews.unshift(newRev);
  localStorage.setItem('travelease_reviews', JSON.stringify(reviews));

  showToast('Thank you for sharing your travel experience!', 'success');
  document.getElementById('review-form').reset();
  renderReviews();
}

// Contact Form Handler
function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('contact-name').value;
  const phone = document.getElementById('contact-phone').value;

  showToast(`Thank you, ${name}! Gaurav Gholap's travel team will contact you shortly at ${phone}.`, 'success');
  document.getElementById('contact-form').reset();
}

// Destination Detail Modal
function openDestinationDetailModal(destId) {
  const dest = INITIAL_DESTINATIONS.find(d => d.id === destId);
  if (!dest) return;

  const modal = document.getElementById('destination-modal');
  const body = document.getElementById('destination-modal-body');

  if (!modal || !body) return;

  body.innerHTML = `
    <div class="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-6">
      <img src="${dest.image}" alt="${dest.name}" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-black/40 to-transparent"></div>
      <button onclick="closeDestinationModal()" class="absolute top-4 right-4 w-9 h-9 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full flex items-center justify-center transition-all">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="absolute bottom-4 left-6 right-6">
        <span class="px-3 py-1 bg-emerald-500 text-gray-950 font-black text-xs uppercase rounded-full">${dest.region}</span>
        <h2 class="text-3xl font-black text-white mt-1">${dest.name}</h2>
        <span class="text-sm text-gray-300"><i class="fa-solid fa-location-dot text-rose-400"></i> ${dest.cityState}</span>
      </div>
    </div>

    <div class="space-y-6">
      <p class="text-gray-300 text-sm leading-relaxed">${dest.shortDesc}</p>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-900/60 p-4 rounded-2xl border border-gray-800 text-xs">
        <div>
          <span class="text-gray-400 uppercase font-bold text-[10px] block">Best Time</span>
          <span class="font-bold text-white">${dest.bestTime}</span>
        </div>
        <div>
          <span class="text-gray-400 uppercase font-bold text-[10px] block">Duration</span>
          <span class="font-bold text-emerald-400">${dest.numDays}</span>
        </div>
        <div>
          <span class="text-gray-400 uppercase font-bold text-[10px] block">Starting Budget</span>
          <span class="font-black text-amber-400">${formatCurrency(dest.budgetStarting)}</span>
        </div>
        <div>
          <span class="text-gray-400 uppercase font-bold text-[10px] block">Daily Average</span>
          <span class="font-bold text-gray-200">${formatCurrency(dest.avgDailyBudget)}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gray-900/40 p-4 rounded-2xl border border-gray-800">
          <h4 class="font-bold text-white text-sm mb-2 flex items-center gap-2"><i class="fa-solid fa-camera text-emerald-400"></i> Popular Attractions</h4>
          <ul class="text-xs space-y-1 text-gray-300">
            ${dest.attractions.map(a => `<li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400 text-[10px]"></i> ${a}</li>`).join('')}
          </ul>
        </div>

        <div class="bg-gray-900/40 p-4 rounded-2xl border border-gray-800">
          <h4 class="font-bold text-white text-sm mb-2 flex items-center gap-2"><i class="fa-solid fa-person-hiking text-amber-400"></i> Popular Activities</h4>
          <ul class="text-xs space-y-1 text-gray-300">
            ${dest.activities.map(act => `<li class="flex items-center gap-2"><i class="fa-solid fa-star text-amber-400 text-[10px]"></i> ${act}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="pt-4 border-t border-gray-800 flex items-center justify-between">
        <div>
          <span class="text-xs text-gray-400 block">Starting Tour Price</span>
          <span class="text-2xl font-black text-amber-400">${formatCurrency(dest.budgetStarting)}</span>
        </div>
        <button onclick="closeDestinationModal(); openBookingModal('Package', '${dest.name} Tour Package', ${dest.budgetStarting})" class="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black rounded-xl shadow-lg transition-all">
          Book Package Now
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeDestinationModal() {
  const modal = document.getElementById('destination-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Booking Modal Logic
function openBookingModal(type, itemName, basePrice) {
  const user = getLoggedInUser();
  const modal = document.getElementById('booking-modal');
  const body = document.getElementById('booking-modal-body');

  if (!modal || !body) return;

  body.innerHTML = `
    <div class="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
      <div>
        <span class="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase rounded">${type} Booking</span>
        <h3 class="text-xl font-black text-white mt-1">${itemName}</h3>
      </div>
      <button onclick="closeBookingModal()" class="text-gray-400 hover:text-white text-xl">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <form onsubmit="handleBookingSubmit(event, '${type}', '${itemName}', ${basePrice})" class="space-y-4">
      <div>
        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
        <input type="text" id="bm-name" value="${user ? user.name : 'Gaurav Gholap'}" required class="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
          <input type="tel" id="bm-phone" value="${user ? user.phone : '862383062'}" required class="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
          <input type="email" id="bm-email" value="${user ? user.email : 'gauravgholap2005@gmail.com'}" required class="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Number of Travelers</label>
          <input type="number" id="bm-travelers" value="1" min="1" max="20" required onchange="updateBookingTotal(${basePrice})" oninput="updateBookingTotal(${basePrice})" class="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Travel Date</label>
          <input type="date" id="bm-date" required class="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
        </div>
      </div>

      <div class="bg-gray-900/60 p-4 rounded-xl border border-gray-800 flex items-center justify-between">
        <div>
          <span class="text-xs text-gray-400 uppercase font-bold block">Total Amount (INR)</span>
          <span id="bm-total-price" class="text-2xl font-black text-amber-400">${formatCurrency(basePrice)}</span>
        </div>
        <span class="text-[11px] text-emerald-400 font-semibold">Includes All Taxes (INR)</span>
      </div>

      <button type="submit" class="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black rounded-xl shadow-lg transition-all text-sm">
        Confirm Reservation
      </button>
    </form>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Set default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateEl = document.getElementById('bm-date');
  if (dateEl) dateEl.value = tomorrow.toISOString().split('T')[0];
}

function updateBookingTotal(basePrice) {
  const travelersInput = document.getElementById('bm-travelers');
  const priceEl = document.getElementById('bm-total-price');
  if (travelersInput && priceEl) {
    const count = Math.max(1, parseInt(travelersInput.value) || 1);
    priceEl.textContent = formatCurrency(count * basePrice);
  }
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleBookingSubmit(e, type, itemName, basePrice) {
  e.preventDefault();
  const name = document.getElementById('bm-name').value;
  const phone = document.getElementById('bm-phone').value;
  const email = document.getElementById('bm-email').value;
  const travelers = parseInt(document.getElementById('bm-travelers').value) || 1;

  const total = travelers * basePrice;

  const newBooking = createBooking({
    customerName: name,
    customerPhone: phone,
    customerEmail: email,
    type: type,
    itemName: itemName,
    travelers: travelers,
    totalPrice: total
  });

  closeBookingModal();
  showToast(`Booking ${newBooking.id} created successfully! Total: ${formatCurrency(total)}`, 'success');
}

// Auth Modal Trigger
function openAuthModal(mode = 'login') {
  const modal = document.getElementById('auth-modal');
  const body = document.getElementById('auth-modal-body');

  if (!modal || !body) return;

  if (mode === 'login') {
    body.innerHTML = `
      <div class="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
        <h3 class="text-xl font-black text-white">Sign In to TravelEase</h3>
        <button onclick="closeAuthModal()" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <form onsubmit="handleLoginSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
          <input type="email" id="auth-email" required placeholder="gauravgholap2005@gmail.com" class="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
          <input type="password" id="auth-password" required placeholder="••••••••" class="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
        </div>
        <button type="submit" class="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black rounded-xl shadow-lg transition-all text-sm">
          Sign In
        </button>
      </form>
      <div class="mt-4 text-center text-xs text-gray-400">
        Demo Admin: <code class="text-emerald-400 font-mono">gauravgholap2005@gmail.com</code> / <code class="text-emerald-400 font-mono">admin123</code>
      </div>
      <div class="mt-2 text-center text-xs text-gray-400">
        Don't have an account? <button onclick="openAuthModal('register')" class="text-emerald-400 font-bold hover:underline">Register now</button>
      </div>
    `;
  } else {
    body.innerHTML = `
      <div class="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
        <h3 class="text-xl font-black text-white">Create Traveler Account</h3>
        <button onclick="closeAuthModal()" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <form onsubmit="handleRegisterSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
          <input type="text" id="reg-name" required placeholder="Gaurav Gholap" class="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
          <input type="email" id="reg-email" required placeholder="gauravgholap2005@gmail.com" class="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
          <input type="tel" id="reg-phone" required placeholder="862383062" value="862383062" class="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
          <input type="password" id="reg-password" required placeholder="••••••••" class="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
        </div>
        <button type="submit" class="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black rounded-xl shadow-lg transition-all text-sm">
          Create Account
        </button>
      </form>
    `;
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-password').value;

  const res = loginUser(email, pass);
  if (res.success) {
    closeAuthModal();
    updateAuthUI();
    showToast(`Welcome back, ${res.user.name}!`, 'success');
  } else {
    showToast(res.message, 'error');
  }
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const phone = document.getElementById('reg-phone').value;
  const pass = document.getElementById('reg-password').value;

  const res = registerUser(name, email, phone, pass);
  if (res.success) {
    closeAuthModal();
    updateAuthUI();
    showToast(`Account created successfully! Welcome to TravelEase, ${res.user.name}.`, 'success');
  } else {
    showToast(res.message, 'error');
  }
}

// Generate Travel Itinerary
function generateCustomItinerary() {
  const destSelect = document.getElementById('itin-destination');
  const daysSelect = document.getElementById('itin-days');
  const displayContainer = document.getElementById('itin-result-container');

  if (!destSelect || !daysSelect || !displayContainer) return;

  const destId = destSelect.value;
  const days = parseInt(daysSelect.value) || 3;

  const dest = INITIAL_DESTINATIONS.find(d => d.id === destId) || INITIAL_DESTINATIONS[0];

  let itineraryHTML = `
    <div class="bg-gray-900/80 p-6 rounded-2xl border border-gray-800 space-y-6">
      <div class="flex items-center justify-between border-b border-gray-800 pb-4">
        <div>
          <span class="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase rounded">Custom Itinerary</span>
          <h3 class="text-2xl font-black text-white mt-1">${dest.name} — ${days} Days Travel Plan</h3>
          <p class="text-xs text-gray-400">${dest.cityState} • Starting Budget: ${formatCurrency(dest.budgetStarting)}</p>
        </div>
        <button onclick="window.print()" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30 flex items-center gap-2 transition-all">
          <i class="fa-solid fa-print"></i> Print / Save PDF
        </button>
      </div>

      <div class="space-y-4">
  `;

  for (let d = 1; d <= days; d++) {
    const attraction = dest.attractions[(d - 1) % dest.attractions.length] || "Local Sightseeing";
    const activity = dest.activities[(d - 1) % dest.activities.length] || "Cultural Exploration";

    itineraryHTML += `
      <div class="bg-gray-800/50 p-4 rounded-xl border border-gray-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-emerald-500 text-gray-950 font-black flex items-center justify-center text-sm shrink-0">
            Day ${d}
          </div>
          <div>
            <h4 class="font-bold text-white text-base">Explore ${attraction} & ${activity}</h4>
            <p class="text-xs text-gray-300 mt-1">Enjoy breakfast at hotel, followed by guided tour of ${attraction}. Afternoon feature: ${activity}.</p>
          </div>
        </div>
        <div class="text-right shrink-0 text-xs">
          <span class="text-amber-400 font-bold block">Est. Daily Budget</span>
          <span class="text-gray-300 font-semibold">${formatCurrency(dest.avgDailyBudget)}</span>
        </div>
      </div>
    `;
  }

  itineraryHTML += `
      </div>
    </div>
  `;

  displayContainer.innerHTML = itineraryHTML;
}
