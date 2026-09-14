(function () {
  const categories = [
    ["New In", "category.html?category=new-in"],
    ["Dresses", "category.html?category=dresses"],
    ["Abayas", "category.html?category=abayas"],
    ["Tops & Tees", "category.html?category=tops-tees"],
    ["Jalabiyas", "category.html?category=jalabiyas"],
    ["Shirts", "category.html?category=shirts"],
    ["Jeans", "category.html?category=jeans"],
    ["Skirts", "category.html?category=skirts"],
    ["Pants", "category.html?category=pants"],
    ["Sports", "category.html?category=sports"]
  ];

  const footerLinks = [
    ["Abouts", "abouts.html"],
    ["Warranty Policy", "warranty-policy.html"],
    ["Sell with us", "sell-with-us.html"],
    ["Terms of Use", "terms-of-use.html"],
    ["Privacy Policy", "account-privacy.html"]
  ];

  const bottomLinks = [
    ["home", "Home", "index.html"],
    ["category", "Categories", "category.html?category=new-in"],
    ["sell", "Sale", "index.html#sale"],
    ["person_add", "Account", "customer-login.html"],
    ["shopping_cart_checkout", "Cart", "cart.html"]
  ];

  function linkList(items) {
    return items.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join("");
  }

  function currentFile() {
    return (location.pathname.split("/").pop() || "index.html").toLowerCase();
  }

  function ensureIconFont() {
    if (document.querySelector('link[href*="Material+Symbols+Outlined"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;500;600;700";
    document.head.appendChild(link);
  }

  function injectHeader() {
    if (document.querySelector(".site-header")) return;
    document.body.insertAdjacentHTML("afterbegin", `
      <header class="site-header">
        <div class="header-inner">
          <button class="menu-trigger" type="button" aria-label="Open menu">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <a href="index.html" class="brand" aria-label="Orla Trends home">
            <img src="assets/images/brand/orlalogo1.jpg" alt="Orla Trends" class="logo-img">
          </a>
          <form class="search-form" role="search">
            <button class="search-icon-btn" type="submit" aria-label="Search">
              <span class="material-symbols-outlined">search</span>
            </button>
            <input class="search-input" type="search" placeholder="What are you looking for?" aria-label="Search products">
          </form>
          <div class="header-actions">
            <a href="customer-login.html" class="action-link account-link" aria-label="Account">
              <span class="material-symbols-outlined">account_circle</span>
              <span class="desktop-only">Sign In</span>
            </a>
            <a href="wishlist.html" class="action-link wishlist-link" aria-label="Wishlist">
              <span class="material-symbols-outlined">favorite</span>
            </a>
            <a href="cart.html" class="action-link cart-link" aria-label="Cart">
              <span class="material-symbols-outlined">shopping_cart_checkout</span>
            </a>
          </div>
        </div>
      </header>
      <nav class="site-nav" aria-label="Main navigation">
        <div class="nav-window">
          <ul class="nav-list" id="storefrontCategoryNav">${linkList(categories)}</ul>
        </div>
      </nav>
    `);
  }

  function injectBottomNav() {
    if (document.querySelector(".mobile-bottom-nav")) return;
    const active = currentFile();
    const html = bottomLinks.map(([icon, label, href]) => {
      const targetFile = href.split("?")[0].split("#")[0].toLowerCase();
      const isActive = active === targetFile || (active === "category.html" && label === "Categories");
      return `<a class="bottom-link${isActive ? " is-active" : ""}" href="${href}"><span class="material-symbols-outlined" aria-hidden="true">${icon}</span><span>${label}</span></a>`;
    }).join("");
    document.body.insertAdjacentHTML("beforeend", `<nav class="mobile-bottom-nav" aria-label="Mobile bottom navigation">${html}</nav>`);
  }

  function injectFooter() {
    if (document.querySelector(".orla-page-footer")) return;
    document.body.insertAdjacentHTML("beforeend", `
      <footer class="orla-page-footer">
        <p>&copy; 2026 OrlaTrends. All Rights Reserved</p>
        <nav class="orla-footer-links" aria-label="Footer links">
          ${footerLinks.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}
        </nav>
      </footer>
    `);
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureIconFont();
    injectHeader();
    injectFooter();
    injectBottomNav();
    if (typeof OrlaFlow !== "undefined") OrlaFlow.updateWishlistBadges();
    if (typeof OrlaFlow !== "undefined") OrlaFlow.initMobileMenu();
  });
})();
