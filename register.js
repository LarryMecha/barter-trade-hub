const form = document.getElementById("registerForm");
form.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
  if (!res.ok) { showModal("Register failed", "Error"); return; }
  const data = await res.json();
  localStorage.setItem("token", data.token);
  window.location.href = "dashboard.html";
});