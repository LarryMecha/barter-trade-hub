const form = document.getElementById("loginForm");
form.addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  if (!res.ok) { showModal("Login failed", "Error"); return; }
  const data = await res.json();
  localStorage.setItem("token", data.token);
  window.location.href = "dashboard.html";
});