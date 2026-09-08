(function () {
  const API_BASE = window.ORLA_API_BASE || "";
  const TOKEN_KEY = "orlaCustomerAccessToken";
  const CUSTOMER_KEY = "orlaCustomerProfile";
  let csrfToken = "";
  let firebaseClientPromise = null;

  function authErrorMessage(error) {
    const messages = {
      "auth/email-already-in-use": "An account already exists with this email",
      "auth/invalid-email": "Enter a valid email address",
      "auth/weak-password": "Password must be at least 8 characters",
      "auth/invalid-credential": "Invalid email or password",
      "auth/user-disabled": "This customer account is disabled",
      "auth/too-many-requests": "Too many attempts. Please wait and try again",
      "auth/network-request-failed": "Network error. Check your connection and try again"
    };
    return messages[error?.code] || error?.message || "Authentication failed";
  }

  async function getFirebaseClient() {
    if (firebaseClientPromise) return firebaseClientPromise;
    firebaseClientPromise = (async () => {
      const [appSdk, authSdk] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js")
      ]);
      let config = window.ORLA_FIREBASE_CONFIG || null;
      if (!config) {
        const configResponse = await fetch("/__/firebase/init.json", { cache: "no-store" });
        if (!configResponse.ok) throw new Error("Firebase web configuration is unavailable");
        config = await configResponse.json();
      }
      const firebaseApp = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(config);
      return { auth: authSdk.getAuth(firebaseApp), ...authSdk };
    })().catch((error) => {
      firebaseClientPromise = null;
      throw error;
    });
    return firebaseClientPromise;
  }

  function getAccessToken() { return localStorage.getItem(TOKEN_KEY) || ""; }
  function readCsrfFromCookie() {
    const match = document.cookie.match(/(?:^|;\s*)orla_csrf=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }
  function rememberCsrf(data) {
    if (data?.csrfToken) csrfToken = data.csrfToken;
  }
  async function ensureCsrf() {
    if (csrfToken) return csrfToken;
    csrfToken = readCsrfFromCookie();
    if (csrfToken) return csrfToken;
    const response = await fetch(`${API_BASE}/api/security/csrf`, { credentials: "include" });
    const payload = await response.json().catch(() => ({}));
    if (response.ok && payload.success !== false) {
      rememberCsrf(payload.data || {});
      csrfToken = csrfToken || readCsrfFromCookie();
    }
    return csrfToken;
  }
  function setSession(data) {
    if (data.accessToken) localStorage.setItem(TOKEN_KEY, data.accessToken);
    if (data.customer) localStorage.setItem(CUSTOMER_KEY, JSON.stringify(data.customer));
    rememberCsrf(data);
  }
  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
  }
  function getCustomer() {
    try { return JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "null"); } catch (_) { return null; }
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }
  function formToObject(form) {
    return Object.fromEntries(new FormData(form).entries());
  }
  async function api(path, options = {}, retry = true) {
    const headers = { ...(options.headers || {}) };
    const method = String(options.method || "GET").toUpperCase();
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
      const token = await ensureCsrf();
      if (token) headers["X-CSRF-Token"] = token;
    }
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    const response = await fetch(`${API_BASE}${path}`, { credentials: "include", ...options, headers });
    let payload = null;
    try { payload = await response.json(); } catch (_) { payload = { success: false, message: response.statusText }; }
    if (response.status === 401 && retry && path !== "/api/v1/customer/auth/refresh") {
      const refreshed = await refresh();
      if (refreshed) return api(path, options, false);
    }
    if (!response.ok || payload.success === false) throw new Error(payload.message || "Request failed");
    rememberCsrf(payload.data || {});
    return payload.data || {};
  }
  async function register(data) {
    const firebase = await getFirebaseClient();
    try {
      await firebase.setPersistence(firebase.auth, firebase.browserLocalPersistence);
      const credential = await firebase.createUserWithEmailAndPassword(firebase.auth, String(data.email || "").trim(), String(data.password || ""));
      const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
      if (fullName) await firebase.updateProfile(credential.user, { displayName: fullName });
      const idToken = await credential.user.getIdToken(true);
      const response = await api("/api/v1/customer/auth/register", {
        method: "POST",
        body: JSON.stringify({
          idToken,
          firstName: data.firstName,
          lastName: data.lastName,
          email: credential.user.email,
          phoneNumber: data.phoneNumber || ""
        })
      }, false);
      setSession(response);
      return response;
    } catch (error) {
      throw new Error(authErrorMessage(error));
    }
  }
  async function login(data) {
    const firebase = await getFirebaseClient();
    try {
      const persistence = data.rememberMe ? firebase.browserLocalPersistence : firebase.browserSessionPersistence;
      await firebase.setPersistence(firebase.auth, persistence);
      const credential = await firebase.signInWithEmailAndPassword(firebase.auth, String(data.email || "").trim(), String(data.password || ""));
      const idToken = await credential.user.getIdToken(true);
      const response = await api("/api/v1/customer/auth/login", {
        method: "POST",
        body: JSON.stringify({ idToken, rememberMe: Boolean(data.rememberMe) })
      }, false);
      setSession(response);
      return response;
    } catch (error) {
      throw new Error(authErrorMessage(error));
    }
  }
  async function refresh() {
    try {
      const headers = { "Content-Type": "application/json" };
      const token = await ensureCsrf();
      if (token) headers["X-CSRF-Token"] = token;
      const response = await fetch(`${API_BASE}/api/v1/customer/auth/refresh`, { method: "POST", credentials: "include", headers, body: "{}" });
      const payload = await response.json();
      if (!response.ok || payload.success === false) throw new Error(payload.message || "Refresh failed");
      setSession(payload.data || {});
      return true;
    } catch (_) {
      clearSession();
      return false;
    }
  }
  async function requireAuth() {
    if (!getAccessToken()) {
      const ok = await refresh();
      if (!ok) {
        window.location.href = `customer-login.html?next=${encodeURIComponent(location.pathname.split("/").pop() || "account.html")}`;
        return null;
      }
    }
    try {
      const data = await api("/api/v1/customer/auth/me");
      setSession(data);
      return data.customer;
    } catch (_) {
      clearSession();
      window.location.href = `customer-login.html?next=${encodeURIComponent(location.pathname.split("/").pop() || "account.html")}`;
      return null;
    }
  }
  async function logout() {
    try { await api("/api/v1/customer/auth/logout", { method: "POST", body: "{}" }); } catch (_) {}
    try {
      const firebase = await getFirebaseClient();
      await firebase.signOut(firebase.auth);
    } catch (_) {}
    clearSession();
    window.location.href = "customer-login.html";
  }
  function showMessage(el, message) {
    if (!el) return;
    el.textContent = message;
    el.style.display = message ? "block" : "none";
  }
  function setLoading(button, loading, text) {
    if (!button) return;
    if (loading) {
      button.dataset.originalText = button.textContent;
      button.textContent = text || "Please wait...";
      button.disabled = true;
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
    }
  }

  window.OrlaCustomer = { api, register, login, refresh, requireAuth, logout, setSession, clearSession, getCustomer, getAccessToken, escapeHtml, formToObject, showMessage, setLoading };
})();
