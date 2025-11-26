async function loadProfile() {
  const token = localStorage.getItem("token") || "";
  const res = await fetch("/api/users/me", { headers: { "Authorization": `Bearer ${token}` } });
  const p = res.ok ? await res.json() : null;
  const box = document.getElementById("profileBox");
  box.textContent = p ? `Name: ${p.name} • Email: ${p.email}` : "Not logged in";
  const nameInput = document.getElementById("name");
  if (p) nameInput.value = p.name;
}

document.getElementById("updateForm").addEventListener("submit", async e => {
  e.preventDefault();
  const token = localStorage.getItem("token") || "";
  const name = document.getElementById("name").value.trim();
  const oldPassword = document.getElementById("oldPassword").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();
  const body = { name };
  if (newPassword) {
    if (!oldPassword) { showModal("Enter your current password to change it.", "Current Password Required"); return; }
    body.old_password = oldPassword;
    body.new_password = newPassword;
  }
  const res = await fetch("/api/users/me", { method: "PATCH", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(body) });
  if (res.ok) {
    showModal("Profile updated", "Success");
    loadProfile();
    document.getElementById("oldPassword").value = "";
    document.getElementById("newPassword").value = "";
  } else {
    let msg = "Update failed";
    try { const data = await res.json(); if (data && data.error === "InvalidOldPassword") msg = "Current password is incorrect."; } catch {}
    showModal(msg, "Error");
  }
});

loadProfile();