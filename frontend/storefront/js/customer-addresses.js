(function () {
  const state = { addresses: [], editingId: null };
  const els = {};

  function addressLine(address) {
    return [address.streetAddress, address.area, address.city, address.emirate || address.state, address.country, address.pincode || address.zipCode].filter(Boolean).join(", ");
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
        <span class="badge">${OrlaCustomer.escapeHtml(address.addressType || "Home")}${address.isDefaultShipping ? " · Default shipping" : ""}</span>
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
  async function loadAddresses() {
    const data = await OrlaCustomer.api("/api/v1/customer/addresses");
    state.addresses = data.addresses || [];
    render();
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
    const customer = await OrlaCustomer.requireAuth();
    if (!customer) return;
    document.querySelector("#customerName").textContent = customer.fullName || `${customer.firstName} ${customer.lastName}`.trim() || "My Account";
    document.querySelector("#logoutBtn").addEventListener("click", OrlaCustomer.logout);
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
  }
  document.addEventListener("DOMContentLoaded", init);
})();