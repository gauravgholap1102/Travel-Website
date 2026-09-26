/**
 * TravelEase Trip Budget Calculator with Live Visual Chart
 * Calculates estimated Indian travel budgets with itemized breakdowns in INR (₹)
 * and renders interactive visual progress charts.
 */

function calculateTripBudget() {
  const destSelect = document.getElementById('calc-destination');
  const travelersInput = document.getElementById('calc-travelers');
  const daysInput = document.getElementById('calc-days');
  const hotelSelect = document.getElementById('calc-hotel');
  const foodSelect = document.getElementById('calc-food');
  const transportSelect = document.getElementById('calc-transport');
  const activitiesSelect = document.getElementById('calc-activities');

  if (!travelersInput || !daysInput) return;

  const travelers = Math.max(1, parseInt(travelersInput.value) || 1);
  const days = Math.max(1, parseInt(daysInput.value) || 1);

  // Daily base hotel rates per room (assumes 2 adults per room)
  const hotelRates = {
    budget: 1499,
    threestar: 3200,
    fourstar: 6500,
    fivestar: 14000
  };

  // Food budget rates per person per day
  const foodRates = {
    budget: 450,       // Dhabas & Local Eateries
    standard: 950,     // Mid-range Cafes & Restaurants
    luxury: 2200       // Fine Dining & Resort Restaurants
  };

  // Local transport daily rate per vehicle (max 4 passengers per vehicle)
  const transportRates = {
    public: 400,       // Bus, Metro & Local Auto
    bike: 750,         // Rental Scooter/Bike
    sedan: 2200,       // Private AC Sedan
    suv: 3800          // SUV / Luxury Cab
  };

  // Activities daily rate per person
  const activityRates = {
    basic: 250,        // Free Sights, Temples & Ghats
    moderate: 850,     // Fort Tickets, Boat Rides & Guided Tours
    adventure: 2200    // River Rafting, Scuba, Paragliding, Safari
  };

  // Destination multiplier adjustment
  let destMultiplier = 1.0;
  if (destSelect) {
    const selectedDest = destSelect.value;
    if (['leh-ladakh', 'andaman', 'srinagar', 'meghalaya'].includes(selectedDest)) {
      destMultiplier = 1.25;
    } else if (['goa', 'kerala', 'manali', 'udaipur'].includes(selectedDest)) {
      destMultiplier = 1.1;
    }
  }

  const selectedHotelKey = hotelSelect ? hotelSelect.value : 'threestar';
  const selectedFoodKey = foodSelect ? foodSelect.value : 'standard';
  const selectedTransportKey = transportSelect ? transportSelect.value : 'sedan';
  const selectedActivitiesKey = activitiesSelect ? activitiesSelect.value : 'moderate';

  // Calculations
  const roomsNeeded = Math.ceil(travelers / 2);
  const totalHotelCost = Math.round(roomsNeeded * (hotelRates[selectedHotelKey] || 3200) * days * destMultiplier);
  const totalFoodCost = Math.round(travelers * (foodRates[selectedFoodKey] || 950) * days);
  
  const vehiclesNeeded = Math.ceil(travelers / 4);
  const totalTransportCost = Math.round(vehiclesNeeded * (transportRates[selectedTransportKey] || 2200) * days * destMultiplier);
  const totalActivitiesCost = Math.round(travelers * (activityRates[selectedActivitiesKey] || 850) * days);

  const grandTotal = Math.max(1, totalHotelCost + totalFoodCost + totalTransportCost + totalActivitiesCost);
  const perPersonCost = Math.round(grandTotal / travelers);

  // Update Numeric Elements
  const elHotelCost = document.getElementById('calc-res-hotel');
  const elFoodCost = document.getElementById('calc-res-food');
  const elTransportCost = document.getElementById('calc-res-transport');
  const elActivitiesCost = document.getElementById('calc-res-activities');
  const elGrandTotal = document.getElementById('calc-res-total');
  const elPerPerson = document.getElementById('calc-res-per-person');

  if (elHotelCost) elHotelCost.textContent = formatCurrency(totalHotelCost);
  if (elFoodCost) elFoodCost.textContent = formatCurrency(totalFoodCost);
  if (elTransportCost) elTransportCost.textContent = formatCurrency(totalTransportCost);
  if (elActivitiesCost) elActivitiesCost.textContent = formatCurrency(totalActivitiesCost);
  if (elGrandTotal) elGrandTotal.textContent = formatCurrency(grandTotal);
  if (elPerPerson) elPerPerson.textContent = formatCurrency(perPersonCost);

  // Render Live Visual Chart Progress Bars
  renderLiveBudgetVisualChart({
    hotel: totalHotelCost,
    food: totalFoodCost,
    transport: totalTransportCost,
    activities: totalActivitiesCost,
    total: grandTotal
  });
}

// Render Live Graphic Visual Bars for Breakdown
function renderLiveBudgetVisualChart(costs) {
  const chartContainer = document.getElementById('calc-visual-chart');
  if (!chartContainer) return;

  const hotelPct = Math.round((costs.hotel / costs.total) * 100);
  const foodPct = Math.round((costs.food / costs.total) * 100);
  const transportPct = Math.round((costs.transport / costs.total) * 100);
  const activitiesPct = Math.round((costs.activities / costs.total) * 100);

  chartContainer.innerHTML = `
    <div class="space-y-3 bg-gray-900/80 p-5 rounded-2xl border border-gray-800">
      <div class="flex items-center justify-between text-xs mb-1">
        <span class="font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
          <i class="fa-solid fa-chart-pie text-emerald-400"></i> Live Budget Cost Visualizer
        </span>
        <span class="text-gray-400 font-mono text-[11px]">100% INR Allocation</span>
      </div>

      <!-- Segmented Bar Graphic -->
      <div class="h-4 w-full bg-gray-800 rounded-full overflow-hidden flex shadow-inner border border-gray-700">
        <div style="width: ${hotelPct}%" class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500" title="Hotel: ${hotelPct}%"></div>
        <div style="width: ${foodPct}%" class="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500" title="Food: ${foodPct}%"></div>
        <div style="width: ${transportPct}%" class="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-500" title="Transport: ${transportPct}%"></div>
        <div style="width: ${activitiesPct}%" class="bg-gradient-to-r from-rose-500 to-pink-400 h-full transition-all duration-500" title="Activities: ${activitiesPct}%"></div>
      </div>

      <!-- Graphic Legend Pill Tags -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
        <div class="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/20 p-2 rounded-xl">
          <span class="w-3 h-3 rounded-full bg-emerald-500 shrink-0 shadow"></span>
          <div>
            <span class="text-gray-400 block text-[10px]">Hotel (${hotelPct}%)</span>
            <span class="font-bold text-emerald-400">${formatCurrency(costs.hotel)}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 bg-amber-950/40 border border-amber-500/20 p-2 rounded-xl">
          <span class="w-3 h-3 rounded-full bg-amber-500 shrink-0 shadow"></span>
          <div>
            <span class="text-gray-400 block text-[10px]">Food (${foodPct}%)</span>
            <span class="font-bold text-amber-400">${formatCurrency(costs.food)}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/20 p-2 rounded-xl">
          <span class="w-3 h-3 rounded-full bg-indigo-500 shrink-0 shadow"></span>
          <div>
            <span class="text-gray-400 block text-[10px]">Transport (${transportPct}%)</span>
            <span class="font-bold text-cyan-400">${formatCurrency(costs.transport)}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 bg-rose-950/40 border border-rose-500/20 p-2 rounded-xl">
          <span class="w-3 h-3 rounded-full bg-rose-500 shrink-0 shadow"></span>
          <div>
            <span class="text-gray-400 block text-[10px]">Activities (${activitiesPct}%)</span>
            <span class="font-bold text-rose-400">${formatCurrency(costs.activities)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Bind event listeners to calculator inputs
function setupCalculatorEvents() {
  const calcInputs = [
    'calc-destination', 'calc-travelers', 'calc-days',
    'calc-hotel', 'calc-food', 'calc-transport', 'calc-activities'
  ];

  calcInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', calculateTripBudget);
      el.addEventListener('input', calculateTripBudget);
    }
  });

  // Initial calculation
  calculateTripBudget();
}

document.addEventListener('DOMContentLoaded', () => {
  setupCalculatorEvents();
});
