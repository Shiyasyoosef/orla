(function () {
  "use strict";

  const TRACKING_KEYS = new Set(["utm_source", "utm-source", "utm_medium", "utm-medium", "utm_campaign", "utm-campaign", "utm_term", "utm-term", "utm_content", "utm-content", "utm_id", "utm-id", "gclid", "gbraid", "wbraid", "fbclid", "msclkid"]);
  const ATTRIBUTE_ORDER = ["variant", "color", "size", "shoe-size", "ram", "storage", "processor", "screen-size", "capacity", "model", "connectivity", "warranty", "fabric", "pattern", "style", "fit", "sleeve-type", "heel-size", "material", "gender", "age-group"];
  const LABELS = { color: "Color", size: "Size", "shoe-size": "Shoe Size", ram: "RAM", storage: "Storage", processor: "Processor", "screen-size": "Screen Size", capacity: "Capacity", model: "Model", connectivity: "Connectivity", warranty: "Warranty", fabric: "Fabric", pattern: "Pattern", style: "Style", fit: "Fit", "sleeve-type": "Sleeve Type", "heel-size": "Heel Size", material: "Material", gender: "Gender", "age-group": "Age Group" };
  const FALLBACK_PRODUCTS = {
    "pearl-beige-premium-abaya": {
      product: { id: 1, name: "Pearl Beige Premium Abaya", slug: "pearl-beige-premium-abaya", sku: "OT-AB-1001", description: "Luxury flowing beige abaya with premium drape and minimal detailing.", categoryName: "Abayas", brandName: "OrlaTrends", canonicalUrl: "/pearl-beige-premium-abaya.html" },
      variants: [
        variant("OT-AB-1001-BE-S", "Beige / S / Linen", 249, 319, 14, "assets/images/products/Product1.jpg", "in_stock", { color: "Beige", size: "S", fabric: "Linen", style: "Modest" }),
        variant("OT-AB-1001-BE-M", "Beige / M / Linen", 249, 319, 18, "assets/images/products/Product1.jpg", "in_stock", { color: "Beige", size: "M", fabric: "Linen", style: "Modest" }),
        variant("OT-AB-1001-BK-M", "Black / M / Linen", 259, 329, 6, "assets/images/products/Product3.jpg", "in_stock", { color: "Black", size: "M", fabric: "Linen", style: "Modest" }),
        variant("OT-AB-1001-BK-L", "Black / L / Linen", 259, 329, 0, "assets/images/products/Product3.jpg", "out_of_stock", { color: "Black", size: "L", fabric: "Linen", style: "Modest" })
      ]
    },
    "navy-occasion-dress": {
      product: { id: 7, name: "Navy Occasion Dress", slug: "navy-occasion-dress", sku: "OT-DR-1007", description: "Premium navy occasion dress with structured silhouette.", categoryName: "Dresses", brandName: "OrlaTrends", canonicalUrl: "/navy-occasion-dress.html" },
      variants: [
        variant("OT-DR-1007-NV-S", "Navy / S / Occasion", 199, 279, 5, "assets/images/products/Product8.jpg", "in_stock", { color: "Navy", size: "S", style: "Occasion", fit: "Tailored" }),
        variant("OT-DR-1007-NV-M", "Navy / M / Occasion", 209, 279, 7, "assets/images/products/Product8.jpg", "in_stock", { color: "Navy", size: "M", style: "Occasion", fit: "Tailored" }),
        variant("OT-DR-1007-WH-M", "White / M / Occasion", 209, 279, 0, "assets/images/products/Product2.jpg", "out_of_stock", { color: "White", size: "M", style: "Occasion", fit: "Tailored" })
      ]
    },
    "tan-block-heel-sandals": {
      product: { id: 11, name: "Tan Block Heel Sandals", slug: "tan-block-heel-sandals", sku: "OT-SH-1011", description: "Premium tan block heel sandals with soft faux leather finish.", categoryName: "Shoes", brandName: "OrlaTrends", canonicalUrl: "/tan-block-heel-sandals.html" },
      variants: [
        variant("OT-SH-1011-BR-42", "Brown / EU 42 / Block Heel", 179, 229, 9, "assets/images/products/Product11.jpg", "in_stock", { color: "Brown", "shoe-size": "EU 42", material: "Faux Leather", "heel-size": "Block Heel" }),
        variant("OT-SH-1011-BK-43", "Black / EU 43 / Block Heel", 189, 239, 0, "assets/images/products/Product11.jpg", "out_of_stock", { color: "Black", "shoe-size": "EU 43", material: "Faux Leather", "heel-size": "Block Heel" })
      ]
    }
  };

  function variant(sku, name, price, compareAtPrice, stockQuantity, imageUrl, availability, attributes) {
    return { variantKey: normalize(sku), sku, name, price, compareAtPrice, stockQuantity, imageUrl, availability, attributes };
  }
  function normalize(value) {
    return String(value || "").toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function labelFor(key) {
    return LABELS[key] || key.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  }
  function money(value) {
    return Number(value || 0).toFixed(2);
  }
  function currentSlug() {
    const params = new URLSearchParams(window.location.search);
    const explicit = params.get("slug") || params.get("product");
    if (explicit) return normalize(explicit);
    const file = window.location.pathname.split("/").pop() || "";
    const slug = file.replace(/\.html$/i, "");
    return slug && slug !== "product" && slug !== "index" ? normalize(slug) : "pearl-beige-premium-abaya";
  }
  function currentVariantParams(variants) {
    const keys = new Set();
    variants.forEach((item) => Object.keys(item.attributes || {}).forEach((key) => keys.add(normalize(key))));
    const params = new URLSearchParams(window.location.search);
    const selected = {};
    params.forEach((value, key) => {
      const safeKey = normalize(key);
      if (keys.has(safeKey) && !TRACKING_KEYS.has(safeKey)) selected[safeKey] = normalize(value);
    });
    return selected;
  }
  function buildOptions(variants) {
    const matrix = {};
    variants.forEach((item) => {
      Object.entries(item.attributes || {}).forEach(([rawKey, rawValue]) => {
        const key = normalize(rawKey);
        const value = normalize(rawValue);
        matrix[key] ||= new Map();
        const previous = matrix[key].get(value) || { value, label: rawValue, available: false };
        previous.available = previous.available || item.availability === "in_stock";
        matrix[key].set(value, previous);
      });
    });
    return Object.fromEntries(Object.entries(matrix).sort(([a], [b]) => {
      const ai = ATTRIBUTE_ORDER.indexOf(a);
      const bi = ATTRIBUTE_ORDER.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b);
    }).map(([key, values]) => [key, [...values.values()]]));
  }
  function chooseVariant(variants, selected) {
    const token = normalize(new URLSearchParams(window.location.search).get("variant") || new URLSearchParams(window.location.search).get("sku") || "");
    if (token) {
      const byToken = variants.find((item) => [item.variantKey, item.sku, String(item.id || "")].some((value) => normalize(value) === token));
      if (byToken) return byToken;
    }
    const keys = Object.keys(selected || {});
    if (keys.length) {
      const exact = variants.find((item) => keys.every((key) => normalize(item.attributes?.[key]) === selected[key]));
      if (exact) return exact;
      const partial = variants.find((item) => keys.some((key) => normalize(item.attributes?.[key]) === selected[key]));
      if (partial) return partial;
    }
    return variants.find((item) => item.availability === "in_stock") || variants[0];
  }
  function variantUrl(product, variant, preserveTracking) {
    const params = new URLSearchParams();
    const variantKey = normalize(variant.variantKey || variant.sku || "");
    if (variantKey) params.set("variant", variantKey);
    const attrs = Object.entries(variant.attributes || {}).sort(([a], [b]) => {
      const ai = ATTRIBUTE_ORDER.indexOf(normalize(a));
      const bi = ATTRIBUTE_ORDER.indexOf(normalize(b));
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b);
    });
    attrs.forEach(([key, value]) => params.set(normalize(key), normalize(value)));
    if (preserveTracking) {
      new URLSearchParams(window.location.search).forEach((value, key) => {
        if (TRACKING_KEYS.has(normalize(key))) params.set(key, value);
      });
    }
    const query = params.toString();
    return `${window.location.origin}/${product.slug}.html${query ? `?${query}` : ""}`;
  }
  function schemaAvailability(value) {
    return value === "in_stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  }
  function absoluteUrl(value) {
    try { return new URL(value || "/", window.location.origin).href; } catch (_) { return `${window.location.origin}/`; }
  }
  function schemaCondition(value) {
    if (value === "used") return "https://schema.org/UsedCondition";
    if (value === "refurbished") return "https://schema.org/RefurbishedCondition";
    return "https://schema.org/NewCondition";
  }
  function schemaVariesBy(keys) {
    const map = {
      color: "https://schema.org/color",
      size: "https://schema.org/size",
      material: "https://schema.org/material",
      pattern: "https://schema.org/pattern"
    };
    return [...new Set(keys.map((key) => normalize(key)))].map((key) => map[key] || key).filter(Boolean);
  }
  function schemaProperties(variant) {
    return Object.entries(variant.attributes || {}).map(([name, value]) => ({ "@type": "PropertyValue", name: normalize(name), value: String(value) }));
  }
  function schemaOffer(product, variant) {
    const url = variantUrl(product, variant, false);
    return {
      "@type": "Offer",
      url,
      priceCurrency: "AED",
      price: money(variant.price),
      availability: schemaAvailability(variant.availability),
      itemCondition: schemaCondition(variant.condition),
      seller: { "@type": "Organization", name: "OrlaTrends" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0.00", currency: "AED" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "AE" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 2, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 5, unitCode: "DAY" }
        }
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "AE",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn"
      }
    };
  }
  function variantSchemaNode(product, variant, groupId) {
    const url = variantUrl(product, variant, false);
    const node = {
      "@type": "Product",
      "@id": `${url}#product`,
      name: `${product.name} - ${variant.name}`,
      sku: variant.sku,
      mpn: variant.mpn || variant.sku,
      image: [absoluteUrl(variant.imageUrl)],
      description: product.description || product.name,
      brand: { "@type": "Brand", name: product.brandName || "OrlaTrends" },
      category: product.googleProductCategory || product.categoryName || undefined,
      url,
      itemCondition: schemaCondition(variant.condition),
      additionalProperty: schemaProperties(variant),
      offers: schemaOffer(product, variant),
      isVariantOf: { "@id": groupId }
    };
    const gtin = variant.gtin || variant.ean || variant.barcode;
    if (gtin) {
      node.gtin = gtin;
      if (/^\d{13}$/.test(String(gtin))) node.gtin13 = gtin;
      if (/^\d{12}$/.test(String(gtin))) node.gtin12 = gtin;
      if (/^\d{14}$/.test(String(gtin))) node.gtin14 = gtin;
    }
    if (variant.attributes?.color) node.color = variant.attributes.color;
    if (variant.attributes?.size || variant.attributes?.["shoe-size"]) node.size = variant.attributes.size || variant.attributes["shoe-size"];
    if (variant.attributes?.material || variant.attributes?.fabric) node.material = variant.attributes.material || variant.attributes.fabric;
    if (variant.attributes?.pattern) node.pattern = variant.attributes.pattern;
    return node;
  }
  function updateSchema(product, variant, variants) {
    const script = document.getElementById("productSchema");
    if (!script) return;
    const canonical = `${window.location.origin}/${product.slug}.html`;
    const groupId = `${canonical}#product-group`;
    const variantKeys = variants.flatMap((item) => Object.keys(item.attributes || {}));
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${window.location.origin}/#organization`,
          name: "OrlaTrends",
          url: window.location.origin,
          logo: absoluteUrl("assets/images/brand/orlalogo1.jpg")
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonical}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${window.location.origin}/` },
            { "@type": "ListItem", position: 2, name: product.categoryName || "Products", item: `${window.location.origin}/` },
            { "@type": "ListItem", position: 3, name: product.name, item: canonical }
          ]
        },
        {
          "@type": "ProductGroup",
          "@id": groupId,
          name: product.name,
          description: product.description || product.name,
          brand: { "@type": "Brand", name: product.brandName || "OrlaTrends" },
          productGroupID: product.sku,
          category: product.googleProductCategory || product.categoryName || undefined,
          variesBy: schemaVariesBy(variantKeys),
          hasVariant: variants.map((item) => variantSchemaNode(product, item, groupId))
        },
        {
          ...variantSchemaNode(product, variant, groupId),
          mainEntityOfPage: variantUrl(product, variant, false)
        }
      ]
    };
    script.textContent = JSON.stringify(schema);
  }
  function renderOptions(product, variants, options, selectedVariant) {
    const box = document.getElementById("variantOptions");
    if (!box) return;
    box.innerHTML = Object.entries(options).map(([key, values]) => `
      <section class="option-group" data-option-group="${key}">
        <div class="option-label">${labelFor(key)}</div>
        <div class="option-values">
          ${values.map((option) => `<button type="button" class="variant-option${normalize(selectedVariant.attributes?.[key]) === option.value ? " is-active" : ""}${option.available ? "" : " is-disabled"}" data-option-key="${key}" data-option-value="${option.value}">${option.label}</button>`).join("")}
        </div>
      </section>`).join("");
    box.querySelectorAll(".variant-option").forEach((button) => {
      button.addEventListener("click", () => {
        const selected = { ...Object.fromEntries(Object.entries(selectedVariant.attributes || {}).map(([key, value]) => [normalize(key), normalize(value)])) };
        selected[button.dataset.optionKey] = button.dataset.optionValue;
        const next = chooseVariant(variants, selected);
        setVariant(product, variants, options, next, true);
      });
    });
  }
  function setVariant(product, variants, options, variant, shouldUpdateUrl) {
    if (!variant) return;
    const title = document.getElementById("productTitle");
    const desc = document.getElementById("productDescription");
    const img = document.getElementById("productImage");
    const price = document.getElementById("productPrice");
    const compare = document.getElementById("comparePrice");
    const sku = document.getElementById("variantSku");
    const stock = document.getElementById("stockBadge");
    const cart = document.getElementById("addToCartButton");
    const canonical = document.getElementById("canonicalLink") || document.querySelector("link[rel='canonical']");

    if (title) title.textContent = product.name;
    if (desc) desc.textContent = product.description || "Premium OrlaTrends fashion selection.";
    if (img) { img.src = variant.imageUrl; img.alt = `${product.name} - ${variant.name}`; }
    if (price) price.textContent = money(variant.price);
    if (compare) compare.textContent = variant.compareAtPrice ? `AED ${money(variant.compareAtPrice)}` : "";
    if (sku) sku.textContent = variant.sku;
    if (stock) {
      stock.textContent = variant.availability === "in_stock" ? "In stock" : "Out of stock";
      stock.classList.toggle("is-out", variant.availability !== "in_stock");
    }
    if (cart) {
      cart.disabled = variant.availability !== "in_stock";
      cart.dataset.sku = variant.sku;
      cart.dataset.variant = JSON.stringify({ product: product.slug, sku: variant.sku,
      mpn: variant.mpn || variant.sku,
      gtin: variant.gtin || undefined, price: variant.price, attributes: variant.attributes });
    }
    if (canonical) canonical.href = `${window.location.origin}/${product.slug}.html`;
    updateSchema(product, variant, variants);
    renderOptions(product, variants, options, variant);
    if (shouldUpdateUrl) window.history.replaceState({ sku: variant.sku }, "", variantUrl(product, variant, true));
  }
  async function loadProduct(slug) {
    if (window.__ORLA_PRODUCT_DATA__?.product?.slug === slug) return window.__ORLA_PRODUCT_DATA__;
    try {
      const res = await fetch(`/api/storefront/products/${encodeURIComponent(slug)}${window.location.search}`, { headers: { Accept: "application/json" } });
      const payload = await res.json();
      if (res.ok && payload.success && payload.data) return payload.data;
    } catch (_) {}
    const fallback = FALLBACK_PRODUCTS[slug] || FALLBACK_PRODUCTS["pearl-beige-premium-abaya"];
    const variants = fallback.variants.map((item) => ({ ...item, imageUrl: item.imageUrl.startsWith("http") || item.imageUrl.startsWith("/") ? item.imageUrl : item.imageUrl }));
    const options = buildOptions(variants);
    const selectedVariant = chooseVariant(variants, currentVariantParams(variants));
    return { product: fallback.product, variants, options, selectedVariant, selectedOptions: selectedVariant.attributes, canonicalUrl: fallback.product.canonicalUrl };
  }
  function bindCart() {
    const cart = document.getElementById("addToCartButton");
    if (!cart) return;
    cart.addEventListener("click", () => {
      if (cart.disabled || !cart.dataset.variant) return;
      const items = JSON.parse(localStorage.getItem("orlaCart") || "[]");
      items.push({ ...JSON.parse(cart.dataset.variant), quantity: 1, addedAt: new Date().toISOString() });
      localStorage.setItem("orlaCart", JSON.stringify(items));
      cart.textContent = "Added to cart";
      setTimeout(() => { cart.textContent = "Add selected variant to cart"; }, 1400);
    });
  }
  document.addEventListener("DOMContentLoaded", async () => {
    if (!document.querySelector("[data-product-page]")) return;
    const data = await loadProduct(currentSlug());
    const variants = data.variants || [];
    const selected = data.selectedVariant || chooseVariant(variants, currentVariantParams(variants));
    const options = data.options || buildOptions(variants);
    setVariant(data.product, variants, options, selected, !window.__ORLA_PRODUCT_DATA__);
    bindCart();
  });
})();





