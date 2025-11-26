let items = [];
let myItems = [];
const modal = document.getElementById("tradeModal");
const selectedItemDisplay = document.getElementById("selectedItem");
const closeModal = document.getElementById("closeModal");
const confirmTrade = document.getElementById("confirmTrade");
const userItemSelect = document.getElementById("userItem");
let selectedItem = null;
let currentUserId = null;
let currentUserName = "";

function renderRecent(list) {
  const grid = document.getElementById("recentItemsGrid");
  grid.innerHTML = "";
  list.slice(0, 6).forEach(item => {
    const div = document.createElement("div");
    div.className = "bg-white rounded-xl shadow hover:shadow-lg transition p-4";
    const isSold = item.status === 'Sold';
    div.innerHTML = `
      <div class=\"relative w-full h-44 mb-3\">
        <img src=\"${item.img || "https://via.placeholder.com/200"}\" alt=\"${item.name}\" class=\"absolute inset-0 w-full h-full object-cover rounded-md\">
        ${isSold ? `<div class=\"absolute inset-0 flex items-center justify-center\"><span class=\"px-6 py-2 bg-red-600 bg-opacity-80 text-white text-2xl font-bold rotate-[-12deg]\">SOLD</span></div>` : ''}
      </div>
      <h4 class="text-lg font-semibold">${item.name}</h4>
      <p class="text-gray-600">Ksh ${item.price}</p>
      ${isSold ? `<button disabled class=\"mt-3 w-full py-2 bg-gray-400 text-white rounded-lg\">Sold</button>` : `
        <button class=\"mt-3 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700\" data-id=\"${item.id}\">
          Trade Now
        </button>
      `}
    `;
    grid.appendChild(div);
  });
  Array.from(grid.querySelectorAll("button[data-id]")) .forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id, 10);
      selectedItem = items.find(i => i.id === id);
      if (currentUserId && selectedItem && selectedItem.user_id === currentUserId) { showModal("You cannot trade on your own item.", "Trade Not Allowed"); return; }
      selectedItemDisplay.textContent = selectedItem ? selectedItem.name : "";
      userItemSelect.innerHTML = `<option value="">-- Select Your Item --</option>`;
      myItems.forEach(i => { userItemSelect.innerHTML += `<option value="${i.id}">${i.name} (Ksh ${i.price})</option>`; });
      modal.classList.remove("hidden");
    });
  });
}

closeModal.addEventListener("click", () => { modal.classList.add("hidden"); });

confirmTrade.addEventListener("click", () => {
  const offeredId = userItemSelect.value ? parseInt(userItemSelect.value, 10) : null;
  if (!selectedItem || (!offeredId)) { showModal("Select your item", "Missing Selection"); return; }
  const token = localStorage.getItem("token") || "";
  fetch("/api/trades", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ requested_item_id: selectedItem.id, offered_item_id: offeredId, full_topup: false }) })
    .then(r => { if (!r.ok) throw new Error("fail"); return r.json(); })
    .then(() => { showModal("Trade request sent", "Success"); modal.classList.add("hidden"); })
    .catch(() => showModal("Failed to send trade", "Error"));
});

(async function init() {
  const token = localStorage.getItem("token") || "";
  const itemsRes = await fetch("/api/items");
  items = await itemsRes.json();
  renderRecent(items);
  const mineRes = await fetch("/api/items/mine", { headers: { "Authorization": `Bearer ${token}` } });
  if (mineRes.ok) myItems = await mineRes.json();
  const meRes = await fetch("/api/users/me", { headers: { "Authorization": `Bearer ${token}` } });
  if (meRes.ok) { const me = await meRes.json(); currentUserId = me && me.id; currentUserName = me && me.name; }
  const welcomeEl = document.getElementById("welcomeTitle");
  if (welcomeEl && currentUserName) welcomeEl.textContent = `Welcome Back, ${currentUserName} 👋`;
})();

