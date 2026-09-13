(function () {
  const state = { addresses: [], editingId: null, customer: null };
  const els = {};
  const panelCopy = {
    returns: ["Returns", "Return requests will appear here once eligible delivered products are available for return."],
    exchanges: ["Exchanges", "Exchange requests will appear here. You can request a different size or suitable replacement when a product is eligible."],
    wallet: ["Wallet", "Your store credits, refunds, cashback and adjustment balances will be listed here."],
    coupons: ["Coupons", "Active discount codes and reward offers assigned to your account will be shown here."],
    cards: ["Payment Cards", "Saved credit and debit cards for faster checkout will be managed here when card vault support is enabled."],
    reviews: ["Reviews", "Products purchased from your account will appear here so you can write and manage reviews."],
    notifications: ["Notifications", "Manage order updates, promotions and account alert preferences from this section."],
    help: ["Help Center", "Need help? Contact support, view FAQs, or check delivery and return guidance."],
    country: ["Country Selector", "Current region: United Arab Emirates. More country options can be enabled from the storefront settings."],
    language: ["Switch Language", "Current language: English. Arabic storefront language support can be connected here."]
  };

  function addressLine(address) {
    return [address.streetAddress, address.area, address.city, address.emirate || address.state, address.country, address.pincode || address.zipCode].filter(Boolean).join(", ");
  }
  function customerName(customer) {
    return customer?.fullName || `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim() || "Customer";
  }
  function profileCompletion(customer) {
    const fields = [customer?.firstName, customer?.lastName, customer?.email, customer?.phoneNumber, state.addresses.length ? "address" : ""];
    const complete = fields.filter((value) => String(value || "").trim()).length;
    return Math.max(20, Math.round((complete / fields.length) * 100));
  }
  function updateOverview() {
    const customer = state.customer || {};
    const name = customerName(customer);
    const percent = profileCompletion(customer);
    document.querySelector("#customerEmail").textContent = customer.email || "Customer account";
    document.querySelector("#accountInitial").textContent = (name.trim()[0] || "O").toUpperCase();
    document.querySelector("#profileProgressText").textContent = `${percent}%`;
    document.querySelector("#profileProgressBar").style.width = `${percent}%`;
  }
  function setModal(open) {
    els.modal.classList.toggle("is-open", open);
    els.modal.setAttribute("aria-hidden", open ? "false" : "true");
  }
  function resetForm() {
    state.editingId = null;
    els.form.reset();
    els.modalTitle.textContent = "Add new address";
    els.form.addressType.value = "Home";
    els.form.country.value = "United Arab Emirates";
    els.form.isDefaultShipping.checked = false;
    els.form.isDefaultBilling.checked = false;
    OrlaCustomer.showMessage(els.error, "");
  }
  function render() {
    if (!state.addresses.length) {
      els.grid.innerHTML = `<div class="empty-state"><h3>No saved addresses yet</h3><p>Add your home or office address for faster checkout.</p></div>`;
      return;
    }
    els.grid.innerHTML = state.addresses.map((address) => `
      <article class="address-card ${address.isDefaultShipping ? "is-default" : ""}" data-address-id="${address.addressId}">
        <span class="badge">${OrlaCustomer.escapeHtml(address.addressType || "Home")}${address.isDefaultShipping ? " - Default shipping" : ""}</span>
        <h3>${OrlaCustomer.escapeHtml(address.fullName)}</h3>
        <p>${OrlaCustomer.escapeHtml(address.phoneNumber)}</p>
        <p>${OrlaCustomer.escapeHtml(addressLine(address))}</p>
        ${address.isDefaultBilling ? `<p><strong>Default billing address</strong></p>` : ""}
        <div class="card-actions">
          <button class="icon-btn" type="button" data-edit="${address.addressId}" aria-label="Edit address">&#9998;</button>
          <button class="icon-btn" type="button" data-delete="${address.addressId}" aria-label="Delete address">&#128465;</button>
        </div>
      </article>
    `).join("");
  }
  function showDashboard() {
    els.detailPanel.hidden = true;
    els.addressManager.hidden = true;
    els.panelContent.hidden = false;
    history.replaceState(null, "", "account.html");
  }
  function placeholderHtml(view) {
    if (view === "profile") {
      const customer = state.customer || {};
      return `
        <strong>User Profile</strong>
        <p>Review the registered details connected to this account.</p>
        <ul class="account-placeholder-list">
          <li><span>Name</span><b>${OrlaCustomer.escapeHtml(customerName(customer))}</b></li>
          <li><span>Email</span><b>${OrlaCustomer.escapeHtml(customer.email || "Not added")}</b></li>
          <li><span>Phone</span><b>${OrlaCustomer.escapeHtml(customer.phoneNumber || "Not added")}</b></li>
        </ul>
      `;
    }
    const [title, message] = panelCopy[view] || ["Account", "This account section is being prepared."];
    return `<strong>${OrlaCustomer.escapeHtml(title)}</strong><p>${OrlaCustomer.escapeHtml(message)}</p>`;
  }
  function showPanel(view) {
    const isAddresses = view === "addresses";
    const [title] = isAddresses ? ["Delivery Addresses"] : (panelCopy[view] || (view === "profile" ? ["User Profile"] : ["Account"]));
    els.panelTitle.textContent = title;
    els.detailPanel.hidden = false;
    els.addressManager.hidden = !isAddresses;
    els.panelContent.hidden = isAddresses;
    if (!isAddresses) els.panelContent.innerHTML = placeholderHtml(view);
    history.replaceState(null, "", `account.html#${view}`);
    els.detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  async function loadAddresses() {
    const data = await OrlaCustomer.api("/api/v1/customer/addresses");
    state.addresses = data.addresses || [];
    render();
    updateOverview();
  }
  function fillForm(address) {
    state.editingId = address.addressId;
    els.modalTitle.textContent = "Edit address";
    els.form.addressType.value = address.addressType || "Home";
    els.form.fullName.value = address.fullName || "";
    els.form.phoneNumber.value = address.phoneNumber || "";
    els.form.streetAddress.value = address.streetAddress || "";
    els.form.city.value = address.city || "";
    els.form.area.value = address.area || "";
    els.form.emirate.value = address.emirate || address.state || "";
    els.form.country.value = address.country || "United Arab Emirates";
    els.form.pincode.value = address.pincode || address.zipCode || "";
    els.form.isDefaultShipping.checked = Boolean(address.isDefaultShipping);
    els.form.isDefaultBilling.checked = Boolean(address.isDefaultBilling);
  }
  function payloadFromForm() {
    const data = OrlaCustomer.formToObject(els.form);
    data.isDefaultShipping = els.form.isDefaultShipping.checked;
    data.isDefaultBilling = els.form.isDefaultBilling.checked;
    return data;
  }
  async function saveAddress(event) {
    event.preventDefault();
    const button = event.submitter;
    OrlaCustomer.showMessage(els.error, "");
    OrlaCustomer.setLoading(button, true, "Saving...");
    try {
      const payload = payloadFromForm();
      const path = state.editingId ? `/api/v1/customer/addresses/${state.editingId}` : "/api/v1/customer/addresses";
      const method = state.editingId ? "PUT" : "POST";
      await OrlaCustomer.api(path, { method, body: JSON.stringify(payload) });
      setModal(false);
      resetForm();
      await loadAddresses();
    } catch (err) {
      OrlaCustomer.showMessage(els.error, err.message);
    } finally {
      OrlaCustomer.setLoading(button, false);
    }
  }
  async function removeAddress(id) {
    if (!confirm("Delete this address?")) return;
    await OrlaCustomer.api(`/api/v1/customer/addresses/${id}`, { method: "DELETE" });
    await loadAddresses();
  }
  async function init() {
    els.grid = document.querySelector("#addressGrid");
    els.modal = document.querySelector("#addressModal");
    els.form = document.querySelector("#addressForm");
    els.modalTitle = document.querySelector("#addressModalTitle");
    els.error = document.querySelector("#addressError");
    els.detailPanel = document.querySelector("#accountDetailPanel");
    els.panelTitle = document.querySelector("#accountPanelTitle");
    els.panelContent = document.querySelector("#accountPanelContent");
    els.addressManager = document.querySelector("#addressManager");
    const customer = await OrlaCustomer.requireAuth();
    if (!customer) return;
    state.customer = customer;
    updateOverview();
    document.querySelector("#logoutBtn")?.addEventListener("click", OrlaCustomer.logout);
    document.querySelector("#backToDashboard")?.addEventListener("click", showDashboard);
    document.querySelectorAll("[data-account-view]").forEach((button) => {
      button.addEventListener("click", () => showPanel(button.dataset.accountView));
    });
    document.querySelector("#addAddressBtn").addEventListener("click", () => { resetForm(); setModal(true); });
    document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", () => setModal(false)));
    els.form.addEventListener("submit", saveAddress);
    els.grid.addEventListener("click", async (event) => {
      const editButton = event.target.closest("[data-edit]");
      const deleteButton = event.target.closest("[data-delete]");
      if (editButton) {
        const address = state.addresses.find((item) => String(item.addressId) === String(editButton.dataset.edit));
        if (address) { fillForm(address); setModal(true); }
      }
      if (deleteButton) await removeAddress(deleteButton.dataset.delete);
    });
    await loadAddresses();
    const initialView = location.hash.replace("#", "");
    if (initialView) showPanel(initialView);
  }
  document.addEventListener("DOMContentLoaded", init);
})();
