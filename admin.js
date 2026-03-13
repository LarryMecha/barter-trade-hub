async function loadStats() {
  const token = localStorage.getItem("token") || "";
  const res = await fetch("/api/admin/stats", { headers: { "Authorization": `Bearer ${token}` } });
  if (!res.ok) {
    console.error("Admin check failed:", res.status, await res.text());
    document.getElementById("stats-container").innerHTML = "<p>You are not authorized to view this page.</p>";
    return;
  }
  const stats = await res.json();
  const statsContainer = document.getElementById("stats-container");
  statsContainer.innerHTML = `
    <div class="stat-card">
      <h2>Total Users</h2>
      <p>${stats.totalUsers}</p>
    </div>
    <div class="stat-card">
      <h2>Total Items</h2>
      <p>${stats.totalItems}</p>
    </div>
    <div class="stat-card">
      <h2>Total Trades</h2>
      <p>${stats.totalTrades}</p>
    </div>
  `;

  loadUsers();
  loadItems();
  loadTrades();
  loadDisputes();
}

async function loadUsers() {
  const token = localStorage.getItem("token") || "";
  const res = await fetch("/api/admin/users", { headers: { "Authorization": `Bearer ${token}` } });
  const users = await res.json();
  const usersContainer = document.getElementById("users-container");
  usersContainer.innerHTML = `
    <div class="table-container">
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => `
            <tr>
              <td>${user.id}</td>
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td>${new Date(user.created_at).toLocaleString()}</td>
              <td>
                <button class="btn-delete" onclick="deleteUser(${user.id})">Delete</button>
                <button class="btn-message" onclick="messageUser(${user.id})">Message</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function loadItems() {
  const token = localStorage.getItem("token") || "";
  const res = await fetch("/api/admin/items", { headers: { "Authorization": `Bearer ${token}` } });
  const items = await res.json();
  const itemsContainer = document.getElementById("items-container");
  itemsContainer.innerHTML = `
    <div class="table-container">
      <h2><i data-lucide="package" class="w-5 h-5"></i> Items</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Owner</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.id}</td>
              <td>${item.name}</td>
              <td>${item.owner_name}</td>
              <td>Ksh ${item.price}</td>
              <td><span class="badge ${item.status === 'Available' ? 'badge-resolved' : 'badge-open'}">${item.status}</span></td>
              <td><button class="btn-delete" onclick="deleteItem(${item.id})">Delete</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
  if (res.ok) {
    showModal("User deleted successfully", "Success");
    loadUsers();
    loadStats();
    loadDisputes();
  } else {
    showModal("Failed to delete user", "Error");
  }
}

async function deleteItem(id) {
  if (!confirm("Are you sure you want to delete this item?")) return;
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`/api/admin/items/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
  if (res.ok) {
    showModal("Item deleted successfully", "Success");
    loadItems();
    loadStats();
    loadDisputes();
  } else {
    showModal("Failed to delete item", "Error");
  }
}

async function loadTrades() {
  const token = localStorage.getItem("token") || "";
  const res = await fetch("/api/admin/trades", { headers: { "Authorization": `Bearer ${token}` } });
  const trades = await res.json();
  const tradesContainer = document.getElementById("trades-container");
  tradesContainer.innerHTML = `
    <div class="table-container">
      <h2><i data-lucide="repeat" class="w-5 h-5"></i> All Trades</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Requester</th>
            <th>Owner</th>
            <th>Requested Item</th>
            <th>Offered Item</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${trades.map(t => `
            <tr>
              <td>#${t.id}</td>
              <td>${t.requester_name}</td>
              <td>${t.owner_name}</td>
              <td>${t.requested_name}</td>
              <td>${t.offered_name || "N/A"}</td>
              <td><span class="badge ${t.status === 'Accepted' ? 'badge-resolved' : (t.status === 'Cancelled' ? 'badge-open' : 'badge-open')}">${t.status}</span></td>
              <td>
                ${t.status !== 'Cancelled' ? `<button class="btn-delete" onclick="cancelTrade(${t.id})">Cancel</button>` : ''}
                ${t.status === 'Accepted' ? `<button class="btn-delete ml-2" onclick="reverseTrade(${t.id})">Reverse</button>` : ''}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();
}

async function cancelTrade(id) {
  const message = prompt("Reason for cancellation (to notify users):");
  if (!message) return;
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`/api/admin/trades/${id}/cancel`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ message })
  });
  if (res.ok) {
    showModal("Trade cancelled and users notified.", "Success");
    loadTrades();
  } else {
    showModal("Failed to cancel trade.", "Error");
  }
}

async function messageUser(id) {
  const content = prompt("Enter your message to the user:");
  if (!content) return;
  
  const token = localStorage.getItem("token") || "";
  const res = await fetch("/api/admin/message", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ user_id: id, content }),
  });
  
  if (res.ok) {
    showModal("Message sent successfully", "Success");
  } else {
    showModal("Failed to send message", "Error");
  }
}

async function loadDisputes() {
  const token = localStorage.getItem("token") || "";
  const res = await fetch("/api/admin/disputes", { headers: { "Authorization": `Bearer ${token}` } });
  const disputes = await res.json();
  const disputesContainer = document.getElementById("disputes-container");
  disputesContainer.innerHTML = `
    <div class="table-container">
      <h2><i data-lucide="alert-triangle" class="w-5 h-5"></i> Disputes</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Trade ID</th>
            <th>User</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${disputes.map(dispute => `
            <tr>
              <td>${dispute.id}</td>
              <td>#${dispute.trade_id}</td>
              <td>${dispute.user_name}</td>
              <td>${dispute.reason}</td>
              <td><span class="badge ${dispute.status === 'Open' ? 'badge-open' : 'badge-resolved'}">${dispute.status}</span></td>
              <td>
                <button class="btn-message" onclick='resolveDispute(${dispute.id}, ${JSON.stringify(dispute)})'>Mark Resolved</button>
                <button class="btn-delete" onclick="reverseTrade(${dispute.trade_id})">Reverse Trade</button>
                <a href="dispute.html?id=${dispute.id}" class="btn-message">View</a>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();
}

async function resolveDispute(id, dispute) {
  const message = prompt("Enter a resolution message to send to both parties:");
  if (!message) return;

  const winner_user_id = prompt(`Who is the winner? Enter user ID. Requester: ${dispute.requester_user_id}, Owner: ${dispute.owner_user_id}`);
  if (!winner_user_id) return;

  const token = localStorage.getItem("token") || "";
  const res = await fetch(`/api/admin/disputes/${id}/resolve`, { 
    method: "PATCH", 
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ message, winner_user_id })
  });
  
  if (res.ok) {
    showModal("Dispute marked as resolved and message sent", "Success");
    loadDisputes();
  } else {
    showModal("Failed to resolve dispute", "Error");
  }
}

async function reverseTrade(id) {
  const message = prompt("Reason for reversal (to notify users):");
  if (!message) return;

  const token = localStorage.getItem("token") || "";
  const res = await fetch(`/api/admin/trades/${id}/reverse`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ message })
  });
  
  if (res.ok) {
    showModal("Trade reversed successfully and users notified", "Success");
    loadTrades();
    loadDisputes();
  } else {
    showModal("Failed to reverse trade", "Error");
  }
}

loadStats();
