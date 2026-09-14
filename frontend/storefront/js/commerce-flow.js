const OrlaFlow = (() => {
  const cartKey = "orla_cart";
  const legacyCartKey = "orlaCart";
  const ordersKey = "orla_orders";
  const checkoutKey = "orla_checkout";
  const wishlistKey = "orla_wishlist";
  const drawerStyleId = "orla-mobile-menu-style";
  const drawerId = "orlaMobileMenu";
  const categories = [
    {
      label: "NEW IN",
      href: "category.html?category=new-in",
      subcategories: ["Latest Arrivals", "Trending Now", "New Dresses"]
    },
    {
      label: "DRESSES",
      href: "category.html?category=dresses",
      subcategories: ["Maxi Dresses", "Occasion Dresses", "Casual Dresses"]
    },
    {
      label: "ABAYAS",
      href: "category.html?category=abayas",
      subcategories: ["Classic Abayas", "Premium Abayas", "Everyday Abayas"]
    },
    {
      label: "TOPS & TEES",
      href: "category.html?category=tops-tees",
      subcategories: ["Tops", "Tees", "Blouses"]
    },
    {
      label: "JALABIYAS",
      href: "category.html?category=jalabiyas",
      subcategories: ["Casual Jalabiyas", "Occasion Jalabiyas"]
    },
    {
      label: "SHIRTS",
      href: "category.html?category=shirts",
      subcategories: ["Casual Shirts", "Formal Shirts"]
    },
    {
      label: "JEANS",
      href: "category.html?category=jeans",
      subcategories: ["Straight Jeans", "Wide Leg Jeans"]
    },
    {
      label: "SKIRTS",
      href: "category.html?category=skirts",
      subcategories: ["Maxi Skirts", "Casual Skirts"]
    },
    {
      label: "SPORTS",
      href: "category.html?category=sports",
      subcategories: ["Activewear", "Sports Sets"]
    }
  ];

  const defaultProducts = [
    { id: "product1", name: "Premium Modest Dress", title: "Premium Modest Dress", img: "assets/images/products/Product1.jpg", price: 569, old: 699, rating: "4.8 (18)", brand: "OrlaTrends", size: "S" },
    { id: "product2", name: "Elegant Occasion Dress", title: "Elegant Occasion Dress", img: "assets/images/products/Product2.jpg", price: 459, old: 599, rating: "4.6 (22)", brand: "OrlaTrends", size: "S" },
    { id: "product3", name: "Printed Maxi Dress", title: "Printed Maxi Dress", img: "assets/images/products/Product3.jpg", price: 399, old: 549, rating: "4.5 (16)", brand: "OrlaTrends", size: "M" },
    { id: "product4", name: "Floral Casual Dress", title: "Floral Casual Dress", img: "assets/images/products/Product4.jpg", price: 349, old: 499, rating: "4.4 (13)", brand: "OrlaTrends", size: "M" },
    { id: "product5", name: "Classic Women's Outfit", title: "Classic Women's Outfit", img: "assets/images/products/Product5.jpg", price: 299, old: 429, rating: "4.3 (20)", brand: "OrlaTrends", size: "L" },
    { id: "product6", name: "Soft Blue Long Dress", title: "Soft Blue Long Dress", img: "assets/images/products/Product6.jpg", price: 379, old: 529, rating: "4.7 (11)", brand: "OrlaTrends", size: "S" },
    { id: "product7", name: "Sabrina Embroidered Luxury Dress", title: "Sabrina Embroidered Luxury Dress", img: "assets/images/products/Product7.jpg", price: 569, old: 699, rating: "4.9 (9)", brand: "OrlaTrends", size: "M" },
    { id: "product8", name: "Textured Maxi Dress With Elegant Fit", title: "Textured Maxi Dress With Elegant Fit", img: "assets/images/products/Product8.jpg", price: 559, old: 699, rating: "4.1 (25)", brand: "OrlaTrends", size: "S" },
    { id: "product9", name: "Lilly Deep V-Neck Premium Dress", title: "Lilly Deep V-Neck Premium Dress", img: "assets/images/products/Product9.jpg", price: 569, old: 699, rating: "4.5 (12)", brand: "OrlaTrends", size: "S" },
    { id: "product10", name: "Alessia Floral Print Maxi Dress", title: "Alessia Floral Print Maxi Dress", img: "assets/images/products/Product10.jpg", price: 711, old: 849, rating: "4.4 (13)", brand: "OrlaTrends", size: "M" },
    { id: "product11", name: "Pink Occasion Wear Dress", title: "Pink Occasion Wear Dress", img: "assets/images/products/Product11.jpg", price: 489, old: 649, rating: "4.6 (17)", brand: "OrlaTrends", size: "S" },
    { id: "product12", name: "Minimal Everyday Dress", title: "Minimal Everyday Dress", img: "assets/images/products/Product12.jpg", price: 329, old: 449, rating: "4.2 (14)", brand: "OrlaTrends", size: "M" }
  ];

  function parse(value, fallback = []) {
    try {
      return JSON.parse(value || JSON.stringify(fallback));
    } catch (_) {
      return fallback;
    }
  }

  function normalizeProduct(item = {}) {
    const matched = defaultProducts.find((product) => String(product.id) === String(item.id)) || {};
    const name = item.name || item.title || matched.name || matched.title || "OrlaTrends product";
    return {
      ...matched,
      ...item,
      id: item.id || matched.id || `item-${Date.now()}`,
      name,
      title: item.title || name,
      brand: item.brand || matched.brand || "OrlaTrends",
      img: item.img || item.image || matched.img || "assets/images/products/Product1.jpg",
      price: Number(item.price ?? matched.price ?? 0),
      old: item.old ?? matched.old,
      size: item.size || matched.size || "S",
      quantity: Number(item.quantity || item.qty || 1)
    };
  }

  function get() {
    const cart = parse(localStorage.getItem(cartKey));
    return cart.length ? cart.map(normalizeProduct) : parse(localStorage.getItem(legacyCartKey)).map(normalizeProduct);
  }

  function set(items) {
    const normalized = (items || []).map(normalizeProduct);
    localStorage.setItem(cartKey, JSON.stringify(normalized));
    localStorage.setItem(legacyCartKey, JSON.stringify(normalized));
  }

  function addToCart(item) {
    const product = normalizeProduct(item);
    const cart = get();
    const existing = cart.find((row) => String(row.id) === String(product.id) && String(row.size || "") === String(product.size || ""));
    if (existing) existing.quantity = Number(existing.quantity || 1) + Number(product.quantity || 1);
    else cart.push(product);
    set(cart);
    return cart;
  }

  function wishlist() {
    return parse(localStorage.getItem(wishlistKey)).map(normalizeProduct);
  }

  function wishlistCount() {
    return wishlist().length;
  }

  function updateWishlistBadges() {
    const total = wishlistCount();
    document.querySelectorAll(".wishlist-link").forEach((link) => {
      let badge = link.querySelector(".wishlist-count-badge");
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "wishlist-count-badge";
        badge.setAttribute("aria-hidden", "true");
        link.appendChild(badge);
      }
      badge.textContent = total > 99 ? "99+" : String(total);
      badge.hidden = total === 0;
      link.setAttribute("aria-label", total ? `Wishlist, ${total} ${total === 1 ? "item" : "items"}` : "Wishlist");
    });
  }

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function slug(value = "") {
    return String(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function ensureMobileMenuStyle() {
    if (document.getElementById(drawerStyleId)) return;
    const style = document.createElement("style");
    style.id = drawerStyleId;
    style.textContent = `
      .orla-menu-backdrop,
      .orla-mobile-menu {
        display: none;
      }
      @media (max-width: 1024px) {
        .menu-trigger {
          min-width: 44px;
          min-height: 44px;
          display: grid;
          place-items: center;
        }
        .orla-menu-open {
          overflow: hidden;
        }
        .orla-menu-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1290;
          display: block;
          background: rgba(0,0,0,.58);
          opacity: 0;
          pointer-events: none;
          transition: opacity .22s ease;
        }
        .orla-mobile-menu {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 1300;
          width: min(84vw, 430px);
          min-width: min(84vw, 320px);
          display: flex;
          flex-direction: column;
          color: #080808;
          background: #fff;
          box-shadow: 20px 0 45px rgba(0,0,0,.18);
          transform: translateX(-105%);
          transition: transform .26s ease;
        }
        .orla-menu-open .orla-menu-backdrop {
          opacity: 1;
          pointer-events: auto;
        }
        .orla-menu-open .orla-mobile-menu {
          transform: translateX(0);
        }
        .orla-menu-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 48px;
          align-items: center;
          gap: 18px;
          padding: calc(22px + env(safe-area-inset-top)) 26px 22px;
          border-bottom: 1px solid #f0f0f0;
        }
        .orla-menu-logo {
          width: min(122px, 46vw);
          height: 32px;
          object-fit: contain;
          object-position: left center;
        }
        .orla-menu-close {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 999px;
          color: #0b0b0b;
          background: transparent;
          font-size: 40px;
          line-height: 1;
          cursor: pointer;
        }
        .orla-menu-close:focus-visible,
        .orla-menu-category:focus-visible,
        .orla-menu-subcategory:focus-visible {
          outline: 2px solid #111;
          outline-offset: 3px;
        }
        .orla-menu-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 22px 26px;
          border-bottom: 1px solid #f2f2f2;
          box-shadow: 0 10px 18px rgba(15,23,42,.05);
        }
        .orla-menu-title {
          margin: 0;
          font-size: 18px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: 0;
        }
        .orla-menu-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 38px;
          padding: 0 14px;
          border: 1px solid #e6e6e6;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 900;
          white-space: nowrap;
        }
        .orla-menu-body {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 30px 0 calc(34px + env(safe-area-inset-bottom));
        }
        .orla-menu-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .orla-menu-item {
          border-bottom: 1px solid transparent;
        }
        .orla-menu-category {
          width: 100%;
          min-height: 46px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 34px;
          align-items: center;
          gap: 14px;
          padding: 0 28px 0 32px;
          border: 0;
          color: #070707;
          background: transparent;
          text-align: left;
          text-decoration: none;
          font-size: 16px;
          line-height: 1.1;
          font-weight: 900;
          cursor: pointer;
        }
        .orla-menu-arrow {
          justify-self: end;
          font-size: 34px;
          line-height: 1;
          font-weight: 300;
          transform: translateY(-1px);
          transition: transform .18s ease;
        }
        .orla-menu-category[aria-expanded="true"] .orla-menu-arrow {
          transform: rotate(90deg);
        }
        .orla-menu-sublist {
          display: none;
          margin: -2px 0 12px;
          padding: 0 28px 0 44px;
        }
        .orla-menu-item.is-open .orla-menu-sublist {
          display: grid;
          gap: 4px;
        }
        .orla-menu-subcategory {
          min-height: 36px;
          display: flex;
          align-items: center;
          color: #4b5563;
          text-decoration: none;
          font-size: 14px;
          font-weight: 750;
        }
      }
      @media (min-width: 769px) and (max-width: 1024px) {
        .header-inner {
          grid-template-areas: "menu brand search actions";
          grid-template-columns: 44px var(--logo-width, 150px) minmax(260px, 1fr) auto;
          gap: 18px;
        }
        .menu-trigger {
          grid-area: menu;
        }
      }
      @media (max-width: 430px) {
        .orla-mobile-menu {
          width: 86vw;
        }
        .orla-menu-head {
          padding-left: 22px;
          padding-right: 18px;
        }
        .orla-menu-topline {
          padding-left: 22px;
          padding-right: 18px;
        }
        .orla-menu-category {
          min-height: 44px;
          padding-left: 24px;
          padding-right: 20px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureMobileMenu() {
    if (document.getElementById(drawerId)) return;
    const menuItems = categories.map((category, index) => {
      const panelId = `orlaMenuPanel${index}`;
      const subcategories = category.subcategories || [];
      const sublist = subcategories.length
        ? `<div class="orla-menu-sublist" id="${panelId}">
            <a class="orla-menu-subcategory" href="${category.href}">All ${escapeHtml(category.label)}</a>
            ${subcategories.map((item) => `<a class="orla-menu-subcategory" href="${category.href}&sub=${slug(item)}">${escapeHtml(item)}</a>`).join("")}
          </div>`
        : "";
      return `
        <li class="orla-menu-item">
          <button class="orla-menu-category" type="button" aria-expanded="false" aria-controls="${panelId}" data-menu-category="${category.href}">
            <span>${escapeHtml(category.label)}</span>
            <span class="orla-menu-arrow" aria-hidden="true">›</span>
          </button>
          ${sublist}
        </li>
      `;
    }).join("");

    document.body.insertAdjacentHTML("beforeend", `
      <div class="orla-menu-backdrop" data-mobile-menu-close></div>
      <aside class="orla-mobile-menu" id="${drawerId}" aria-hidden="true" aria-label="Mobile category menu">
        <div class="orla-menu-head">
          <a href="index.html" aria-label="Orla Trends home">
            <img src="assets/images/brand/orla-menu-logo.png" alt="Orla Trends" class="orla-menu-logo">
          </a>
          <button class="orla-menu-close" type="button" aria-label="Close menu" data-mobile-menu-close>&times;</button>
        </div>
        <div class="orla-menu-topline">
          <h2 class="orla-menu-title">Categories</h2>
          <div class="orla-menu-pill">Women <span aria-hidden="true">⌄</span></div>
        </div>
        <nav class="orla-menu-body" aria-label="Mobile categories">
          <ul class="orla-menu-list">${menuItems}</ul>
        </nav>
      </aside>
    `);
  }

  function initMobileMenu() {
    const triggers = [...document.querySelectorAll(".menu-trigger")];
    if (!triggers.length) return;
    ensureMobileMenuStyle();
    ensureMobileMenu();

    const drawer = document.getElementById(drawerId);
    const closeTargets = document.querySelectorAll("[data-mobile-menu-close]");

    function openMenu() {
      document.body.classList.add("orla-menu-open");
      drawer?.setAttribute("aria-hidden", "false");
      triggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "true"));
      window.setTimeout(() => drawer?.querySelector(".orla-menu-close")?.focus(), 30);
    }

    function closeMenu() {
      document.body.classList.remove("orla-menu-open");
      drawer?.setAttribute("aria-hidden", "true");
      triggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
    }

    triggers.forEach((trigger) => {
      if (trigger.dataset.mobileMenuBound === "true") return;
      trigger.dataset.mobileMenuBound = "true";
      trigger.setAttribute("aria-controls", drawerId);
      trigger.setAttribute("aria-expanded", "false");
      trigger.addEventListener("click", openMenu);
    });

    closeTargets.forEach((target) => target.addEventListener("click", closeMenu));
    drawer?.querySelectorAll(".orla-menu-category").forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.closest(".orla-menu-item");
        const isOpen = item?.classList.toggle("is-open");
        button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    });
    drawer?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  function saveWishlist(items) {
    localStorage.setItem(wishlistKey, JSON.stringify((items || []).map(normalizeProduct)));
    updateWishlistBadges();
  }

  function isWishlisted(id) {
    return wishlist().some((item) => String(item.id) === String(id));
  }

  function toggleWishlist(item) {
    const product = normalizeProduct(item);
    const items = wishlist();
    const index = items.findIndex((row) => String(row.id) === String(product.id));
    if (index >= 0) items.splice(index, 1);
    else items.unshift(product);
    saveWishlist(items);
    return { added: index < 0, items };
  }

  function money(value) {
    return "AED " + Number(value || 0).toFixed(2);
  }

  function total(items) {
    return (items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || item.qty || 1), 0);
  }

  function orders() {
    return parse(localStorage.getItem(ordersKey));
  }

  function saveOrders(items) {
    localStorage.setItem(ordersKey, JSON.stringify(items || []));
  }

  function checkout() {
    return parse(localStorage.getItem(checkoutKey), {});
  }

  function saveCheckout(value) {
    localStorage.setItem(checkoutKey, JSON.stringify(value || {}));
  }

  return {
    get,
    set,
    addToCart,
    money,
    total,
    orders,
    saveOrders,
    checkout,
    saveCheckout,
    defaultProducts,
    normalizeProduct,
    wishlist,
    wishlistCount,
    saveWishlist,
    isWishlisted,
    toggleWishlist,
    updateWishlistBadges,
    initMobileMenu
  };
})();

window.OrlaFlow = OrlaFlow;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    OrlaFlow.updateWishlistBadges();
    OrlaFlow.initMobileMenu();
  });
} else {
  OrlaFlow.updateWishlistBadges();
  OrlaFlow.initMobileMenu();
}
