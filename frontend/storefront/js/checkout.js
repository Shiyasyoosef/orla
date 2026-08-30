(function () {
  const state = { addresses: [], selectedAddressId: null, customer: null };
  const els = {};

  function addressLine(address) {
    return [address.streetAddress, address.area, address.city, address.emirate || address.state, address.country, address.pincode || address.zipCode].filter(Boolean).join(", ");
  }
  function renderAddresses() {
    if (!state.addresses.length) {
      els.addressOptions.innerHTML = `<div class="empty-state">No saved address yet. Add a delivery address below.</div>`;
      return;
    }
    if (!state.selectedAddressId) {
      const defaultAddress = state.addresses.find((item) => item.isDefaultShipping) || state.addresses[0];
      state.selectedAddressId = defaultAddress.addressId;
    }
    els.addressOptions.innerHTML = state.addresses.map((address) => `
      <label class="radio-card">
        <input type="radio" name="selectedAddress" value="${address.addressId}" ${String(state.selectedAddressId) === String(address.addressId) ? "checked" : ""}>
        <strong>${OrlaCustomer.escapeHtml(address.addressType || "Home")}</strong>
        ${address.isDefaultShipping ? `<span class="badge" style="margin-left:8px;">Default</span>` : ""}
        <p>${OrlaCustomer.escapeHtml(address.fullName)} · ${OrlaCustomer.escapeHtml(address.phoneNumber)}</p>
        <p>${OrlaCustomer.escapeHtml(addressLine(address))}</p>
      </label>
    `).join("");
  }
  async function loadAddresses() {
    const data = await OrlaCustomer.api("/api/v1/customer/addresses");
    state.addresses = data.addresses || [];
    renderAddresses();
  }
  function payloadFromCheckoutForm() {
    const data = OrlaCustomer.formToObject(els.form);
    data.isDefaultShipping = els.form.isDefaultShipping.checked;
    data.isDefaultBilling = els.form.isDefaultBilling.checked;
    return data;
  }
  function clearForm() {
    els.form.reset();
    els.form.addressType.value = "Home";
    els.form.country.value = "United Arab Emirates";
    els.form.saveAddress.checked = true;
  }
  async function addInlineAddress(event) {
    event.preventDefault();
    const button = event.submitter;
    const saveToProfile = els.form.saveAddress.checked;
    OrlaCustomer.showMessage(els.error, "");
    OrlaCustomer.showMessage(els.success, "");
    OrlaCustomer.setLoading(button, true, saveToProfile ? "Saving..." : "Using address...");
    try {
      const payload = payloadFromCheckoutForm();
      if (saveToProfile) {
        const data = await OrlaCustomer.api("/api/v1/customer/addresses", { method: "POST", body: JSON.stringify(payload) });
        state.addresses.unshift(data.address);
        state.selectedAddressId = data.address.addressId;
        renderAddresses();
        clearForm();
        OrlaCustomer.showMessage(els.success, "Address saved to your profile and selected for delivery.");
      } else {
        OrlaCustomer.showMessage(els.success, "Address will be used for this checkout only.");
      }
    } catch (err) {
      OrlaCustomer.showMessage(els.error, err.message);
    } finally {
      OrlaCustomer.setLoading(button, false);
    }
  }
  async function init() {
    els.addressOptions = document.querySelector("#addressOptions");
    els.form = document.querySelector("#checkoutAddressForm");
    els.error = document.querySelector("#checkoutAddressError");
    els.success = document.querySelector("#checkoutAddressSuccess");
    state.customer = await OrlaCustomer.requireAuth();
    if (!state.customer) return;
    document.querySelector("#checkoutCustomerName").textContent = state.customer.fullName || state.customer.email;
    document.querySelector("#logoutBtn").addEventListener("click", OrlaCustomer.logout);
    els.addressOptions.addEventListener("change", (event) => {
      if (event.target.name === "selectedAddress") state.selectedAddressId = event.target.value;
    });
    els.form.addEventListener("submit", addInlineAddress);
    await loadAddresses();
  }
  document.addEventListener("DOMContentLoaded", init);
})();