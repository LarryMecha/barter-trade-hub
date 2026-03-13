let trades = [];
let activeTradeId = null;
let activeTradeDetail = null;

async function loadTrades() {
  const token = localStorage.getItem("token") || "";
  const res = await fetch("/api/trades/mine", { headers: { "Authorization": `Bearer ${token}` } });
  trades = res.ok ? await res.json() : [];
  renderTrades();
}

function renderTrades() {
  const list = document.getElementById("tradesList");
  list.innerHTML = "";
  if (trades.length === 0) {
    list.innerHTML = `<li class="text-gray-500">No trades yet.</li>`;
    return;
  }
  trades.forEach(t => {
    const li = document.createElement("li");
    li.className = `border rounded p-2 hover:bg-gray-50 cursor-pointer ${activeTradeId===t.id?"border-blue-500":""}`;
    const label = t.is_full_topup ? `Full Top-Up for ${t.requested_name || t.requested_item_id}` : `Offer ${t.offered_name || t.offered_item_id} for ${t.requested_name || t.requested_item_id}`;
    li.textContent = `${label} • ${t.status}`;
    li.addEventListener("click", () => { activeTradeId = t.id; loadTradeDetail(); });
    list.appendChild(li);
  });
}

async function loadTradeDetail() {
  if (!activeTradeId) return;
  const token = localStorage.getItem("token") || "";
  const detailRes = await fetch(`/api/trades/${activeTradeId}`, { headers: { "Authorization": `Bearer ${token}` } });
  activeTradeDetail = detailRes.ok ? await detailRes.json() : null;
  const res = await fetch(`/api/messages/${activeTradeId}`, { headers: { "Authorization": `Bearer ${token}` } });
  const msgs = res.ok ? await res.json() : [];
  const box = document.getElementById("messagesBox");
  const header = document.getElementById("chatHeader");
  const disputeBtn = document.getElementById("dispute-button");

  if (activeTradeDetail) {
    const itemTitle = activeTradeDetail.requested_name || `Item ${activeTradeDetail.requested_item_id}`;
    const exchange = activeTradeDetail.offered_name
      ? `${activeTradeDetail.offered_name} <span class="mx-2">↔</span> ${activeTradeDetail.requested_name}`
      : `💰 <span class="mx-2">→</span> ${activeTradeDetail.requested_name}`;
    header.innerHTML = `
      <div>Trade #${activeTradeId} • ${activeTradeDetail.requester_name} ↔ ${activeTradeDetail.owner_name} • ${itemTitle}</div>
      <div class="mt-1 text-lg">${exchange}</div>
    `;

    // Show dispute button only for Accepted trades
    if (activeTradeDetail.status === 'Accepted') {
      disputeBtn.classList.remove("hidden");
    } else {
      disputeBtn.classList.add("hidden");
    }
  } else {
    header.textContent = `Trade #${activeTradeId}`;
    disputeBtn.classList.add("hidden");
  }
  box.innerHTML = msgs.map(m => {
    const img = activeTradeDetail && (activeTradeDetail.requested_img || "");
    const price = activeTradeDetail && (activeTradeDetail.requested_price != null ? activeTradeDetail.requested_price : "");
    const desc = activeTradeDetail && (activeTradeDetail.requested_description || "");
    const tooltip = img ? `
      <div class="absolute left-0 top-full mt-1 hidden group-hover:block z-20 bg-white border rounded shadow p-3 w-64">
        <img src="${img}" alt="" class="w-full h-32 object-contain bg-gray-100 rounded mb-2" />
        <div class="text-sm font-semibold">Ksh ${price}</div>
        <div class="text-xs text-gray-600">${desc}</div>
      </div>` : "";
    return `
      <div class="mb-2 relative group">
        <span class="font-semibold">${m.sender_name || m.sender_user_id}</span>: ${m.content}
        ${tooltip}
      </div>`;
  }).join("");
  box.scrollTop = box.scrollHeight;
}

document.getElementById("messageForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!activeTradeId) return;
  const token = localStorage.getItem("token") || "";
  const content = document.getElementById("messageInput").value.trim();
  if (!content) return;
  const res = await fetch(`/api/messages/${activeTradeId}`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ content }) });
  if (res.ok) {
    document.getElementById("messageInput").value = "";
    loadTradeDetail();
  }
});

loadTrades();

document.getElementById("dispute-button").addEventListener("click", async () => {
  if (!activeTradeId) return;
  const reason = prompt("Please enter the reason for your dispute:");
  if (reason) {
    const token = localStorage.getItem("token") || "";
    try {
      const res = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ trade_id: activeTradeId, reason }),
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
  }
});