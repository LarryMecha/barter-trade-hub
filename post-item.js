const form = document.getElementById("postItemForm");
const nameInput = document.getElementById("itemName");
const descInput = document.getElementById("itemDesc");
const categorySelect = document.getElementById("itemCategory");
const conditionSelect = document.getElementById("itemCondition");
const priceInput = document.getElementById("itemPrice");
const tradeTypeSelect = document.getElementById("itemTradeType");
const imgInput = document.getElementById("itemImg");

function mapTradeType(v) {
  if (v === "FullAmount") return "full";
  if (v === "TopUp") return "topup";
  if (v === "Barter") return "barter";
  return "barter";
}

function buildItemObject(imageDataUrl) {
  const id = Date.now();
  return {
    id,
    name: nameInput.value.trim(),
    description: descInput.value.trim(),
    category: categorySelect.value,
    condition: conditionSelect.value,
    price: parseInt(priceInput.value, 10) || 0,
    type: mapTradeType(tradeTypeSelect.value),
    img: imageDataUrl || "https://via.placeholder.com/200"
  };
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const file = imgInput.files && imgInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const item = buildItemObject(reader.result);
      const token = localStorage.getItem("token") || "";
      fetch("/api/items", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(item) })
        .then(r => { if (!r.ok) throw new Error("fail"); return r.json(); })
        .then(() => { showModal("Item posted successfully", "Success"); window.location.href = "my-items.html"; })
        .catch(() => showModal("Failed to post item", "Error"));
    };
    reader.readAsDataURL(file);
  } else {
    const item = buildItemObject(null);
    const token = localStorage.getItem("token") || "";
    fetch("/api/items", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(item) })
      .then(r => { if (!r.ok) throw new Error("fail"); return r.json(); })
      .then(() => { showModal("Item posted successfully", "Success"); window.location.href = "my-items.html"; })
      .catch(() => showModal("Failed to post item", "Error"));
  }
});