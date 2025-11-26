
let myItems = [];
let soldByMe = [];

async function loadMyItems() {
  const container = document.getElementById("my-items-list");
  container.innerHTML = "";
  const token = localStorage.getItem("token") || "";
  const res = await fetch("/api/items/mine", { headers: { "Authorization": `Bearer ${token}` } });
  if (res.ok) {
    myItems = await res.json();
  }
  const soldRes = await fetch("/api/items/sold-by-me", { headers: { "Authorization": `Bearer ${token}` } });
  soldByMe = soldRes.ok ? await soldRes.json() : [];

  if (myItems.length === 0 && soldByMe.length === 0) {
    container.innerHTML = `<p class="text-gray-500">You haven’t posted any items yet.</p>`;
    return;
  }

  const all = [...myItems, ...soldByMe.filter(s => !myItems.find(m => m.id === s.id))];
  all.forEach(item => {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded-lg shadow hover:shadow-lg transition";
    const isSold = item.status === 'Sold';
    const lastTradeId = item.last_trade_id || null;
    card.innerHTML = `
      <div class="relative w-full mb-3 rounded-md bg-gray-100" style="aspect-ratio: 4/3">
        <img src="${item.img || item.image || 'https://via.placeholder.com/400x300'}" alt="${item.name}" class="absolute inset-0 w-full h-full object-contain">
        ${isSold ? `<div class=\"absolute inset-0 flex items-center justify-center\"><span class=\"px-6 py-2 bg-red-600 bg-opacity-80 text-white text-2xl font-bold rotate-[-12deg]\">SOLD</span></div>` : ''}
      </div>
      <h3 class="text-lg font-bold">${item.name}</h3>
      <p class="text-gray-600">Condition: ${item.condition}</p>
      <p class="text-gray-800 font-semibold">Ksh ${item.price}</p>
      <div class="mt-4 flex justify-between">
        ${isSold ? `
          ${lastTradeId ? `<button onclick=\"recallItem(${lastTradeId})\" class=\"px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700\">Recall</button>` : `<span class=\"text-sm text-gray-500\">Sold</span>`}
        ` : `
          <button onclick=\"editItem(${item.id})\" class=\"px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600\">Edit</button>
          <button onclick=\"deleteItem(${item.id})\" class=\"px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600\">Delete</button>
        `}
      </div>
    `;
    container.appendChild(card);
  });
}

let editingId = null;
const editModal = document.getElementById("editModal");
const editName = document.getElementById("editName");
const editCategory = document.getElementById("editCategory");
const editCondition = document.getElementById("editCondition");
const editPrice = document.getElementById("editPrice");
const editType = document.getElementById("editType");
const editDesc = document.getElementById("editDesc");
const editImg = document.getElementById("editImg");
const cancelEdit = document.getElementById("cancelEdit");
const saveEdit = document.getElementById("saveEdit");

function editItem(id) {
  const item = myItems.find(i => i.id === id);
  if (!item) return;
  editingId = id;
  editName.value = item.name || "";
  editCategory.value = item.category || "";
  editCondition.value = item.condition || "Used";
  editPrice.value = item.price || 0;
  editType.value = item.type || "topup";
  editDesc.value = item.description || "";
  editImg.value = "";
  editModal.classList.remove("hidden");
  editModal.classList.add("flex");
}

cancelEdit.addEventListener("click", () => {
  editModal.classList.add("hidden");
  editModal.classList.remove("flex");
  editingId = null;
});

saveEdit.addEventListener("click", async () => {
  if (!editingId) return;
  const token = localStorage.getItem("token") || "";
  const payload = {
    name: editName.value.trim(),
    category: editCategory.value.trim(),
    condition: editCondition.value,
    price: parseInt(editPrice.value, 10) || 0,
    type: editType.value,
    description: editDesc.value.trim()
  };
  const file = editImg.files && editImg.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async () => {
      payload.img = reader.result;
      const res = await fetch(`/api/items/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(payload) });
      if (res.ok) {
        editModal.classList.add("hidden");
        editModal.classList.remove("flex");
        editingId = null;
        loadMyItems();
      } else {
        alert("Update failed");
      }
    };
    reader.readAsDataURL(file);
    return;
  }
  const res = await fetch(`/api/items/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(payload) });
  if (res.ok) {
    editModal.classList.add("hidden");
    editModal.classList.remove("flex");
    editingId = null;
    loadMyItems();
  } else {
    alert("Update failed");
  }
});

async function deleteItem(id) {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`/api/items/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
  if (res.ok) loadMyItems();
}

// Mobile Menu Toggle
document.addEventListener("DOMContentLoaded", () => {});

async function recallItem(tradeId) {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`/api/trades/${tradeId}/recall`, { method: "POST", headers: { "Authorization": `Bearer ${token}` } });
  if (res.ok) {
    showModal("Recall executed. Ownership has been restored.", "Success");
    loadMyItems();
  } else {
    showModal("Recall failed.", "Error");
  }
}

// Load items on page load
window.onload = loadMyItems;
