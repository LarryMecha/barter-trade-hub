// Toggle navbar menu on mobile
document.addEventListener("DOMContentLoaded", () => {});

const requestsList = document.getElementById("requestsList");
let requests = [];

function renderRequests() {
  requestsList.innerHTML = "";

  if (requests.length === 0) {
    requestsList.innerHTML = `
      <p class="text-gray-600">No barter requests yet.</p>
    `;
    return;
  }

  requests.forEach((r, index) => {
    const card = document.createElement("div");
    card.className = "bg-white p-6 rounded-xl shadow";

    const topupText = typeof r.topup_amount === "number" && r.topup_amount > 0 ? `Top-Up: Ksh ${r.topup_amount}` : "";
    const isAccepted = r.status === 'Accepted';
    const stampLabel = isAccepted ? (r.is_full_topup ? 'SOLD' : 'TRADED') : null;

    card.innerHTML = `
      <div class="flex justify-between items-start gap-4">
        <div class="flex-1">
          <div class="font-semibold">Trade #${r.id} • ${r.status}</div>
          <div class="text-sm text-gray-600">Requester: ${r.requester_name}</div>
          ${topupText ? `<div class="text-xs text-gray-600">${topupText}</div>` : ""}
          <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="border rounded p-2">
              <div class="text-sm font-semibold mb-1">Requested Item</div>
              <div class="relative w-full h-32 bg-gray-100 rounded mb-2">
                <img src="${r.requested_img || ''}" alt="${r.requested_name || ''}" class="absolute inset-0 w-full h-full object-contain" />
                ${stampLabel ? `<div class=\"absolute inset-0 flex items-center justify-center\"><span class=\"px-3 py-1 bg-red-600 bg-opacity-80 text-white text-xl font-bold rotate-[-12deg]\">${stampLabel}</span></div>` : ''}
              </div>
              <div class="text-sm">${r.requested_name || ''}</div>
              <div class="text-sm font-semibold">Ksh ${r.requested_price ?? ''}</div>
              <div class="text-xs text-gray-600">${r.requested_description || ''}</div>
            </div>
            ${r.offered_name ? `
            <div class="border rounded p-2">
              <div class="text-sm font-semibold mb-1">Offered Item</div>
              <div class="relative w-full h-32 bg-gray-100 rounded mb-2">
                <img src="${r.offered_img || ''}" alt="${r.offered_name || ''}" class="absolute inset-0 w-full h-full object-contain" />
                ${isAccepted && !r.is_full_topup ? `<div class=\"absolute inset-0 flex items-center justify-center\"><span class=\"px-3 py-1 bg-blue-600 bg-opacity-80 text-white text-xl font-bold rotate-[-12deg]\">TRADED</span></div>` : ''}
              </div>
              <div class="text-sm">${r.offered_name || ''}</div>
              <div class="text-sm font-semibold">Ksh ${r.offered_price ?? ''}</div>
              <div class="text-xs text-gray-600">${r.offered_description || ''}</div>
            </div>
            ` : ''}
          </div>
          ${r.offered_name ? `
          <div class="mt-2 flex items-center justify-center text-2xl">${r.offered_name} <span class="mx-3">↔</span> ${r.requested_name}</div>
          ` : `
          <div class="mt-2 flex items-center justify-center text-2xl">💰 <span class="mx-3">→</span> ${r.requested_name}</div>
          `}
        </div>
        <div class="flex gap-2">
          ${!isAccepted && r.status !== 'Declined' ? `
            <button class="accept-btn bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" data-index="${index}">Accept</button>
            <button class="decline-btn bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" data-index="${index}">Decline</button>
          ` : ''}
          ${isAccepted ? `
            <button class="dispute-btn bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700" data-index="${index}">Dispute</button>
          ` : ''}
          <button class="message-btn bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" data-index="${index}">Message</button>
        </div>
      </div>
    `;

    requestsList.appendChild(card);
  });

  // Decline and Message event handlers

  document.querySelectorAll(".decline-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const i = e.target.dataset.index;
      const r = requests[i];
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`/api/trades/${r.id}/decline`, { method: "POST", headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        showModal("Trade declined", "Success");
        loadRequests();
      }
    });
  });

  document.querySelectorAll(".message-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const i = e.target.dataset.index;
      const r = requests[i];
      openMessageModal(r.id);
    });
  });

  document.querySelectorAll(".dispute-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const i = e.target.dataset.index;
      const r = requests[i];
      const reason = prompt("Please enter the reason for your dispute:");
      if (!reason) return;

      const token = localStorage.getItem("token") || "";
      try {
        const res = await fetch("/api/disputes", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ trade_id: r.id, reason }),
        });
        if (res.ok) {
          showModal("Your dispute has been filed and will be reviewed by an administrator.", "Dispute Filed");
        } else {
          const err = await res.json();
          showModal(err.error || "Failed to file dispute", "Error");
        }
      } catch (e) {
        showModal("An unexpected error occurred", "Error");
      }
    });
  });
}

// Render on page load
async function loadRequests() {
  const token = localStorage.getItem("token") || "";
  const res = await fetch("/api/trades/incoming", { headers: { "Authorization": `Bearer ${token}` } });
  if (res.ok) requests = await res.json(); else requests = [];
  renderRequests();
}
loadRequests();

let messageTradeId = null;
const messageModal = document.getElementById("messageModal");
const messageModalInput = document.getElementById("messageModalInput");
const messageModalCancel = document.getElementById("messageModalCancel");
const messageModalSend = document.getElementById("messageModalSend");

function openMessageModal(tradeId) {
  messageTradeId = tradeId;
  messageModalInput.value = "";
  messageModal.classList.remove("hidden");
  messageModal.classList.add("flex");
}

messageModalCancel.addEventListener("click", () => {
  messageModal.classList.add("hidden");
  messageModal.classList.remove("flex");
  messageTradeId = null;
});

messageModalSend.addEventListener("click", async () => {
  const content = messageModalInput.value.trim();
  if (!content || !messageTradeId) return;
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`/api/messages/${messageTradeId}`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ content }) });
  if (res.ok) {
    messageModal.classList.add("hidden");
    messageModal.classList.remove("flex");
    messageTradeId = null;
  }
});

const handshakeOverlay = document.getElementById("handshakeOverlay");
const handshakeItems = document.getElementById("handshakeItems");

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("accept-btn")) {
    const i = e.target.dataset.index;
    const r = requests[i];
    const token = localStorage.getItem("token") || "";
    const res = await fetch(`/api/trades/${r.id}/accept`, { method: "POST", headers: { "Authorization": `Bearer ${token}` } });
    if (res.ok) {
      handshakeItems.innerHTML = `
        <div>
          <div class="relative w-full h-32 bg-gray-100 rounded mb-2">
            <img src="${r.offered_img || ''}" class="absolute inset-0 w-full h-full object-contain" />
          </div>
          <div class="text-sm">${r.offered_name || ''}</div>
        </div>
        <div>
          <div class="relative w-full h-32 bg-gray-100 rounded mb-2">
            <img src="${r.requested_img || ''}" class="absolute inset-0 w-full h-full object-contain" />
          </div>
          <div class="text-sm">${r.requested_name || ''}</div>
        </div>`;
      handshakeOverlay.classList.remove("hidden");
      handshakeOverlay.classList.add("flex");
      setTimeout(() => {
        handshakeOverlay.classList.add("hidden");
        handshakeOverlay.classList.remove("flex");
        loadRequests();
      }, 1800);
    }
  }
});
