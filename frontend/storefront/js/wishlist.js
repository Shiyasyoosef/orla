(function () {
  const state = {
    drawerProduct: null,
    drawerSize: "S"
  };

  const grid = document.querySelector("#wishlistGrid");
  const count = document.querySelector("#wishlistCount");
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
    count.textContent = `${items.length} ${items.length === 1 ? "item" : "items"}`;
  }

  function productUrl(item) {
    return `product.html?id=${encodeURIComponent(item.id)}`;
  }

  function salePercent(item) {
    const oldPrice = Number(item.old || 0);
    const price = Number(item.price || 0);
    if (!oldPrice || !price || oldPrice <= price) return "";
    return `-${Math.round(((oldPrice - price) / oldPrice) * 100)}%`;
  }

  function recommendationCard(item, index) {
    const percent = salePercent(item);
    return `
      <article class="wishlist-reco-card">
        <a class="wishlist-reco-media" href="${productUrl(item)}" aria-label="View ${escapeHtml(item.name)}">
          <span class="wishlist-card-label">${index % 2 ? "PREMIUM" : "MOST WISHLISTED"}</span>
          <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" loading="lazy">
          ${item.rating ? `<span class="wishlist-rating">&#9733; ${escapeHtml(item.rating)}</span>` : ""}
        </a>
        <div class="wishlist-reco-body">
          <div class="wishlist-reco-title">
            <a href="${productUrl(item)}">${escapeHtml(item.brand || "OrlaTrends")}</a>
            <button class="wishlist-mini-heart" type="button" data-save-reco="${escapeHtml(item.id)}" aria-label="Save ${escapeHtml(item.name)}">
              <span aria-hidden="true">♡</span>
            </button>
          </div>
          <p>${escapeHtml(item.name)}</p>
          <div class="wishlist-price-row">
            <strong>${OrlaFlow.money(item.price).replace(".00", "")}</strong>
            ${item.old ? `<del>${OrlaFlow.money(item.old).replace("AED ", "").replace(".00", "")}</del>` : ""}
            ${percent ? `<span>${percent}</span>` : ""}
          </div>
          <span class="wishlist-delivery">${index % 2 ? "TODAY" : "TOMORROW"}</span>
          <small>Free delivery</small>
        </div>
      </article>
    `;
  }

  function sectionTemplate(title, items) {
    return `
      <section class="wishlist-reco-section" aria-label="${escapeHtml(title)}">
        <div class="wishlist-section-head">
          <h2>${escapeHtml(title)}</h2>
          <a href="index.html">SEE ALL</a>
        </div>
        <div class="wishlist-reco-row">
          ${items.map(recommendationCard).join("")}
        </div>
      </section>
    `;
  }

  function emptyTemplate() {
    const lowPrice = OrlaFlow.defaultProducts.slice(4, 8).map(OrlaFlow.normalizeProduct);
    const recommended = OrlaFlow.defaultProducts.slice(7, 12).map(OrlaFlow.normalizeProduct);
    return `
      <div class="wishlist-empty-state">
        <h2>Your wishlist is empty.</h2>
        <p>Tap the heart to save your favorites</p>
        <a class="wishlist-continue" href="index.html">Continue Shopping</a>
      </div>
      ${sectionTemplate("Lowest price of the year", lowPrice)}
      ${sectionTemplate("Recommended for You", recommended)}
    `;
  }

  function wishlistItemTemplate(item) {
    const percent = salePercent(item);
    return `
      <article class="wishlist-item-card" data-id="${escapeHtml(item.id)}">
        <a class="wishlist-item-media" href="${productUrl(item)}" aria-label="View ${escapeHtml(item.name)}">
          <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" loading="lazy">
        </a>
        <div class="wishlist-item-body">
          <div class="wishlist-item-title">
            <a href="${productUrl(item)}">${escapeHtml(item.brand || "OrlaTrends")}</a>
            <button class="wishlist-heart-remove" type="button" aria-label="Remove ${escapeHtml(item.name)} from wishlist">
              <span aria-hidden="true">♥</span>
            </button>
          </div>
          <a class="wishlist-item-name" href="${productUrl(item)}">${escapeHtml(item.name)}</a>
          <div class="wishlist-price-row">
            <strong>${OrlaFlow.money(item.price).replace(".00", "")}</strong>
            ${item.old ? `<del>${OrlaFlow.money(item.old).replace("AED ", "").replace(".00", "")}</del>` : ""}
            ${percent ? `<span>${percent}</span>` : ""}
          </div>
          <span class="wishlist-delivery">TOMORROW</span>
          <small>Free delivery</small>
          <div class="wishlist-card-actions">
            <button class="wishlist-add-bag" type="button" data-add-bag>Add to Bag</button>
            <button class="wishlist-delete" type="button" data-delete-item>
              Delete
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function render() {
    const items = OrlaFlow.wishlist();
    syncActions(items);
    if (!items.length) {
      document.body.classList.add("wishlist-empty-mode");
      grid.className = "wishlist-content is-empty";
      grid.innerHTML = emptyTemplate();
      return;
    }
    document.body.classList.remove("wishlist-empty-mode");
    grid.className = "wishlist-content is-populated";
    grid.innerHTML = `<div class="wishlist-list">${items.map(wishlistItemTemplate).join("")}</div>`;
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
    const recoButton = event.target.closest("[data-save-reco]");
    if (recoButton) {
      const item = OrlaFlow.defaultProducts.find((product) => String(product.id) === String(recoButton.dataset.saveReco));
      if (item) {
        const result = OrlaFlow.toggleWishlist(item);
        render();
        showToast(result.added ? "Saved to wishlist" : "Removed from wishlist");
      }
      return;
    }

    const card = event.target.closest(".wishlist-item-card");
    if (!card) return;
    const item = getItem(card);
    if (!item) return;

    if (event.target.closest(".wishlist-heart-remove") || event.target.closest("[data-delete-item]")) {
      OrlaFlow.toggleWishlist(item);
      render();
      showToast("Removed from wishlist");
      return;
    }

    if (event.target.closest("[data-add-bag]")) {
      openDrawer(item);
    }
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
