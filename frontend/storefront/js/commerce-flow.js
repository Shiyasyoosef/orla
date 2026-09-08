const OrlaFlow = (() => {
  const cartKey = "orla_cart";
  const legacyCartKey = "orlaCart";
  const ordersKey = "orla_orders";
  const checkoutKey = "orla_checkout";
  const wishlistKey = "orla_wishlist";

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

  function saveWishlist(items) {
    localStorage.setItem(wishlistKey, JSON.stringify((items || []).map(normalizeProduct)));
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
    saveWishlist,
    isWishlisted,
    toggleWishlist
  };
})();
