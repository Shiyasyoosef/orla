(function () {
  "use strict";

  const CACHE_PREFIX = "orlatrends:admin-query:";
  const ORDER_PREFS_KEY = "orlatrends:orders-table-prefs:v1";
  const CACHE_TTL = {
    orders: 30 * 1000,
    reference: 5 * 60 * 1000
  };
  const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

  const originalApi = window.api;
  const originalOrderStore = window.orderStore;
  const originalRenderOrders = window.renderOrders;
  const originalLoadOrdersData = window.loadOrdersData;
  const originalRenderOrdersPage = window.renderOrdersPage;

  if (typeof originalApi !== "function") return;

  function safeJsonParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function cacheKey(path) {
    return `${CACHE_PREFIX}${path}`;
  }

  function readCache(path, ttl) {
    const cached = safeJsonParse(sessionStorage.getItem(cacheKey(path)), null);
    if (!cached || Date.now() - cached.time > ttl) return null;
    return cached.data;
  }

  function writeCache(path, data) {
    try {
      sessionStorage.setItem(cacheKey(path), JSON.stringify({ time: Date.now(), data }));
    } catch (_) {
      // Storage may be unavailable in private or locked-down browsers. The app still works without cache.
    }
  }

  function invalidateCache(prefixes) {
    const keys = [];
    for (let index = 0; index < sessionStorage.length; index += 1) {
      const key = sessionStorage.key(index);
      if (key && key.startsWith(CACHE_PREFIX) && prefixes.some((prefix) => key.includes(prefix))) keys.push(key);
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  }

  function ttlFor(path) {
    if (path.startsWith("/api/orders/advanced")) return CACHE_TTL.orders;
    if (path.startsWith("/api/customers?") || path.startsWith("/api/products?")) return CACHE_TTL.reference;
    return 0;
  }

  window.api = async function enhancedApi(path, options = {}) {
    const method = String(options.method || "GET").toUpperCase();
    const isMutation = MUTATING_METHODS.has(method);

    if (!isMutation) {
      const ttl = ttlFor(path);
      const cached = ttl ? readCache(path, ttl) : null;
      if (cached) return cached;
      const data = await originalApi(path, options);
      if (ttl) writeCache(path, data);
      return data;
    }

    const data = await originalApi(path, options);
    if (path.startsWith("/api/orders")) invalidateCache(["/api/orders/advanced"]);
    if (path.startsWith("/api/products")) invalidateCache(["/api/products"]);
    if (path.startsWith("/api/customers")) invalidateCache(["/api/customers"]);
    return data;
  };

  function readOrderPrefs() {
    return safeJsonParse(localStorage.getItem(ORDER_PREFS_KEY), null) || {};
  }

  function persistOrderPrefs(store) {
    if (!store) return;
    const prefs = {
      columns: store.columns,
      pageSize: store.pageSize,
      sort: store.sort,
      direction: store.direction,
      filtersOpen: store.filtersOpen,
      columnTab: store.columnTab
    };
    try {
      localStorage.setItem(ORDER_PREFS_KEY, JSON.stringify(prefs));
    } catch (_) {
      // Ignore storage failures; this is only a preference layer.
    }
  }

  function applyOrderPrefs(store) {
    if (!store || store.__orlaPrefsApplied) return store;
    const prefs = readOrderPrefs();
    if (prefs.columns && typeof prefs.columns === "object") {
      store.columns = { ...store.columns, ...prefs.columns };
    }
    if ([20, 50, 100, 200].includes(Number(prefs.pageSize))) store.pageSize = Number(prefs.pageSize);
    if (typeof prefs.sort === "string") store.sort = prefs.sort;
    if (["asc", "desc"].includes(prefs.direction)) store.direction = prefs.direction;
    if (typeof prefs.filtersOpen === "boolean") store.filtersOpen = prefs.filtersOpen;
    if (typeof prefs.columnTab === "string") store.columnTab = prefs.columnTab;
    store.__orlaPrefsApplied = true;
    return store;
  }

  if (typeof originalOrderStore === "function") {
    window.orderStore = function enhancedOrderStore() {
      return applyOrderPrefs(originalOrderStore());
    };
  }

  if (typeof originalRenderOrdersPage === "function") {
    window.renderOrdersPage = function enhancedRenderOrdersPage() {
      const result = originalRenderOrdersPage();
      persistOrderPrefs(window.orderStore?.());
      decorateOrdersPage();
      return result;
    };
  }

  if (typeof originalLoadOrdersData === "function") {
    window.loadOrdersData = async function enhancedLoadOrdersData() {
      const result = await originalLoadOrdersData();
      persistOrderPrefs(window.orderStore?.());
      return result;
    };
  }

  if (typeof originalRenderOrders === "function") {
    window.renderOrders = async function enhancedRenderOrders() {
      window.orderStore?.();
      return originalRenderOrders();
    };
  }

  function decorateOrdersPage() {
    const bulkButton = document.querySelector("#ordersApplyBulk");
    const tableCard = document.querySelector(".orders-table-card");
    if (bulkButton) bulkButton.title = "Applies the selected status to checked orders with rollback on failure.";
    if (tableCard) tableCard.setAttribute("data-cache-enabled", "true");
  }

  function updateVisibleOrderStatuses(store, ids, status) {
    const changed = new Map();
    store.rows = store.rows.map((row) => {
      if (!ids.includes(String(row.id))) return row;
      changed.set(String(row.id), { status: row.status });
      return { ...row, status };
    });
    return changed;
  }

  function restoreVisibleOrderStatuses(store, changed) {
    store.rows = store.rows.map((row) => {
      const previous = changed.get(String(row.id));
      return previous ? { ...row, ...previous } : row;
    });
  }

  window.applyOrdersBulkAction = async function enhancedApplyOrdersBulkAction() {
    const store = window.orderStore?.();
    const action = document.querySelector("#ordersBulkAction")?.value;
    const selectedIds = store ? [...store.selected].map(String) : [];

    if (!store || !action || !selectedIds.length) {
      return window.toast?.("Select orders and an action", "warning");
    }

    const changed = updateVisibleOrderStatuses(store, selectedIds, action);
    store.__bulkUpdating = true;
    window.renderOrdersPage?.();
    window.toast?.(`Updating ${selectedIds.length} order${selectedIds.length === 1 ? "" : "s"}...`, "info");

    const results = await Promise.allSettled(
      selectedIds.map((id) => window.api(`/api/orders/${id}`, { method: "PUT", body: { status: action } }))
    );
    const failed = results.filter((result) => result.status === "rejected");
    store.__bulkUpdating = false;

    if (failed.length) {
      restoreVisibleOrderStatuses(store, changed);
      window.renderOrdersPage?.();
      const message = failed[0].reason?.message || "Bulk action failed";
      return window.toast?.(`${failed.length} order update failed: ${message}`, "danger");
    }

    store.selected.clear();
    invalidateCache(["/api/orders/advanced"]);
    persistOrderPrefs(store);
    window.toast?.("Bulk action applied", "success");
    return window.loadOrdersData?.();
  };

  const currentModule = new URLSearchParams(window.location.search).get("module") || localStorage.getItem("orla_module");
  const adminContentIsReady = () => Boolean(document.querySelector("#content"));
  if (currentModule === "orders" && typeof window.renderOrders === "function" && adminContentIsReady()) {
    window.setTimeout(() => window.renderOrders(), 0);
  }

  window.OrlaAdminEnhancements = {
    version: "2026.08.29.2",
    invalidateCache,
    readOrderPrefs
  };
})();
