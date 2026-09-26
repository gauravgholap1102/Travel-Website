/**
 * TravelEase Utilities
 * Reusable Indian Currency Formatter & Helper Functions
 */

/**
 * Reusable Indian Currency Formatter
 * Formats numbers into standard Indian numbering system (e.g. ₹1,00,000, ₹15,000, ₹2,499)
 * NEVER displays USD, EUR, GBP, AED, Dollars, Euros.
 * 
 * @param {number|string} amount 
 * @returns {string} Formatted INR string with '₹'
 */
function formatCurrency(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  
  // Use Intl.NumberFormat with 'en-IN' locale for standard Indian comma placement
  const formatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  });

  return '₹' + formatter.format(num);
}

/**
 * Displays a non-intrusive toast notification on screen
 * @param {string} message 
 * @param {'success'|'info'|'warning'|'error'} type 
 */
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-600 text-white',
    info: 'bg-indigo-600 text-white',
    warning: 'bg-amber-600 text-white',
    error: 'bg-rose-600 text-white'
  };

  const icons = {
    success: 'fa-circle-check',
    info: 'fa-circle-info',
    warning: 'fa-triangle-exclamation',
    error: 'fa-circle-xmark'
  };

  toast.className = `${bgColors[type] || bgColors.info} p-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-4 opacity-0 pointer-events-auto`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info} text-xl"></i>
    <div class="flex-1 text-sm font-medium">${message}</div>
    <button onclick="this.parentElement.remove()" class="text-white/80 hover:text-white">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Generates star rating HTML string
 * @param {number} rating 
 * @returns {string}
 */
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let html = '';
  
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fa-solid fa-star text-amber-400"></i>';
  }
  if (hasHalf) {
    html += '<i class="fa-solid fa-star-half-stroke text-amber-400"></i>';
  }
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="fa-regular fa-star text-amber-400"></i>';
  }
  return html;
}
