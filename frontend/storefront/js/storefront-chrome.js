(function () {
  const categories = [
    ["New In", "index.html?category=new-in"],
    ["Dresses", "index.html?category=dresses"],
    ["Abayas", "index.html?category=abayas"],
    ["Tops & Tees", "index.html?category=tops-tees"],
    ["Jalabiyas", "index.html?category=jalabiyas"],
    ["Shirts", "index.html?category=shirts"],
    ["Jeans", "index.html?category=jeans"],
    ["Skirts", "index.html?category=skirts"],
    ["Sports", "index.html?category=sports"]
  ];

  const footerLinks = [
    ["Abouts", "abouts.html"],
    ["Warranty Policy", "warranty-policy.html"],
    ["Sell with us", "sell-with-us.html"],
    ["Terms of Use", "terms-of-use.html"],
    ["Privacy Policy", "account-privacy.html"]
  ];

  const bottomLinks = [
    ["⌂", "Home", "index.html"],
    ["▧", "Categories", "index.html#shop-by-category"],
    ["◇", "Sale", "index.html#sale"],
    ["◉", "Account", "customer-login.html"],
    ["▰", "Cart", "cart.html"]
  ];

  function linkList(items) {
    return items.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join("");
  }

  function currentFile() {
    return (location.pathname.split("/").pop() || "index.html").toLowerCase();
  }

  function injectHeader() {
    if (document.querySelector(".orla-page-header")) return;
    document.body.insertAdjacentHTML("afterbegin", `
      <header class="orla-page-header">
        <div class="orla-header-inner">
          <button class="orla-menu-btn" type="button" aria-label="Open menu">☰</button>
          <a class="orla-brand" href="index.html" aria-label="OrlaTrends home">
            <img src="assets/images/brand/orlalogo1.jpg" alt="OrlaTrends">
          </a>
          <form class="orla-search" action="index.html" role="search">
            <span aria-hidden="true">⌕</span>
            <input type="search" name="q" placeholder="What are you looking for?" aria-label="Search products">
          </form>
          <nav class="orla-header-actions" aria-label="Customer links">
            <a class="orla-action-link orla-sign-in" href="customer-login.html" aria-label="Sign in"><span aria-hidden="true">◎</span><span>Sign In</span></a>
            <a class="orla-action-link orla-wishlist-link" href="wishlist.html" aria-label="Wishlist">♡</a>
            <a class="orla-action-link orla-cart-link" href="cart.html" aria-label="Cart">🛒</a>
          </nav>
        </div>
      </header>
      <nav class="orla-site-nav" aria-label="Main navigation">
        <div class="orla-nav-scroll">
          <ul class="orla-nav-list">${linkList(categories)}</ul>
        </div>
      </nav>
    `);
  }

  function injectBottomNav() {
    if (document.querySelector(".orla-mobile-bottom")) return;
    const active = currentFile();
    const html = bottomLinks.map(([icon, label, href]) => {
      const isActive = active === href.toLowerCase();
      return `<a class="orla-bottom-link${isActive ? " is-active" : ""}" href="${href}"><span aria-hidden="true">${icon}</span><span>${label}</span></a>`;
    }).join("");
    document.body.insertAdjacentHTML("beforeend", `<nav class="orla-mobile-bottom" aria-label="Mobile bottom navigation">${html}</nav>`);
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
    injectHeader();
    injectFooter();
    injectBottomNav();
  });
})();
