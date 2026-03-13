async function loadDisputeDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  const token = localStorage.getItem("token") || "";
  const res = await fetch(`/api/admin/disputes/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
  if (!res.ok) {
    document.getElementById("dispute-details").innerHTML = "<p>Dispute not found.</p>";
    return;
  }

  const { dispute, trade, messages } = await res.json();

  document.getElementById("dispute-title").textContent = `Dispute #${dispute.id}`;

  const detailsContainer = document.getElementById("dispute-details");
  detailsContainer.innerHTML = `
    <div class="table-container">
      <h2>Dispute Details</h2>
      <table>
        <tr><th>ID</th><td>${dispute.id}</td></tr>
        <tr><th>Trade ID</th><td>${dispute.trade_id}</td></tr>
        <tr><th>User</th><td>${trade.requester_user_id === dispute.user_id ? trade.requester_name : trade.owner_name}</td></tr>
        <tr><th>Reason</th><td>${dispute.reason}</td></tr>
        <tr><th>Status</th><td><span class="badge ${dispute.status === 'Open' ? 'badge-open' : 'badge-resolved'}">${dispute.status}</span></td></tr>
        ${dispute.status === 'Resolved' ? `
        <tr><th>Winner</th><td>${dispute.winner_name}</td></tr>
        <tr><th>Resolution</th><td>${dispute.resolution_message}</td></tr>
        ` : ''}
      </table>
    </div>
    <div class="table-container">
      <h2>Trade Details</h2>
      <table>
        <tr><th>Requested Item</th><td>${trade.requested_item_name}</td></tr>
        <tr><th>Offered Item</th><td>${trade.offered_item_name || "N/A"}</td></tr>
      </table>
    </div>
    <div class="table-container">
      <h2>Chat History</h2>
      <div class="chat-box">
        ${messages.map(message => `
          <div class="chat-message ${message.is_admin_message ? 'admin-message' : ''}">
            <strong>${message.sender_name}:</strong> ${message.content}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

loadDisputeDetails();
