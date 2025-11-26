const tokenKey = "token";
function getToken() {
  return localStorage.getItem(tokenKey) || "";
}
function isAuthed() {
  return !!getToken();
}
function headerHTML() {
  const authLink = isAuthed() ? `<a href="#" id="logoutLink" class="hover:underline text-red-200">Logout</a>` : `<a href="login.html" class="hover:underline">Login</a>`;
  return `
  <header class="bg-blue-700 text-white shadow-md">
    <div class="flex items-center justify-between px-6 py-4">
      <h1 class="text-2xl font-bold">Digital Soko</h1>
      <button id="menuToggle" class="md:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
    </div>
    <nav id="menu" class="hidden md:flex flex-col md:flex-row bg-blue-800 md:bg-blue-700 px-6 py-3 space-y-2 md:space-y-0 md:space-x-6">
      <a href="dashboard.html" class="hover:underline">Dashboard</a>
      <a href="marketplace.html" class="hover:underline">Marketplace</a>
      <a href="my-items.html" class="hover:underline">My Items</a>
      <a href="post-item.html" class="hover:underline">Post Item</a>
      <a href="barter-requests.html" class="hover:underline">Barter Requests</a>
      <a href="messages.html" class="hover:underline">Messages</a>
      <a href="settings.html" class="hover:underline">Settings</a>
      ${authLink}
    </nav>
  </header>`;
}
document.body.insertAdjacentHTML("afterbegin", headerHTML());
const t = document.getElementById("menuToggle");
if (t) t.addEventListener("click", () => { const m = document.getElementById("menu"); if (m) m.classList.toggle("hidden"); });
const logout = document.getElementById("logoutLink");
if (logout) logout.addEventListener("click", e => { e.preventDefault(); localStorage.removeItem(tokenKey); window.location.href = "login.html"; });

// Global modal
(function () {
  const overlay = document.createElement("div");
  overlay.id = "globalModal";
  overlay.className = "fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50";
  overlay.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6">
      <div id="globalModalTitle" class="text-lg font-bold mb-2">Notice</div>
      <div id="globalModalText" class="text-gray-700 mb-4"></div>
      <div class="text-right">
        <button id="globalModalClose" class="px-4 py-2 bg-blue-600 text-white rounded">OK</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  const close = () => { overlay.classList.add("hidden"); overlay.classList.remove("flex"); };
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("click", (e) => { if (e.target && e.target.id === "globalModalClose") close(); });
  window.showModal = function (text, title = "Notice") {
    const t = document.getElementById("globalModalTitle");
    const b = document.getElementById("globalModalText");
    if (t) t.textContent = title;
    if (b) b.textContent = text;
    overlay.classList.remove("hidden");
    overlay.classList.add("flex");
  };
})();