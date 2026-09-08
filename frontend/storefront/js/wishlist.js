(function () {
  const state = {
    editing: false,
    selected: new Set(),
    drawerProduct: null,
    drawerSize: "S"
  };

  const grid = document.querySelector("#wishlistGrid");
  const count = document.querySelector("#wishlistCount");
  const editBtn = document.querySelector("#editWishlist");
  const cancelBtn = document.querySelector("#cancelEdit");
  const deleteBtn = document.querySelector("#deleteSelected");
  const shareBtn = document.querySelector("#shareSelected");
  const drawer = document.querySelector("#sizeDrawer");
  const backdrop = document.querySelector("#drawerBackdrop");
  const drawerProduct = document.querySelector("#drawerProduct");
  const sizeChoices = document.querySelector("#sizeChoices");
  const drawerAdd = document.querySelector("#drawerAddToBag");
  const toast = document.querySelector("#storeToast");

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function syncActions(items) {
    count.textContent = `- ${items.length} ${items.length === 1 ? "item" : "items"}`;
    document.querySelectorAll("[data-cart-count]").forEach((badge) => {
      badge.textContent = String(OrlaFlow.get().length);
    });
    editBtn.hidden = state.editing;
    cancelBtn.hidden = !state.editing;
    deleteBtn.hidden = !state.editing;
    shareBtn.hidden = !state.editing;
    deleteBtn.disabled = state.selected.size === 0;
    shareBtn.disabled = state.selected.size === 0;
  }

  function itemTemplate(item) {
    const selected = state.selected.has(String(item.id));
    return `
      <article class="shop-card" data-id="${escapeHtml(item.id)}">
        ${state.editing ? `<input class="card-check" type="checkbox" aria-label="Select ${escapeHtml(item.name)}" ${selected ? "checked" : ""}>` : ""}
        <a class="shop-card-media" href="product.html?id=${encodeURIComponent(item.id)}">
          <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" loading="lazy">
        </a>
        <button class="card-heart is-active" type="button" aria-label="Remove ${escapeHtml(item.name)} from wishlist">
          <span class="material-symbols-outlined">favorite</span>
        </button>
        <div class="shop-card-body">
          <h3>${escapeHtml(item.brand || "OrlaTrends")}</h3>
          <p>${escapeHtml(item.name)}</p>
          <strong class="shop-price">${OrlaFlow.money(item.price)}</strong>
          <button class="bag-btn" type="button" data-add-bag>Add to Bag</button>
        </div>
      </article>
    `;
  }

  function render() {
    const items = OrlaFlow.wishlist();
    syncActions(items);
    if (!items.length) {
      grid.className = "empty-shop";
      grid.innerHTML = `<div><h2>Your wishlist is empty</h2><p>Tap the heart on any OrlaTrends product to save it here.</p><p><a href="index.html">Continue shopping</a></p></div>`;
      return;
    }
    grid.className = "store-grid";
    grid.innerHTML = items.map(itemTemplate).join("");
  }

  function getItem(card) {
    const id = card?.dataset.id;
    return OrlaFlow.wishlist().find((item) => String(item.id) === String(id));
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
  }

  function openDrawer(item) {
    state.drawerProduct = item;
    state.drawerSize = item.size || "S";
    drawerProduct.innerHTML = `
      <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}">
      <div>
        <h2 style="margin:0 0 6px;font-size:18px;">${escapeHtml(item.brand || "OrlaTrends")}</h2>
        <p style="margin:0 0 10px;color:#667085;">${escapeHtml(item.name)}</p>
        <strong>${OrlaFlow.money(item.price)}</strong>
      </div>
    `;
    sizeChoices.innerHTML = ["XS", "S", "M", "L", "XL"].map((size) => (
      `<button class="size-choice ${size === state.drawerSize ? "is-selected" : ""}" type="button" data-size="${size}">${size}</button>`
    )).join("");
    drawer.classList.add("is-open");
    backdrop.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
  }

  grid.addEventListener("click", (event) => {
    const card = event.target.closest(".shop-card");
    if (!card) return;
    const item = getItem(card);
    if (!item) return;

    if (event.target.closest(".card-heart")) {
      OrlaFlow.toggleWishlist(item);
      state.selected.delete(String(item.id));
      render();
      showToast("Removed from wishlist");
    }

    if (event.target.closest("[data-add-bag]")) {
      openDrawer(item);
    }
  });

  grid.addEventListener("change", (event) => {
    if (!event.target.classList.contains("card-check")) return;
    const id = event.target.closest(".shop-card")?.dataset.id;
    if (!id) return;
    if (event.target.checked) state.selected.add(String(id));
    else state.selected.delete(String(id));
    syncActions(OrlaFlow.wishlist());
  });

  editBtn.addEventListener("click", () => {
    state.editing = true;
    state.selected.clear();
    render();
  });

  cancelBtn.addEventListener("click", () => {
    state.editing = false;
    state.selected.clear();
    render();
  });

  deleteBtn.addEventListener("click", () => {
    if (!state.selected.size) return;
    const next = OrlaFlow.wishlist().filter((item) => !state.selected.has(String(item.id)));
    OrlaFlow.saveWishlist(next);
    state.selected.clear();
    state.editing = false;
    render();
    showToast("Wishlist updated");
  });

  shareBtn.addEventListener("click", () => {
    const selectedItems = OrlaFlow.wishlist().filter((item) => state.selected.has(String(item.id)));
    const text = selectedItems.map((item) => `${item.name} - ${OrlaFlow.money(item.price)}`).join("\n");
    if (navigator.share) navigator.share({ title: "OrlaTrends wishlist", text, url: location.href }).catch(() => {});
    else navigator.clipboard?.writeText(`${text}\n${location.href}`).then(() => showToast("Wishlist copied"));
  });

  sizeChoices.addEventListener("click", (event) => {
    const button = event.target.closest(".size-choice");
    if (!button) return;
    state.drawerSize = button.dataset.size;
    sizeChoices.querySelectorAll(".size-choice").forEach((item) => item.classList.toggle("is-selected", item === button));
  });

  drawerAdd.addEventListener("click", () => {
    if (!state.drawerProduct) return;
    OrlaFlow.addToCart({ ...state.drawerProduct, size: state.drawerSize, quantity: 1 });
    showToast("Added to bag");
    closeDrawer();
  });

  document.querySelector("#closeDrawer").addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
  render();
})();
