let items = [];
let myItems = [];
let currentUserId = null;

let selectedMarketItem = null;
let selectedUserItem = null;
let isFullTopup = false;

const itemsGrid = document.getElementById("itemsGrid");
const tradeTypeFilter = document.getElementById("tradeTypeFilter");
const conditionFilter = document.getElementById("conditionFilter");
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const applyFiltersBtn = document.getElementById("applyFilters");
const importExternalBtn = document.getElementById("importExternal");

// Modal refs
const tradeModal = document.getElementById("tradeModal");
const modalItemImg = document.getElementById("modalItemImg");
const modalItemName = document.getElementById("modalItemName");
const modalItemPrice = document.getElementById("modalItemPrice");
const modalItemCondition = document.getElementById("modalItemCondition");
const userItemSelect = document.getElementById("userItemSelect");
const fullTopupBtn = document.getElementById("fullTopupBtn");
const userItemPreview = document.getElementById("userItemPreview");
const userItemImg = document.getElementById("userItemImg");
const userItemName = document.getElementById("userItemName");
const userItemPrice = document.getElementById("userItemPrice");

// Render items
function renderItems(list) {
  itemsGrid.innerHTML = "";
  if (list.length === 0) {
    itemsGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">No items found</p>`;
    return;
  }
  list.forEach(item => {
    const div = document.createElement("div");
    div.className = "bg-white rounded-xl shadow hover:shadow-lg transition p-4";
    const isSold = item.status === 'Sold';
    div.innerHTML = `
      <div class=\"relative w-full mb-3 rounded-md bg-gray-100\" style=\"aspect-ratio: 4/3\">
        <img src=\"${item.img}\" alt=\"${item.name}\" class=\"absolute inset-0 w-full h-full object-contain\">
        ${isSold ? `<div class=\"absolute inset-0 flex items-center justify-center\"><span class=\"px-6 py-2 bg-red-600 bg-opacity-80 text-white text-2xl font-bold rotate-[-12deg]\">SOLD</span></div>` : ''}
      </div>
      <h4 class="text-lg font-semibold">${item.name}</h4>
      <p class="text-gray-600">Ksh ${item.price}</p>
      <p class="text-sm text-gray-500">Condition: ${item.condition}</p>
      <p class="text-sm text-gray-500">Type: ${item.type}</p>
      ${isSold ? `
        <button disabled class=\"mt-3 w-full py-2 bg-gray-400 text-white rounded-lg\">Sold</button>
      ` : `
        <button onclick=\"openModal(${item.id})\" class=\"mt-3 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700\">Trade Now</button>
      `}
    `;
    itemsGrid.appendChild(div);
  });
}

// Apply filters
function applyFilters() {
  const type = tradeTypeFilter.value;
  const cond = conditionFilter.value;
  const min = parseInt(minPrice.value) || 0;
  const max = parseInt(maxPrice.value) || Infinity;

  const filtered = items.filter(item => {
    const matchesType = type === "all" || (item.type || "").toLowerCase() === type.toLowerCase();
    const matchesCond = cond === "all" || (item.condition || "").toLowerCase() === cond.toLowerCase();
    const matchesPrice = item.price >= min && item.price <= max;
    return matchesType && matchesCond && matchesPrice;
  });

  renderItems(filtered);
}

// Open modal
function openModal(id) {
  selectedMarketItem = items.find(i => i.id === id);
  if (!selectedMarketItem) return;
  if (currentUserId && selectedMarketItem.user_id === currentUserId) {
    showModal("You cannot propose a trade on your own item.", "Trade Not Allowed");
    return;
  }

  modalItemImg.src = selectedMarketItem.img;
  modalItemName.textContent = selectedMarketItem.name;
  modalItemPrice.textContent = "Ksh " + selectedMarketItem.price;
  modalItemCondition.textContent = selectedMarketItem.condition;

  // Fill user items
  userItemSelect.innerHTML = `<option value="">-- Select Your Item --</option>`;
  myItems.forEach(i => {
    userItemSelect.innerHTML += `<option value="${i.id}">${i.name} (Ksh ${i.price})</option>`;
  });

  userItemSelect.addEventListener("change", () => {
    const chosen = myItems.find(x => x.id == userItemSelect.value);
    if (chosen) {
      selectedUserItem = chosen;
      isFullTopup = false;
      userItemPreview.classList.remove("hidden");
      userItemImg.src = chosen.img || chosen.image;
      userItemName.textContent = chosen.name;
      userItemPrice.textContent = "Ksh " + chosen.price;
      const diff = selectedMarketItem.price - chosen.price;
      if (diff > 0) {
        showModal("Recommended top-up: Ksh " + diff, "Suggestion");
      }
    } else {
      userItemPreview.classList.add("hidden");
      selectedUserItem = null;
    }
  });

  fullTopupBtn.onclick = () => {
    selectedUserItem = null;
    isFullTopup = true;
    userItemPreview.classList.add("hidden");
    showModal("You chose Full Top-Up option!", "Selection");
  };

  tradeModal.classList.remove("hidden");
}

function closeModal() {
  tradeModal.classList.add("hidden");
}

function confirmTrade() {
  if (!selectedUserItem && !isFullTopup) {
    showModal("Select your item or choose Full Top-Up.", "Missing Selection");
    return;
  }

  const topupAmount = isFullTopup
    ? selectedMarketItem.price
    : Math.max(0, selectedMarketItem.price - (selectedUserItem ? selectedUserItem.price : 0));

  const token = localStorage.getItem("token") || "";
  const body = {
    requested_item_id: selectedMarketItem.id,
    offered_item_id: selectedUserItem ? selectedUserItem.id : null,
    full_topup: isFullTopup
  };
  fetch("/api/trades", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(body) })
    .then(r => { if (!r.ok) throw new Error("fail"); return r.json(); })
    .then(() => { showModal("Trade request sent!", "Success"); closeModal(); })
    .catch(() => showModal("Failed to send trade", "Error"));
}

// Event listeners
applyFiltersBtn.addEventListener("click", applyFilters);

(async function init() {
  const token = localStorage.getItem("token") || "";
  // Show admin import if user is admin
  const meRes = await fetch("/api/users/me", { headers: { "Authorization": `Bearer ${token}` } });
  if (meRes.ok) {
    const me = await meRes.json();
    currentUserId = me && me.id;
    if (me && me.is_admin) {
      importExternalBtn.classList.remove("hidden");
      importExternalBtn.addEventListener("click", async () => {
        const r = await fetch("/api/admin/import-external", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ limit: 24 }) });
        if (r.ok) {
          const itemsRes2 = await fetch("/api/items");
          items = await itemsRes2.json();
          renderItems(items);
          showModal("Imported external products", "Success");
        } else {
          showModal("Failed to import external products", "Error");
        }
      });
    }
  }
  const itemsRes = await fetch("/api/items");
  items = await itemsRes.json();
  renderItems(items);
  const mineRes = await fetch("/api/items/mine", { headers: { "Authorization": `Bearer ${token}` } });
  if (mineRes.ok) myItems = await mineRes.json();

  // If admin and marketplace is empty, auto-import external test data once
  try {
    const me = currentUserId;
    const meInfoRes = await fetch("/api/users/me", { headers: { "Authorization": `Bearer ${token}` } });
    const meInfo = meInfoRes.ok ? await meInfoRes.json() : null;
    if (meInfo && meInfo.is_admin && (!items || items.length === 0)) {
      const r = await fetch("/api/admin/import-external", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ limit: 24 }) });
      if (r.ok) {
        const itemsRes3 = await fetch("/api/items");
        items = await itemsRes3.json();
        renderItems(items);
      }
    }
  } catch {}
})();

// Initial render
renderItems(items);
