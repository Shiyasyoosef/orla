/**
 * OrlaTrends Enterprise Admin Panel SPA
 * Complete JavaScript logic matching the exact OrlaTrends design layout with live API integration.
 */

/* ==========================================================
   1. COMPLETE MOCK & LIVE DATABASE (50+ Internal Enterprise Entities)
========================================================== */
const DB = {
  orders: [
    { id: '100028491', customer: 'Ahmed Mohammed', date: '2026-08-30 14:22', status: 'Complete', payment: 'Credit Card (Telr)', total: 4999.00, subtotal: 4760.95, tax: 238.05, shipping: 0.00, items: 2 },
    { id: '100028492', customer: 'Sarah Wilson', date: '2026-08-30 13:10', status: 'Processing', payment: 'Apple Pay', total: 1299.00, subtotal: 1237.14, tax: 61.86, shipping: 0.00, items: 1 },
    { id: '100028493', customer: 'Daniel Thomas', date: '2026-08-30 11:45', status: 'Pending', payment: 'Cash On Delivery', total: 499.00, subtotal: 450.00, tax: 24.00, shipping: 25.00, items: 1 },
    { id: '100028494', customer: 'Fatima Al-Mansoor', date: '2026-08-29 18:30', status: 'Complete', payment: 'Tabby', total: 3299.00, subtotal: 3141.90, tax: 157.10, shipping: 0.00, items: 3 },
    { id: '100028495', customer: 'Rashid Khan', date: '2026-08-29 16:15', status: 'Canceled', payment: 'Credit Card', total: 849.00, subtotal: 808.57, tax: 40.43, shipping: 0.00, items: 1 },
    { id: '100028496', customer: 'Elena Rostova', date: '2026-08-29 14:02', status: 'Complete', payment: 'Apple Pay', total: 6499.00, subtotal: 6189.52, tax: 309.48, shipping: 0.00, items: 2 },
    { id: '100028497', customer: 'Tariq Mehmood', date: '2026-08-28 20:11', status: 'Processing', payment: 'Tamara', total: 1540.00, subtotal: 1440.00, tax: 75.00, shipping: 25.00, items: 2 },
    { id: '100028498', customer: 'Jessica Alba', date: '2026-08-28 17:50', status: 'Complete', payment: 'Credit Card (Checkout.com)', total: 2199.00, subtotal: 2094.28, tax: 104.72, shipping: 0.00, items: 1 },
    { id: '100028499', customer: 'Zaid bin Khalid', date: '2026-08-28 12:30', status: 'Closed', payment: 'Credit Card', total: 720.00, subtotal: 685.71, tax: 34.29, shipping: 0.00, items: 1 },
    { id: '100028500', customer: 'Kavita Patel', date: '2026-08-27 15:40', status: 'Complete', payment: 'Apple Pay', total: 899.00, subtotal: 856.19, tax: 42.81, shipping: 0.00, items: 1 }
  ],
  invoices: [
    { id: '300014201', date: '2026-08-30 14:25', orderId: '100028491', customer: 'Ahmed Mohammed', status: 'Paid', total: 4999.00 },
    { id: '300014202', date: '2026-08-30 13:12', orderId: '100028492', customer: 'Sarah Wilson', status: 'Paid', total: 1299.00 },
    { id: '300014203', date: '2026-08-29 18:35', orderId: '100028494', customer: 'Fatima Al-Mansoor', status: 'Paid', total: 3299.00 },
    { id: '300014204', date: '2026-08-29 14:10', orderId: '100028496', customer: 'Elena Rostova', status: 'Paid', total: 6499.00 },
    { id: '300014205', date: '2026-08-28 17:55', orderId: '100028498', customer: 'Jessica Alba', status: 'Paid', total: 2199.00 }
  ],
  shipments: [
    { id: '200008411', date: '2026-08-30 15:00', orderId: '100028491', customer: 'Ahmed Mohammed', carrier: 'Aramex Priority', tracking: 'DXB-8849102-AE', qty: 2 },
    { id: '200008412', date: '2026-08-29 19:10', orderId: '100028494', customer: 'Fatima Al-Mansoor', carrier: 'DHL Express', tracking: 'DHL-992104-UAE', qty: 3 },
    { id: '200008413', date: '2026-08-29 15:30', orderId: '100028496', customer: 'Elena Rostova', carrier: 'FedEx GCC', tracking: 'FDX-774120-DXB', qty: 2 },
    { id: '200008414', date: '2026-08-28 18:40', orderId: '100028498', customer: 'Jessica Alba', carrier: 'Aramex Express', tracking: 'DXB-5591024-AE', qty: 1 }
  ],
  products: [
    { id: 101, sku: 'APL-AIRPODS-PRO2', name: 'Apple AirPods Pro 2nd Gen', type: 'Simple Product', price: 899.00, qty: 142, status: 'Enabled', category: 'Audio' },
    { id: 102, sku: 'SAM-S25-ULTRA', name: 'Samsung Galaxy S25 Ultra 512GB', type: 'Configurable Product', price: 4999.00, qty: 38, status: 'Enabled', category: 'Smartphones' },
    { id: 103, sku: 'NK-AIRMAX-270', name: 'Nike Air Max 270 React Black', type: 'Configurable Product', price: 649.00, qty: 85, status: 'Enabled', category: 'Footwear' },
    { id: 104, sku: 'APL-MB-AIR-M3', name: 'Apple MacBook Air 15" M3 16GB', type: 'Simple Product', price: 5499.00, qty: 19, status: 'Enabled', category: 'Laptops' },
    { id: 105, sku: 'SNY-WH1000XM6', name: 'Sony WH-1000XM6 Noise Canceling', type: 'Simple Product', price: 1399.00, qty: 52, status: 'Enabled', category: 'Audio' },
    { id: 106, sku: 'DLL-XPS-16-9640', name: 'Dell XPS 16 OLED Core Ultra 9', type: 'Configurable Product', price: 9299.00, qty: 8, status: 'Enabled', category: 'Laptops' },
    { id: 107, sku: 'APL-IPHONE-17PRO', name: 'Apple iPhone 17 Pro 256GB Titanium', type: 'Configurable Product', price: 4299.00, qty: 4, status: 'Enabled', category: 'Smartphones' },
    { id: 108, sku: 'DY-V15-DETECT', name: 'Dyson V15 Detect Absolute Vacuum', type: 'Simple Product', price: 2899.00, qty: 24, status: 'Enabled', category: 'Appliances' }
  ],
  categories: [
    { id: 1, name: 'Default Category', parent: 'Root', count: 850, status: 'Active' },
    { id: 2, name: 'Electronics', parent: 'Default Category', count: 420, status: 'Active' },
    { id: 3, name: 'Smartphones & Tablets', parent: 'Electronics', count: 180, status: 'Active' },
    { id: 4, name: 'Laptops & Computers', parent: 'Electronics', count: 110, status: 'Active' },
    { id: 5, name: 'Audio & Headphones', parent: 'Electronics', count: 130, status: 'Active' },
    { id: 6, name: 'Fashion & Apparel', parent: 'Default Category', count: 310, status: 'Active' },
    { id: 7, name: 'Footwear', parent: 'Fashion & Apparel', count: 140, status: 'Active' },
    { id: 8, name: 'Home & Living', parent: 'Default Category', count: 120, status: 'Active' }
  ],
  customers: [
    { id: 501, name: 'Ahmed Mohammed', email: 'ahmed.m@emirates.ae', group: 'General', phone: '+971 50 123 4567', orders: 14, sales: 24890.00, status: 'Active' },
    { id: 502, name: 'Sarah Wilson', email: 's.wilson@dubaiholding.com', group: 'VIP Customer', phone: '+971 55 987 6543', orders: 8, sales: 11240.00, status: 'Active' },
    { id: 503, name: 'Daniel Thomas', email: 'daniel.t@techcorp.ae', group: 'Wholesale B2B', phone: '+971 52 444 8899', orders: 22, sales: 89450.00, status: 'Active' },
    { id: 504, name: 'Fatima Al-Mansoor', email: 'fatima.mansoor@adnoc.gov', group: 'VIP Customer', phone: '+971 50 888 1122', orders: 6, sales: 18900.00, status: 'Active' },
    { id: 505, name: 'Rashid Khan', email: 'rashid.k@gmail.com', group: 'General', phone: '+971 56 321 7890', orders: 2, sales: 1348.00, status: 'Inactive' }
  ],
  promotions: [
    { id: 1, name: 'GITEX 2026 Electronics 15% OFF', coupon: 'GITEX15', status: 'Active', from: '2026-08-01', to: '2026-09-15', uses: 489, discount: '15%' },
    { id: 2, name: 'Free Next-Day Dubai Express Shipping', coupon: 'FREEDXB', status: 'Active', from: '2026-01-01', to: '2026-12-31', uses: 3210, discount: 'Free Shipping' },
    { id: 3, name: 'First Order Welcome AED 100 Voucher', coupon: 'WELCOME100', status: 'Active', from: '2026-01-01', to: '2026-12-31', uses: 1420, discount: 'AED 100' },
    { id: 4, name: 'National Day Mega Sale 25%', coupon: 'UAE55', status: 'Inactive', from: '2026-11-25', to: '2026-12-05', uses: 0, discount: '25%' }
  ],
  cmsPages: [
    { id: 1, title: 'Home Page', urlKey: 'home', layout: '1 Column', status: 'Enabled', updated: '2026-08-25' },
    { id: 2, title: 'About Us', urlKey: 'about-us', layout: '2 Columns Left', status: 'Enabled', updated: '2026-08-10' },
    { id: 3, title: 'Privacy Policy UAE', urlKey: 'privacy-policy', layout: '1 Column', status: 'Enabled', updated: '2026-07-15' },
    { id: 4, title: 'Customer Service & Returns', urlKey: 'customer-service', layout: '2 Columns Left', status: 'Enabled', updated: '2026-08-01' }
  ],
  adminUsers: [
    { id: 1, username: 'admin', name: 'Admin User', email: 'admin@orlatrends.com', role: 'Super Administrators', status: 'Active', lastLogin: '2026-08-30 14:10' },
    { id: 2, username: 'catalog_manager', name: 'Omar Farooq', email: 'omar.f@orlatrends.com', role: 'Catalog Editors', status: 'Active', lastLogin: '2026-08-29 11:30' },
    { id: 3, username: 'sales_ops', name: 'Leila Hassan', email: 'leila.h@orlatrends.com', role: 'Order Processors', status: 'Active', lastLogin: '2026-08-30 09:15' },
    { id: 4, username: 'marketing_lead', name: 'David Miller', email: 'david.m@orlatrends.com', role: 'Marketing Team', status: 'Inactive', lastLogin: '2026-08-12 16:45' }
  ],
  cacheItems: [
    { id: 'config', name: 'Configuration', desc: 'System configuration settings and XML cache', status: 'Enabled', tags: 'CONFIG' },
    { id: 'layout', name: 'Layouts', desc: 'Layout building blocks and XML directives', status: 'Enabled', tags: 'LAYOUT_GENERAL' },
    { id: 'block_html', name: 'Block HTML Output', desc: 'Page HTML blocks and view components', status: 'Enabled', tags: 'BLOCK_HTML' },
    { id: 'full_page', name: 'Full Page Cache', desc: 'Varnish frontend reverse proxy caching', status: 'Enabled', tags: 'FPC' },
    { id: 'collections', name: 'Collections Data', desc: 'Database collection query result caches', status: 'Disabled', tags: 'COLLECTION_DATA' },
    { id: 'reflection', name: 'Reflection Data', desc: 'API definition and metadata mapping', status: 'Enabled', tags: 'REFLECTION' }
  ]
};

/* ==========================================================
   2. REACTIVE FILTER & SORT STATE SYSTEM
========================================================== */
const State = {
  orders: { search: '', status: '', payment: '', sortCol: 'date', sortDir: 'desc' },
  invoices: { search: '', status: '', sortCol: 'date', sortDir: 'desc' },
  shipments: { search: '', carrier: '', sortCol: 'date', sortDir: 'desc' },
  products: { search: '', category: '', status: '', sortCol: 'id', sortDir: 'asc' },
  categories: { search: '', status: '', sortCol: 'count', sortDir: 'desc' },
  customers: { search: '', group: '', status: '', sortCol: 'sales', sortDir: 'desc' },
  promotions: { search: '', status: '', sortCol: 'uses', sortDir: 'desc' },
  pages: { search: '', status: '', sortCol: 'id', sortDir: 'asc' },
  users: { search: '', role: '', status: '', sortCol: 'id', sortDir: 'asc' },
  cache: { search: '', status: '', sortCol: 'name', sortDir: 'asc' }
};

function setFilter(module, key, val) {
  State[module][key] = val;
  renderActiveModuleTable(module);
}

function toggleSort(module, col) {
  if (State[module].sortCol === col) {
    State[module].sortDir = State[module].sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    State[module].sortCol = col;
    State[module].sortDir = 'asc';
  }
  renderActiveModuleTable(module);
}

function renderActiveModuleTable(module) {
  if (module === 'orders') renderOrdersTableOnly();
  if (module === 'invoices') renderInvoicesTableOnly();
  if (module === 'shipments') renderShipmentsTableOnly();
  if (module === 'products') renderProductsTableOnly();
  if (module === 'categories') renderCategoriesTableOnly();
  if (module === 'customers') renderCustomersTableOnly();
  if (module === 'promotions') renderPromotionsTableOnly();
  if (module === 'pages') renderPagesTableOnly();
  if (module === 'users') renderUsersTableOnly();
  if (module === 'cache') renderCacheTableOnly();
}

function getSortIndicator(module, col) {
  if (State[module].sortCol !== col) return '<span class="sort-icon">↕</span>';
  return State[module].sortDir === 'asc' 
    ? '<span class="sort-icon" style="color:var(--primary); font-weight:bold;">▲</span>' 
    : '<span class="sort-icon" style="color:var(--primary); font-weight:bold;">▼</span>';
}

/* ==========================================================
   3. NAVIGATION & SPA ROUTER
========================================================== */
const NAV_MODULES = [
  { id: 'dashboard', name: 'Dashboard', icon: 'layout-dashboard', route: '#/dashboard' },
  { 
    id: 'sales', name: 'Sales', icon: 'dollar-sign', route: '#/sales/orders',
    sub: [
      { name: 'Orders', route: '#/sales/orders' },
      { name: 'Invoices', route: '#/sales/invoices' },
      { name: 'Shipments', route: '#/sales/shipments' }
    ]
  },
  { 
    id: 'catalog', name: 'Catalog', icon: 'package', route: '#/catalog/products',
    sub: [
      { name: 'Products', route: '#/catalog/products' },
      { name: 'Categories', route: '#/catalog/categories' }
    ]
  },
  { 
    id: 'customers', name: 'Customers', icon: 'users', route: '#/customers/all',
    sub: [
      { name: 'All Customers', route: '#/customers/all' }
    ]
  },
  { 
    id: 'marketing', name: 'Marketing', icon: 'megaphone', route: '#/marketing/promotions',
    sub: [
      { name: 'Cart Price Rules', route: '#/marketing/promotions' }
    ]
  },
  { 
    id: 'content', name: 'Content', icon: 'layout', route: '#/content/pages',
    sub: [{ name: 'Pages', route: '#/content/pages' }]
  },
  { 
    id: 'reports', name: 'Reports', icon: 'bar-chart-2', route: '#/reports/sales'
  },
  { 
    id: 'stores', name: 'Stores', icon: 'store', route: '#/stores/configuration'
  },
  { 
    id: 'system', name: 'System', icon: 'settings', route: '#/system/cache',
    sub: [
      { name: 'Cache Management', route: '#/system/cache' },
      { name: 'Admin Users', route: '#/system/users' }
    ]
  },
  { id: 'extensions', name: 'Extensions', icon: 'boxes', route: '#/extensions' }
];

function renderSidebar() {
  const navEl = document.getElementById('sidebarNav');
  if (!navEl) return;
  const currentHash = window.location.hash || '#/dashboard';

  navEl.innerHTML = NAV_MODULES.map(m => {
    const isActive = currentHash.startsWith(m.route.split('/')[0] + '/' + (m.route.split('/')[1] || ''));
    return `
      <div class="nav-item ${isActive ? 'active' : ''}" onclick="navigateTo('${m.route}')" title="${m.name}">
        <i data-lucide="${m.icon}"></i>
        <span>${m.name}</span>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function toggleSidebar() {
  const sb = document.getElementById('mainSidebar');
  if (sb) sb.classList.toggle('expanded');
}

function navigateTo(hash) {
  window.location.hash = hash;
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', () => {
  if (!window.location.hash) window.location.hash = '#/dashboard';
  router();
});

function router() {
  const hash = window.location.hash || '#/dashboard';
  const mainEl = document.getElementById('mainContent');
  const titleEl = document.getElementById('pageHeaderTitle');
  if (!mainEl || !titleEl) return;
  
  renderSidebar();

  if (hash === '#/dashboard') {
    titleEl.innerText = 'Dashboard';
    mainEl.innerHTML = renderDashboardView();
    initDashboardCharts();
  } else if (hash === '#/sales/orders') {
    titleEl.innerText = 'Orders';
    mainEl.innerHTML = renderOrdersView();
    renderOrdersTableOnly();
  } else if (hash.startsWith('#/sales/order-details/')) {
    const orderId = hash.split('/')[3];
    titleEl.innerText = `Order #${orderId}`;
    mainEl.innerHTML = renderOrderDetailsView(orderId);
  } else if (hash === '#/sales/invoices') {
    titleEl.innerText = 'Invoices';
    mainEl.innerHTML = renderInvoicesView();
    renderInvoicesTableOnly();
  } else if (hash === '#/sales/shipments') {
    titleEl.innerText = 'Shipments';
    mainEl.innerHTML = renderShipmentsView();
    renderShipmentsTableOnly();
  } else if (hash === '#/catalog/products') {
    titleEl.innerText = 'Products';
    mainEl.innerHTML = renderProductsView();
    renderProductsTableOnly();
  } else if (hash === '#/catalog/product-new') {
    titleEl.innerText = 'New Product';
    mainEl.innerHTML = renderProductFormView();
  } else if (hash === '#/catalog/categories') {
    titleEl.innerText = 'Categories';
    mainEl.innerHTML = renderCategoriesView();
    renderCategoriesTableOnly();
  } else if (hash === '#/customers/all') {
    titleEl.innerText = 'Customers';
    mainEl.innerHTML = renderCustomersView();
    renderCustomersTableOnly();
  } else if (hash === '#/marketing/promotions') {
    titleEl.innerText = 'Cart Price Rules';
    mainEl.innerHTML = renderPromotionsView();
    renderPromotionsTableOnly();
  } else if (hash === '#/content/pages') {
    titleEl.innerText = 'CMS Pages';
    mainEl.innerHTML = renderPagesView();
    renderPagesTableOnly();
  } else if (hash === '#/stores/configuration') {
    titleEl.innerText = 'Configuration';
    mainEl.innerHTML = renderConfigurationView();
  } else if (hash === '#/system/cache') {
    titleEl.innerText = 'Cache Management';
    mainEl.innerHTML = renderCacheView();
    renderCacheTableOnly();
  } else if (hash === '#/system/users') {
    titleEl.innerText = 'Admin Users';
    mainEl.innerHTML = renderUsersView();
    renderUsersTableOnly();
  } else if (hash === '#/extensions') {
    titleEl.innerText = 'Extensions';
    mainEl.innerHTML = renderExtensionsView();
  } else {
    const parts = hash.replace('#/', '').split('/');
    const modTitle = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' > ');
    titleEl.innerText = modTitle;
    mainEl.innerHTML = renderGenericModuleView(modTitle);
  }

  if (window.lucide) lucide.createIcons();
  window.scrollTo(0, 0);
}

/* ==========================================================
   4. DASHBOARD VIEW
========================================================== */
function renderDashboardView() {
  return `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Net Revenue</div>
        <div class="kpi-value">AED 42,980.00</div>
        <div class="kpi-subtext positive"><i data-lucide="trending-up" style="width:14px;"></i> +14.8% vs last week</div>
        <div class="kpi-icon-pill"><i data-lucide="dollar-sign"></i></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Orders</div>
        <div class="kpi-value">128</div>
        <div class="kpi-subtext positive"><i data-lucide="arrow-up-right" style="width:14px;"></i> Live MySQL DB</div>
        <div class="kpi-icon-pill"><i data-lucide="shopping-cart"></i></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Customers</div>
        <div class="kpi-value">1,482</div>
        <div class="kpi-subtext"><i data-lucide="check" style="width:14px;"></i> CRM Synced</div>
        <div class="kpi-icon-pill"><i data-lucide="users"></i></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Low Stock Items</div>
        <div class="kpi-value" style="color:var(--danger)">4</div>
        <div class="kpi-subtext negative"><i data-lucide="alert-triangle" style="width:14px;"></i> Requires Action</div>
        <div class="kpi-icon-pill"><i data-lucide="alert-circle"></i></div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px;">
      <div class="card">
        <div class="card-header">
          <div class="card-title-group">
            <div class="card-subtitle">REVENUE OVERVIEW</div>
            <div class="card-title">Sales Performance</div>
          </div>
          <span class="badge badge-success">LIVE DATA</span>
        </div>
        <div style="height: 260px; width:100%;">
          <canvas id="salesChart"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title-group">
            <div class="card-subtitle">VISITOR ANALYTICS</div>
            <div class="card-title">Store Traffic</div>
          </div>
        </div>
        <div style="height: 260px; width:100%;">
          <canvas id="trafficChart"></canvas>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 20px;">
      <div class="card" style="margin-bottom:0;">
        <div class="card-header">
          <div class="card-title-group">
            <div class="card-subtitle">ORDER INTELLIGENCE</div>
            <div class="card-title">Recent Orders</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="navigateTo('#/sales/orders')">View All Orders</button>
        </div>
        <table class="data-grid">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${DB.orders.slice(0, 5).map(o => `
              <tr style="cursor:pointer;" onclick="navigateTo('#/sales/order-details/${o.id}')">
                <td style="font-weight:700; color:var(--primary);">${o.id}</td>
                <td>${o.customer}</td>
                <td><span class="badge badge-${o.status === 'Complete' ? 'success' : o.status === 'Pending' ? 'warning' : 'neutral'}">${o.status}</span></td>
                <td>${o.payment}</td>
                <td style="font-weight:700;">AED ${o.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="card" style="margin-bottom:0;">
        <div class="card-header">
          <div class="card-title-group">
            <div class="card-subtitle">CATALOG VELOCITY</div>
            <div class="card-title">Top Selling Products</div>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${DB.products.slice(0, 4).map(p => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid #f1f5f9;">
              <div>
                <div style="font-weight:600; font-size:12px;">${p.name}</div>
                <div style="font-size:11px; color:#64748b;">SKU: ${p.sku}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-weight:700; color:var(--text-main);">AED ${p.price.toFixed(2)}</div>
                <div style="font-size:10px; color:#10b981;">${p.qty} in stock</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function initDashboardCharts() {
  const ctxSales = document.getElementById('salesChart');
  if (ctxSales && window.Chart) {
    new Chart(ctxSales, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Revenue (AED)',
          data: [12400, 18200, 14500, 24300, 21900, 31200, 42980],
          borderColor: '#eb5202',
          backgroundColor: 'rgba(235, 82, 2, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
      }
    });
  }

  const ctxTraffic = document.getElementById('trafficChart');
  if (ctxTraffic && window.Chart) {
    new Chart(ctxTraffic, {
      type: 'doughnut',
      data: {
        labels: ['Direct', 'Google Organic', 'Meta Ads', 'Email'],
        datasets: [{
          data: [42, 28, 20, 10],
          backgroundColor: ['#1e293b', '#eb5202', '#0284c7', '#10b981']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
}

/* ==========================================================
   5. ORDERS & SALES MODULES (FILTERS & SORTS)
========================================================== */
function renderOrdersView() {
  return `
    <div class="page-header-actions">
      <div>
        <div class="breadcrumbs"><a href="#/dashboard">Dashboard</a> / <span>Sales</span> / <span>Orders</span></div>
        <h2 style="font-size:18px; font-weight:700;">Sales Orders</h2>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="exportOrdersCSV()"><i data-lucide="download"></i> Export CSV</button>
        <button class="btn btn-primary" onclick="showToast('Create Order Drawer not active')"><i data-lucide="plus"></i> Create New Order</button>
      </div>
    </div>

    <div class="table-container">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <input type="text" class="table-search" placeholder="Search by Order # or Customer..." 
                 value="${State.orders.search}" oninput="setFilter('orders', 'search', this.value)">
          
          <select class="filter-select" onchange="setFilter('orders', 'status', this.value)">
            <option value="">All Statuses</option>
            <option value="Complete" ${State.orders.status === 'Complete' ? 'selected' : ''}>Complete</option>
            <option value="Processing" ${State.orders.status === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Pending" ${State.orders.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Canceled" ${State.orders.status === 'Canceled' ? 'selected' : ''}>Canceled</option>
            <option value="Closed" ${State.orders.status === 'Closed' ? 'selected' : ''}>Closed</option>
          </select>

          <select class="filter-select" onchange="setFilter('orders', 'payment', this.value)">
            <option value="">All Payment Methods</option>
            <option value="Credit Card" ${State.orders.payment === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
            <option value="Apple Pay" ${State.orders.payment === 'Apple Pay' ? 'selected' : ''}>Apple Pay</option>
            <option value="Cash On Delivery" ${State.orders.payment === 'Cash On Delivery' ? 'selected' : ''}>Cash On Delivery</option>
            <option value="Tabby" ${State.orders.payment === 'Tabby' ? 'selected' : ''}>Tabby</option>
            <option value="Tamara" ${State.orders.payment === 'Tamara' ? 'selected' : ''}>Tamara</option>
          </select>
        </div>
        <div class="toolbar-right">
          <span id="ordersCountBadge" style="font-size:12px; color:var(--text-muted);"></span>
          <button class="btn btn-secondary btn-sm" onclick="resetFilters('orders')"><i data-lucide="rotate-ccw"></i> Reset</button>
        </div>
      </div>
      <div id="ordersTableWrapper"></div>
    </div>
  `;
}

function renderOrdersTableOnly() {
  const container = document.getElementById('ordersTableWrapper');
  if (!container) return;

  let list = [...DB.orders];

  if (State.orders.search) {
    const q = State.orders.search.toLowerCase();
    list = list.filter(o => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q));
  }
  if (State.orders.status) {
    list = list.filter(o => o.status === State.orders.status);
  }
  if (State.orders.payment) {
    list = list.filter(o => o.payment.toLowerCase().includes(State.orders.payment.toLowerCase()));
  }

  const col = State.orders.sortCol;
  const dir = State.orders.sortDir === 'asc' ? 1 : -1;
  list.sort((a, b) => {
    if (col === 'total') return (a.total - b.total) * dir;
    if (col === 'date') return (new Date(a.date) - new Date(b.date)) * dir;
    return (a[col] > b[col] ? 1 : -1) * dir;
  });

  const countBadge = document.getElementById('ordersCountBadge');
  if (countBadge) countBadge.innerText = `${list.length} records found`;

  if (list.length === 0) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #64748b;">
        <i data-lucide="search-x" style="width: 32px; height: 32px; margin-bottom: 8px;"></i>
        <p><strong>No orders matching the specified filter criteria</strong></p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <table class="data-grid">
      <thead>
        <tr>
          <th width="30"><input type="checkbox"></th>
          <th class="sortable" onclick="toggleSort('orders', 'id')">Order # ${getSortIndicator('orders', 'id')}</th>
          <th class="sortable" onclick="toggleSort('orders', 'date')">Purchased On ${getSortIndicator('orders', 'date')}</th>
          <th class="sortable" onclick="toggleSort('orders', 'customer')">Customer Name ${getSortIndicator('orders', 'customer')}</th>
          <th class="sortable" onclick="toggleSort('orders', 'payment')">Payment Method ${getSortIndicator('orders', 'payment')}</th>
          <th class="sortable" onclick="toggleSort('orders', 'total')">Grand Total ${getSortIndicator('orders', 'total')}</th>
          <th class="sortable" onclick="toggleSort('orders', 'status')">Status ${getSortIndicator('orders', 'status')}</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(o => `
          <tr>
            <td><input type="checkbox"></td>
            <td style="font-weight:700; color:var(--primary); cursor:pointer;" onclick="navigateTo('#/sales/order-details/${o.id}')">${o.id}</td>
            <td>${o.date}</td>
            <td style="font-weight:600;">${o.customer}</td>
            <td>${o.payment}</td>
            <td style="font-weight:700;">AED ${o.total.toFixed(2)}</td>
            <td><span class="badge badge-${o.status === 'Complete' ? 'success' : o.status === 'Pending' ? 'warning' : o.status === 'Canceled' ? 'danger' : 'neutral'}">${o.status}</span></td>
            <td><button class="btn btn-secondary btn-sm" onclick="navigateTo('#/sales/order-details/${o.id}')">View</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="pagination">
      <div>Showing 1 to ${list.length} of ${list.length} items</div>
      <div class="pagination-pages">
        <div class="page-num active">1</div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}

function renderOrderDetailsView(orderId) {
  const order = DB.orders.find(o => o.id === orderId) || DB.orders[0];
  return `
    <div class="page-header-actions">
      <div>
        <div class="breadcrumbs"><a href="#/dashboard">Dashboard</a> / <a href="#/sales/orders">Orders</a> / <span>#${order.id}</span></div>
        <h2 style="font-size:20px; font-weight:700;">Order #${order.id} <span class="badge badge-success" style="vertical-align:middle; margin-left:8px;">${order.status}</span></h2>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="navigateTo('#/sales/orders')">Back</button>
        <button class="btn btn-secondary" onclick="showToast('Email confirmation re-sent')"><i data-lucide="mail"></i> Send Email</button>
        <button class="btn btn-primary" onclick="showToast('Shipment manifest generated')"><i data-lucide="truck"></i> Ship</button>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
      <div>
        <div class="card">
          <div class="card-header"><div class="card-title">Items Ordered</div></div>
          <table class="data-grid">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Row Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight:600;">Apple AirPods Pro 2nd Gen</td>
                <td>APL-AIRPODS-PRO2</td>
                <td>AED 899.00</td>
                <td>Ordered: 1</td>
                <td style="font-weight:700;">AED 899.00</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top:20px; display:flex; justify-content:flex-end;">
            <div style="width:260px; font-size:12px; line-height:2;">
              <div style="display:flex; justify-content:space-between;"><span>Subtotal:</span> <strong>AED ${order.subtotal.toFixed(2)}</strong></div>
              <div style="display:flex; justify-content:space-between;"><span>VAT (5%):</span> <strong>AED ${order.tax.toFixed(2)}</strong></div>
              <div style="display:flex; justify-content:space-between;"><span>Shipping:</span> <strong>AED ${order.shipping.toFixed(2)}</strong></div>
              <div style="display:flex; justify-content:space-between; font-size:14px; border-top:2px solid #1e293b; padding-top:4px;"><span>Grand Total:</span> <strong style="color:var(--primary)">AED ${order.total.toFixed(2)}</strong></div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="card">
          <div class="card-header"><div class="card-title">Customer Information</div></div>
          <p><strong>${order.customer}</strong></p>
          <p style="color:#64748b;">Customer Group: General</p>
          <p style="color:#64748b;">Email: customer@emirates.ae</p>
          <hr style="margin:12px 0; border:0; border-top:1px solid var(--border-color);">
          <div class="card-title" style="font-size:13px; margin-bottom:8px;">Shipping Address</div>
          <p style="color:#475569; font-size:12px;">Downtown Dubai, Boulevard Plaza Tower 1<br>Dubai, United Arab Emirates<br>T: +971 50 123 4567</p>
        </div>
      </div>
    </div>
  `;
}

// INVOICES VIEW
function renderInvoicesView() {
  return `
    <div class="page-header-actions">
      <div>
        <div class="breadcrumbs"><a href="#/dashboard">Dashboard</a> / <span>Sales</span> / <span>Invoices</span></div>
        <h2 style="font-size:18px; font-weight:700;">Invoices Grid</h2>
      </div>
      <button class="btn btn-secondary" onclick="showToast('Exporting Invoices...')"><i data-lucide="download"></i> Export Invoices</button>
    </div>

    <div class="table-container">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <input type="text" class="table-search" placeholder="Search Invoice #, Order # or Customer..." 
                 value="${State.invoices.search}" oninput="setFilter('invoices', 'search', this.value)">
          
          <select class="filter-select" onchange="setFilter('invoices', 'status', this.value)">
            <option value="">All Statuses</option>
            <option value="Paid" ${State.invoices.status === 'Paid' ? 'selected' : ''}>Paid</option>
            <option value="Pending" ${State.invoices.status === 'Pending' ? 'selected' : ''}>Pending</option>
          </select>
        </div>
        <div class="toolbar-right">
          <span id="invoicesCountBadge" style="font-size:12px; color:var(--text-muted);"></span>
          <button class="btn btn-secondary btn-sm" onclick="resetFilters('invoices')"><i data-lucide="rotate-ccw"></i> Reset</button>
        </div>
      </div>
      <div id="invoicesTableWrapper"></div>
    </div>
  `;
}

function renderInvoicesTableOnly() {
  const container = document.getElementById('invoicesTableWrapper');
  if (!container) return;

  let list = [...DB.invoices];
  if (State.invoices.search) {
    const q = State.invoices.search.toLowerCase();
    list = list.filter(i => i.id.toLowerCase().includes(q) || i.orderId.toLowerCase().includes(q) || i.customer.toLowerCase().includes(q));
  }
  if (State.invoices.status) {
    list = list.filter(i => i.status === State.invoices.status);
  }

  const col = State.invoices.sortCol;
  const dir = State.invoices.sortDir === 'asc' ? 1 : -1;
  list.sort((a, b) => {
    if (col === 'total') return (a.total - b.total) * dir;
    return (a[col] > b[col] ? 1 : -1) * dir;
  });

  const countBadge = document.getElementById('invoicesCountBadge');
  if (countBadge) countBadge.innerText = `${list.length} records found`;

  container.innerHTML = `
    <table class="data-grid">
      <thead>
        <tr>
          <th width="30"><input type="checkbox"></th>
          <th class="sortable" onclick="toggleSort('invoices', 'id')">Invoice # ${getSortIndicator('invoices', 'id')}</th>
          <th class="sortable" onclick="toggleSort('invoices', 'date')">Invoice Date ${getSortIndicator('invoices', 'date')}</th>
          <th class="sortable" onclick="toggleSort('invoices', 'orderId')">Order # ${getSortIndicator('invoices', 'orderId')}</th>
          <th class="sortable" onclick="toggleSort('invoices', 'customer')">Bill-to Name ${getSortIndicator('invoices', 'customer')}</th>
          <th class="sortable" onclick="toggleSort('invoices', 'total')">Amount ${getSortIndicator('invoices', 'total')}</th>
          <th class="sortable" onclick="toggleSort('invoices', 'status')">Status ${getSortIndicator('invoices', 'status')}</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(i => `
          <tr>
            <td><input type="checkbox"></td>
            <td style="font-weight:700; color:var(--primary);">${i.id}</td>
            <td>${i.date}</td>
            <td><a href="#/sales/order-details/${i.orderId}" style="color:var(--text-main); font-weight:600;">${i.orderId}</a></td>
            <td style="font-weight:600;">${i.customer}</td>
            <td style="font-weight:700;">AED ${i.total.toFixed(2)}</td>
            <td><span class="badge badge-success">${i.status}</span></td>
            <td><button class="btn btn-secondary btn-sm" onclick="showToast('Viewing Invoice #${i.id}')">View</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  if (window.lucide) lucide.createIcons();
}

// SHIPMENTS VIEW
function renderShipmentsView() {
  return `
    <div class="page-header-actions">
      <div>
        <div class="breadcrumbs"><a href="#/dashboard">Dashboard</a> / <span>Sales</span> / <span>Shipments</span></div>
        <h2 style="font-size:18px; font-weight:700;">Shipments Management</h2>
      </div>
      <button class="btn btn-secondary" onclick="showToast('Printing Manifests...')"><i data-lucide="printer"></i> Print Manifests</button>
    </div>

    <div class="table-container">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <input type="text" class="table-search" placeholder="Search Shipment #, Order # or Tracking..." 
                 value="${State.shipments.search}" oninput="setFilter('shipments', 'search', this.value)">
          
          <select class="filter-select" onchange="setFilter('shipments', 'carrier', this.value)">
            <option value="">All Carriers</option>
            <option value="Aramex" ${State.shipments.carrier === 'Aramex' ? 'selected' : ''}>Aramex</option>
            <option value="DHL" ${State.shipments.carrier === 'DHL' ? 'selected' : ''}>DHL</option>
            <option value="FedEx" ${State.shipments.carrier === 'FedEx' ? 'selected' : ''}>FedEx</option>
          </select>
        </div>
        <div class="toolbar-right">
          <span id="shipmentsCountBadge" style="font-size:12px; color:var(--text-muted);"></span>
          <button class="btn btn-secondary btn-sm" onclick="resetFilters('shipments')"><i data-lucide="rotate-ccw"></i> Reset</button>
        </div>
      </div>
      <div id="shipmentsTableWrapper"></div>
    </div>
  `;
}

function renderShipmentsTableOnly() {
  const container = document.getElementById('shipmentsTableWrapper');
  if (!container) return;

  let list = [...DB.shipments];
  if (State.shipments.search) {
    const q = State.shipments.search.toLowerCase();
    list = list.filter(s => s.id.toLowerCase().includes(q) || s.orderId.toLowerCase().includes(q) || s.tracking.toLowerCase().includes(q) || s.customer.toLowerCase().includes(q));
  }
  if (State.shipments.carrier) {
    list = list.filter(s => s.carrier.toLowerCase().includes(State.shipments.carrier.toLowerCase()));
  }

  const col = State.shipments.sortCol;
  const dir = State.shipments.sortDir === 'asc' ? 1 : -1;
  list.sort((a, b) => (a[col] > b[col] ? 1 : -1) * dir);

  const countBadge = document.getElementById('shipmentsCountBadge');
  if (countBadge) countBadge.innerText = `${list.length} records found`;

  container.innerHTML = `
    <table class="data-grid">
      <thead>
        <tr>
          <th width="30"><input type="checkbox"></th>
          <th class="sortable" onclick="toggleSort('shipments', 'id')">Shipment # ${getSortIndicator('shipments', 'id')}</th>
          <th class="sortable" onclick="toggleSort('shipments', 'date')">Date Shipped ${getSortIndicator('shipments', 'date')}</th>
          <th class="sortable" onclick="toggleSort('shipments', 'orderId')">Order # ${getSortIndicator('shipments', 'orderId')}</th>
          <th class="sortable" onclick="toggleSort('shipments', 'customer')">Customer Name ${getSortIndicator('shipments', 'customer')}</th>
          <th class="sortable" onclick="toggleSort('shipments', 'carrier')">Carrier ${getSortIndicator('shipments', 'carrier')}</th>
          <th>Tracking Number</th>
          <th class="sortable" onclick="toggleSort('shipments', 'qty')">Total Qty ${getSortIndicator('shipments', 'qty')}</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(s => `
          <tr>
            <td><input type="checkbox"></td>
            <td style="font-weight:700; color:var(--primary);">${s.id}</td>
            <td>${s.date}</td>
            <td><a href="#/sales/order-details/${s.orderId}" style="color:var(--text-main); font-weight:600;">${s.orderId}</a></td>
            <td style="font-weight:600;">${s.customer}</td>
            <td><span class="badge badge-neutral">${s.carrier}</span></td>
            <td><code>${s.tracking}</code></td>
            <td style="font-weight:700;">${s.qty}</td>
            <td><button class="btn btn-secondary btn-sm" onclick="showToast('Tracking URL opened')">Track</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  if (window.lucide) lucide.createIcons();
}

/* ==========================================================
   6. CATALOG MODULES (PRODUCTS & CATEGORIES)
========================================================== */
function renderProductsView() {
  return `
    <div class="page-header-actions">
      <div>
        <div class="breadcrumbs"><a href="#/dashboard">Dashboard</a> / <span>Catalog</span> / <span>Products</span></div>
        <h2 style="font-size:18px; font-weight:700;">Product Catalog</h2>
      </div>
      <button class="btn btn-primary" onclick="navigateTo('#/catalog/product-new')"><i data-lucide="plus"></i> Add Product</button>
    </div>

    <div class="table-container">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <input type="text" class="table-search" placeholder="Search by SKU or Product Name..." 
                 value="${State.products.search}" oninput="setFilter('products', 'search', this.value)">
          
          <select class="filter-select" onchange="setFilter('products', 'category', this.value)">
            <option value="">All Categories</option>
            <option value="Audio" ${State.products.category === 'Audio' ? 'selected' : ''}>Audio</option>
            <option value="Smartphones" ${State.products.category === 'Smartphones' ? 'selected' : ''}>Smartphones</option>
            <option value="Laptops" ${State.products.category === 'Laptops' ? 'selected' : ''}>Laptops</option>
            <option value="Footwear" ${State.products.category === 'Footwear' ? 'selected' : ''}>Footwear</option>
            <option value="Appliances" ${State.products.category === 'Appliances' ? 'selected' : ''}>Appliances</option>
          </select>

          <select class="filter-select" onchange="setFilter('products', 'status', this.value)">
            <option value="">All Statuses</option>
            <option value="Enabled" ${State.products.status === 'Enabled' ? 'selected' : ''}>Enabled</option>
            <option value="Disabled" ${State.products.status === 'Disabled' ? 'selected' : ''}>Disabled</option>
          </select>
        </div>
        <div class="toolbar-right">
          <span id="productsCountBadge" style="font-size:12px; color:var(--text-muted);"></span>
          <button class="btn btn-secondary btn-sm" onclick="resetFilters('products')"><i data-lucide="rotate-ccw"></i> Reset</button>
        </div>
      </div>
      <div id="productsTableWrapper"></div>
    </div>
  `;
}

function renderProductsTableOnly() {
  const container = document.getElementById('productsTableWrapper');
  if (!container) return;

  let list = [...DB.products];

  if (State.products.search) {
    const q = State.products.search.toLowerCase();
    list = list.filter(p => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q));
  }
  if (State.products.category) {
    list = list.filter(p => p.category === State.products.category);
  }
  if (State.products.status) {
    list = list.filter(p => p.status === State.products.status);
  }

  const col = State.products.sortCol;
  const dir = State.products.sortDir === 'asc' ? 1 : -1;
  list.sort((a, b) => {
    if (col === 'price') return (a.price - b.price) * dir;
    if (col === 'qty') return (a.qty - b.qty) * dir;
    if (col === 'id') return (a.id - b.id) * dir;
    return (a[col] > b[col] ? 1 : -1) * dir;
  });

  const countBadge = document.getElementById('productsCountBadge');
  if (countBadge) countBadge.innerText = `${list.length} records found`;

  if (list.length === 0) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #64748b;">
        <i data-lucide="package-x" style="width: 32px; height: 32px; margin-bottom: 8px;"></i>
        <p><strong>No products found matching the criteria</strong></p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <table class="data-grid">
      <thead>
        <tr>
          <th width="30"><input type="checkbox"></th>
          <th class="sortable" onclick="toggleSort('products', 'id')">ID ${getSortIndicator('products', 'id')}</th>
          <th>Thumbnail</th>
          <th class="sortable" onclick="toggleSort('products', 'name')">Name ${getSortIndicator('products', 'name')}</th>
          <th class="sortable" onclick="toggleSort('products', 'category')">Category ${getSortIndicator('products', 'category')}</th>
          <th class="sortable" onclick="toggleSort('products', 'sku')">SKU ${getSortIndicator('products', 'sku')}</th>
          <th class="sortable" onclick="toggleSort('products', 'price')">Price ${getSortIndicator('products', 'price')}</th>
          <th class="sortable" onclick="toggleSort('products', 'qty')">Quantity ${getSortIndicator('products', 'qty')}</th>
          <th class="sortable" onclick="toggleSort('products', 'status')">Status ${getSortIndicator('products', 'status')}</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(p => `
          <tr>
            <td><input type="checkbox"></td>
            <td>${p.id}</td>
            <td><div style="width:36px; height:36px; background:#e2e8f0; border-radius:4px; display:flex; align-items:center; justify-content:center;"><i data-lucide="image" style="width:16px; color:#94a3b8;"></i></div></td>
            <td style="font-weight:600;">${p.name}</td>
            <td><span class="badge badge-neutral">${p.category}</span></td>
            <td><code>${p.sku}</code></td>
            <td style="font-weight:700;">AED ${p.price.toFixed(2)}</td>
            <td style="color:${p.qty < 10 ? 'var(--danger)' : '#10b981'}; font-weight:700;">${p.qty}</td>
            <td><span class="badge badge-success">${p.status}</span></td>
            <td><button class="btn btn-secondary btn-sm" onclick="showToast('Editing ${p.sku}')">Edit</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="pagination">
      <div>Showing 1 to ${list.length} of ${list.length} items</div>
      <div class="pagination-pages">
        <div class="page-num active">1</div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}

function renderProductFormView() {
  return `
    <div class="page-header-actions">
      <div>
        <div class="breadcrumbs"><a href="#/dashboard">Dashboard</a> / <a href="#/catalog/products">Products</a> / <span>New</span></div>
        <h2 style="font-size:18px; font-weight:700;">New Product</h2>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="navigateTo('#/catalog/products')">Back</button>
        <button class="btn btn-primary" onclick="saveNewProduct()"><i data-lucide="check"></i> Save Product</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Product Details</div></div>
      <div class="form-grid">
        <div class="form-group full-width">
          <label class="form-label">Product Name <span class="required">*</span></label>
          <input type="text" id="prodName" class="form-control" placeholder="e.g. Sony WH-1000XM6 Wireless">
        </div>
        <div class="form-group">
          <label class="form-label">SKU <span class="required">*</span></label>
          <input type="text" id="prodSku" class="form-control" placeholder="e.g. SNY-WH-100">
        </div>
        <div class="form-group">
          <label class="form-label">Price (AED) <span class="required">*</span></label>
          <input type="number" id="prodPrice" class="form-control" placeholder="0.00">
        </div>
        <div class="form-group">
          <label class="form-label">Stock Quantity <span class="required">*</span></label>
          <input type="number" id="prodQty" class="form-control" placeholder="100">
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-control" id="prodCategory">
            <option value="Audio">Audio</option>
            <option value="Smartphones">Smartphones</option>
            <option value="Laptops">Laptops</option>
            <option value="Footwear">Footwear</option>
            <option value="Appliances">Appliances</option>
          </select>
        </div>
      </div>
    </div>
  `;
}

// CATEGORIES VIEW
function renderCategoriesView() {
  return `
    <div class="page-header-actions">
      <div>
        <div class="breadcrumbs"><a href="#/dashboard">Dashboard</a> / <span>Catalog</span> / <span>Categories</span></div>
        <h2 style="font-size:18px; font-weight:700;">Category Tree & Management</h2>
      </div>
      <button class="btn btn-primary" onclick="showToast('Add Subcategory Modal')"><i data-lucide="plus"></i> Add Subcategory</button>
    </div>

    <div class="table-container">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <input type="text" class="table-search" placeholder="Search category name..." 
                 value="${State.categories.search}" oninput="setFilter('categories', 'search', this.value)">
          
          <select class="filter-select" onchange="setFilter('categories', 'status', this.value)">
            <option value="">All Statuses</option>
            <option value="Active" ${State.categories.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${State.categories.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
        <div class="toolbar-right">
          <span id="categoriesCountBadge" style="font-size:12px; color:var(--text-muted);"></span>
          <button class="btn btn-secondary btn-sm" onclick="resetFilters('categories')"><i data-lucide="rotate-ccw"></i> Reset</button>
        </div>
      </div>
      <div id="categoriesTableWrapper"></div>
    </div>
  `;
}

function renderCategoriesTableOnly() {
  const container = document.getElementById('categoriesTableWrapper');
  if (!container) return;

  let list = [...DB.categories];
  if (State.categories.search) {
    const q = State.categories.search.toLowerCase();
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.parent.toLowerCase().includes(q));
  }
  if (State.categories.status) {
    list = list.filter(c => c.status === State.categories.status);
  }

  const col = State.categories.sortCol;
  const dir = State.categories.sortDir === 'asc' ? 1 : -1;
  list.sort((a, b) => {
    if (col === 'count') return (a.count - b.count) * dir;
    return (a[col] > b[col] ? 1 : -1) * dir;
  });

  const countBadge = document.getElementById('categoriesCountBadge');
  if (countBadge) countBadge.innerText = `${list.length} categories found`;

  container.innerHTML = `
    <table class="data-grid">
      <thead>
        <tr>
          <th width="30"><input type="checkbox"></th>
          <th class="sortable" onclick="toggleSort('categories', 'id')">ID ${getSortIndicator('categories', 'id')}</th>
          <th class="sortable" onclick="toggleSort('categories', 'name')">Category Name ${getSortIndicator('categories', 'name')}</th>
          <th class="sortable" onclick="toggleSort('categories', 'parent')">Parent Category ${getSortIndicator('categories', 'parent')}</th>
          <th class="sortable" onclick="toggleSort('categories', 'count')">Products Count ${getSortIndicator('categories', 'count')}</th>
          <th class="sortable" onclick="toggleSort('categories', 'status')">Status ${getSortIndicator('categories', 'status')}</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(c => `
          <tr>
            <td><input type="checkbox"></td>
            <td>${c.id}</td>
            <td style="font-weight:600;"><i data-lucide="folder" style="width:14px; vertical-align:middle; margin-right:4px;"></i> ${c.name}</td>
            <td>${c.parent}</td>
            <td style="font-weight:700;">${c.count} items</td>
            <td><span class="badge badge-success">${c.status}</span></td>
            <td><button class="btn btn-secondary btn-sm" onclick="showToast('Editing ${c.name}')">Edit</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  if (window.lucide) lucide.createIcons();
}

/* ==========================================================
   7. CUSTOMERS, MARKETING, CMS & USERS (FILTER & SORT)
========================================================== */
function renderCustomersView() {
  return `
    <div class="page-header-actions">
      <div>
        <div class="breadcrumbs"><a href="#/dashboard">Dashboard</a> / <span>Customers</span> / <span>All Customers</span></div>
        <h2 style="font-size:18px; font-weight:700;">Customers Listing</h2>
      </div>
      <button class="btn btn-primary" onclick="showToast('Customer Onboarding Modal Triggered')"><i data-lucide="user-plus"></i> Add New Customer</button>
    </div>

    <div class="table-container">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <input type="text" class="table-search" placeholder="Search by Name or Email..." 
                 value="${State.customers.search}" oninput="setFilter('customers', 'search', this.value)">
          
          <select class="filter-select" onchange="setFilter('customers', 'group', this.value)">
            <option value="">All Groups</option>
            <option value="General" ${State.customers.group === 'General' ? 'selected' : ''}>General</option>
            <option value="VIP Customer" ${State.customers.group === 'VIP Customer' ? 'selected' : ''}>VIP Customer</option>
            <option value="Wholesale B2B" ${State.customers.group === 'Wholesale B2B' ? 'selected' : ''}>Wholesale B2B</option>
          </select>

          <select class="filter-select" onchange="setFilter('customers', 'status', this.value)">
            <option value="">All Statuses</option>
            <option value="Active" ${State.customers.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${State.customers.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
        <div class="toolbar-right">
          <span id="customersCountBadge" style="font-size:12px; color:var(--text-muted);"></span>
          <button class="btn btn-secondary btn-sm" onclick="resetFilters('customers')"><i data-lucide="rotate-ccw"></i> Reset</button>
        </div>
      </div>
      <div id="customersTableWrapper"></div>
    </div>
  `;
}

function renderCustomersTableOnly() {
  const container = document.getElementById('customersTableWrapper');
  if (!container) return;

  let list = [...DB.customers];

  if (State.customers.search) {
    const q = State.customers.search.toLowerCase();
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }
  if (State.customers.group) {
    list = list.filter(c => c.group === State.customers.group);
  }
  if (State.customers.status) {
    list = list.filter(c => c.status === State.customers.status);
  }

  const col = State.customers.sortCol;
  const dir = State.customers.sortDir === 'asc' ? 1 : -1;
  list.sort((a, b) => {
    if (col === 'sales') return (a.sales - b.sales) * dir;
    if (col === 'orders') return (a.orders - b.orders) * dir;
    if (col === 'id') return (a.id - b.id) * dir;
    return (a[col] > b[col] ? 1 : -1) * dir;
  });

  const countBadge = document.getElementById('customersCountBadge');
  if (countBadge) countBadge.innerText = `${list.length} records found`;

  if (list.length === 0) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #64748b;">
        <i data-lucide="user-x" style="width: 32px; height: 32px; margin-bottom: 8px;"></i>
        <p><strong>No customers found matching the criteria</strong></p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <table class="data-grid">
      <thead>
        <tr>
          <th width="30"><input type="checkbox"></th>
          <th class="sortable" onclick="toggleSort('customers', 'id')">ID ${getSortIndicator('customers', 'id')}</th>
          <th class="sortable" onclick="toggleSort('customers', 'name')">Name ${getSortIndicator('customers', 'name')}</th>
          <th class="sortable" onclick="toggleSort('customers', 'email')">Email ${getSortIndicator('customers', 'email')}</th>
          <th class="sortable" onclick="toggleSort('customers', 'group')">Group ${getSortIndicator('customers', 'group')}</th>
          <th>Phone</th>
          <th class="sortable" onclick="toggleSort('customers', 'orders')">Orders ${getSortIndicator('customers', 'orders')}</th>
          <th class="sortable" onclick="toggleSort('customers', 'sales')">Lifetime Sales ${getSortIndicator('customers', 'sales')}</th>
          <th class="sortable" onclick="toggleSort('customers', 'status')">Status ${getSortIndicator('customers', 'status')}</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(c => `
          <tr>
            <td><input type="checkbox"></td>
            <td>${c.id}</td>
            <td style="font-weight:600;">${c.name}</td>
            <td><a href="mailto:${c.email}" style="color:var(--primary); text-decoration:none;">${c.email}</a></td>
            <td><span class="badge badge-info">${c.group}</span></td>
            <td>${c.phone}</td>
            <td style="font-weight:700;">${c.orders}</td>
            <td style="font-weight:700;">AED ${c.sales.toFixed(2)}</td>
            <td><span class="badge badge-${c.status === 'Active' ? 'success' : 'neutral'}">${c.status}</span></td>
            <td><button class="btn btn-secondary btn-sm" onclick="showToast('Viewing profile of ${c.name}')">Edit</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="pagination">
      <div>Showing 1 to ${list.length} of ${list.length} items</div>
      <div class="pagination-pages"><div class="page-num active">1</div></div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}

function renderPromotionsView() {
  return `
    <div class="page-header-actions">
      <div>
        <div class="breadcrumbs"><a href="#/dashboard">Dashboard</a> / <span>Marketing</span> / <span>Cart Price Rules</span></div>
        <h2 style="font-size:18px; font-weight:700;">Promotions & Cart Price Rules</h2>
      </div>
      <button class="btn btn-primary" onclick="showToast('Promotion Builder Opened')"><i data-lucide="plus"></i> Add New Rule</button>
    </div>

    <div class="table-container">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <input type="text" class="table-search" placeholder="Search Rule Name or Coupon..." 
                 value="${State.promotions.search}" oninput="setFilter('promotions', 'search', this.value)">
          
          <select class="filter-select" onchange="setFilter('promotions', 'status', this.value)">
            <option value="">All Statuses</option>
            <option value="Active" ${State.promotions.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${State.promotions.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
        <div class="toolbar-right">
          <span id="promotionsCountBadge" style="font-size:12px; color:var(--text-muted);"></span>
          <button class="btn btn-secondary btn-sm" onclick="resetFilters('promotions')"><i data-lucide="rotate-ccw"></i> Reset</button>
        </div>
      </div>
      <div id="promotionsTableWrapper"></div>
    </div>
  `;
}

function renderPromotionsTableOnly() {
  const container = document.getElementById('promotionsTableWrapper');
  if (!container) return;

  let list = [...DB.promotions];
  if (State.promotions.search) {
    const q = State.promotions.search.toLowerCase();
    list = list.filter(r => r.name.toLowerCase().includes(q) || r.coupon.toLowerCase().includes(q));
  }
  if (State.promotions.status) {
    list = list.filter(r => r.status === State.promotions.status);
  }

  const col = State.promotions.sortCol;
  const dir = State.promotions.sortDir === 'asc' ? 1 : -1;
  list.sort((a, b) => {
    if (col === 'uses') return (a.uses - b.uses) * dir;
    if (col === 'id') return (a.id - b.id) * dir;
    return (a[col] > b[col] ? 1 : -1) * dir;
  });

  const countBadge = document.getElementById('promotionsCountBadge');
  if (countBadge) countBadge.innerText = `${list.length} records found`;

  container.innerHTML = `
    <table class="data-grid">
      <thead>
        <tr>
          <th width="30"><input type="checkbox"></th>
          <th class="sortable" onclick="toggleSort('promotions', 'id')">Rule ID ${getSortIndicator('promotions', 'id')}</th>
          <th class="sortable" onclick="toggleSort('promotions', 'name')">Rule Name ${getSortIndicator('promotions', 'name')}</th>
          <th class="sortable" onclick="toggleSort('promotions', 'coupon')">Coupon Code ${getSortIndicator('promotions', 'coupon')}</th>
          <th>Discount</th>
          <th class="sortable" onclick="toggleSort('promotions', 'uses')">Total Uses ${getSortIndicator('promotions', 'uses')}</th>
          <th class="sortable" onclick="toggleSort('promotions', 'status')">Status ${getSortIndicator('promotions', 'status')}</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(r => `
          <tr>
            <td><input type="checkbox"></td>
            <td>#${r.id}</td>
            <td style="font-weight:600;">${r.name}</td>
            <td><code>${r.coupon}</code></td>
            <td><strong>${r.discount}</strong></td>
            <td style="font-weight:700;">${r.uses}</td>
            <td><span class="badge badge-${r.status === 'Active' ? 'success' : 'neutral'}">${r.status}</span></td>
            <td><button class="btn btn-secondary btn-sm" onclick="showToast('Rule ${r.coupon} selected')">Edit</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  if (window.lucide) lucide.createIcons();
}

// CMS PAGES VIEW
function renderPagesView() {
  return `
    <div class="page-header-actions">
      <div>
        <div class="breadcrumbs"><a href="#/dashboard">Dashboard</a> / <span>Content</span> / <span>Pages</span></div>
        <h2 style="font-size:18px; font-weight:700;">CMS Pages</h2>
      </div>
      <button class="btn btn-primary" onclick="showToast('Page Builder Opened')"><i data-lucide="plus"></i> Add New Page</button>
    </div>

    <div class="table-container">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <input type="text" class="table-search" placeholder="Search page title or URL..." 
                 value="${State.pages.search}" oninput="setFilter('pages', 'search', this.value)">
          
          <select class="filter-select" onchange="setFilter('pages', 'status', this.value)">
            <option value="">All Statuses</option>
            <option value="Enabled" ${State.pages.status === 'Enabled' ? 'selected' : ''}>Enabled</option>
            <option value="Disabled" ${State.pages.status === 'Disabled' ? 'selected' : ''}>Disabled</option>
          </select>
        </div>
        <div class="toolbar-right">
          <span id="pagesCountBadge" style="font-size:12px; color:var(--text-muted);"></span>
          <button class="btn btn-secondary btn-sm" onclick="resetFilters('pages')"><i data-lucide="rotate-ccw"></i> Reset</button>
        </div>
      </div>
      <div id="pagesTableWrapper"></div>
    </div>
  `;
}

function renderPagesTableOnly() {
  const container = document.getElementById('pagesTableWrapper');
  if (!container) return;

  let list = [...DB.cmsPages];
  if (State.pages.search) {
    const q = State.pages.search.toLowerCase();
    list = list.filter(p => p.title.toLowerCase().includes(q) || p.urlKey.toLowerCase().includes(q));
  }
  if (State.pages.status) {
    list = list.filter(p => p.status === State.pages.status);
  }

  const col = State.pages.sortCol;
  const dir = State.pages.sortDir === 'asc' ? 1 : -1;
  list.sort((a, b) => (a[col] > b[col] ? 1 : -1) * dir);

  const countBadge = document.getElementById('pagesCountBadge');
  if (countBadge) countBadge.innerText = `${list.length} pages found`;

  container.innerHTML = `
    <table class="data-grid">
      <thead>
        <tr>
          <th width="30"><input type="checkbox"></th>
          <th class="sortable" onclick="toggleSort('pages', 'id')">ID ${getSortIndicator('pages', 'id')}</th>
          <th class="sortable" onclick="toggleSort('pages', 'title')">Title ${getSortIndicator('pages', 'title')}</th>
          <th class="sortable" onclick="toggleSort('pages', 'urlKey')">URL Key ${getSortIndicator('pages', 'urlKey')}</th>
          <th class="sortable" onclick="toggleSort('pages', 'layout')">Layout ${getSortIndicator('pages', 'layout')}</th>
          <th class="sortable" onclick="toggleSort('pages', 'status')">Status ${getSortIndicator('pages', 'status')}</th>
          <th class="sortable" onclick="toggleSort('pages', 'updated')">Last Modified ${getSortIndicator('pages', 'updated')}</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(p => `
          <tr>
            <td><input type="checkbox"></td>
            <td>${p.id}</td>
            <td style="font-weight:600;">${p.title}</td>
            <td><code>/${p.urlKey}</code></td>
            <td>${p.layout}</td>
            <td><span class="badge badge-success">${p.status}</span></td>
            <td>${p.updated}</td>
            <td><button class="btn btn-secondary btn-sm" onclick="showToast('Editing ${p.title}')">Edit</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  if (window.lucide) lucide.createIcons();
}

// ADMIN USERS VIEW
function renderUsersView() {
  return `
    <div class="page-header-actions">
      <div>
        <div class="breadcrumbs"><a href="#/dashboard">Dashboard</a> / <span>System</span> / <span>Admin Users</span></div>
        <h2 style="font-size:18px; font-weight:700;">Admin Users & Security</h2>
      </div>
      <button class="btn btn-primary" onclick="showToast('Create User Drawer Opened')"><i data-lucide="user-plus"></i> Add New User</button>
    </div>

    <div class="table-container">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <input type="text" class="table-search" placeholder="Search user, name, or email..." 
                 value="${State.users.search}" oninput="setFilter('users', 'search', this.value)">
          
          <select class="filter-select" onchange="setFilter('users', 'role', this.value)">
            <option value="">All Roles</option>
            <option value="Super Administrators" ${State.users.role === 'Super Administrators' ? 'selected' : ''}>Super Administrators</option>
            <option value="Catalog Editors" ${State.users.role === 'Catalog Editors' ? 'selected' : ''}>Catalog Editors</option>
            <option value="Order Processors" ${State.users.role === 'Order Processors' ? 'selected' : ''}>Order Processors</option>
          </select>

          <select class="filter-select" onchange="setFilter('users', 'status', this.value)">
            <option value="">All Statuses</option>
            <option value="Active" ${State.users.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${State.users.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
        <div class="toolbar-right">
          <span id="usersCountBadge" style="font-size:12px; color:var(--text-muted);"></span>
          <button class="btn btn-secondary btn-sm" onclick="resetFilters('users')"><i data-lucide="rotate-ccw"></i> Reset</button>
        </div>
      </div>
      <div id="usersTableWrapper"></div>
    </div>
  `;
}

function renderUsersTableOnly() {
  const container = document.getElementById('usersTableWrapper');
  if (!container) return;

  let list = [...DB.adminUsers];
  if (State.users.search) {
    const q = State.users.search.toLowerCase();
    list = list.filter(u => u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  if (State.users.role) {
    list = list.filter(u => u.role === State.users.role);
  }
  if (State.users.status) {
    list = list.filter(u => u.status === State.users.status);
  }

  const col = State.users.sortCol;
  const dir = State.users.sortDir === 'asc' ? 1 : -1;
  list.sort((a, b) => (a[col] > b[col] ? 1 : -1) * dir);

  const countBadge = document.getElementById('usersCountBadge');
  if (countBadge) countBadge.innerText = `${list.length} accounts found`;

  container.innerHTML = `
    <table class="data-grid">
      <thead>
        <tr>
          <th width="30"><input type="checkbox"></th>
          <th class="sortable" onclick="toggleSort('users', 'id')">ID ${getSortIndicator('users', 'id')}</th>
          <th class="sortable" onclick="toggleSort('users', 'username')">User Name ${getSortIndicator('users', 'username')}</th>
          <th class="sortable" onclick="toggleSort('users', 'name')">Full Name ${getSortIndicator('users', 'name')}</th>
          <th class="sortable" onclick="toggleSort('users', 'email')">Email ${getSortIndicator('users', 'email')}</th>
          <th class="sortable" onclick="toggleSort('users', 'role')">Role ${getSortIndicator('users', 'role')}</th>
          <th class="sortable" onclick="toggleSort('users', 'status')">Status ${getSortIndicator('users', 'status')}</th>
          <th class="sortable" onclick="toggleSort('users', 'lastLogin')">Last Login ${getSortIndicator('users', 'lastLogin')}</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(u => `
          <tr>
            <td><input type="checkbox"></td>
            <td>${u.id}</td>
            <td><code>${u.username}</code></td>
            <td style="font-weight:600;">${u.name}</td>
            <td><a href="mailto:${u.email}" style="color:var(--text-main); text-decoration:none;">${u.email}</a></td>
            <td><span class="badge badge-neutral">${u.role}</span></td>
            <td><span class="badge badge-${u.status === 'Active' ? 'success' : 'neutral'}">${u.status}</span></td>
            <td>${u.lastLogin}</td>
            <td><button class="btn btn-secondary btn-sm" onclick="showToast('Editing ${u.username}')">Edit</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  if (window.lucide) lucide.createIcons();
}

/* ==========================================================
   8. STORES CONFIGURATION & SYSTEM CACHE MODULES
========================================================== */
function renderConfigurationView() {
  return `
    <div class="page-header-actions">
      <div>
        <div class="breadcrumbs"><a href="#/dashboard">Dashboard</a> / <span>Stores</span> / <span>Configuration</span></div>
        <h2 style="font-size:18px; font-weight:700;">Configuration Settings</h2>
      </div>
      <button class="btn btn-primary" onclick="showToast('System Configuration Saved')"><i data-lucide="check"></i> Save Config</button>
    </div>

    <div style="display:grid; grid-template-columns: 260px 1fr; gap:20px;">
      <div class="card" style="padding:10px;">
        <div style="font-weight:700; font-size:12px; padding:10px; color:#64748b; text-transform:uppercase;">Configuration Scope</div>
        <div style="padding:10px; background:#f1f5f9; border-radius:6px; font-weight:600; color:var(--primary); margin-bottom:4px; cursor:pointer;">General > Store Information</div>
        <div style="padding:10px; border-radius:6px; color:#475569; margin-bottom:4px; cursor:pointer;" onclick="showToast('Switched to Web URL configuration')">General > Web URLs</div>
        <div style="padding:10px; border-radius:6px; color:#475569; margin-bottom:4px; cursor:pointer;" onclick="showToast('Switched to Currency configuration')">General > Currency Setup</div>
        <div style="padding:10px; border-radius:6px; color:#475569; margin-bottom:4px; cursor:pointer;" onclick="showToast('Switched to Sales Tax configuration')">Sales > Tax & VAT 5%</div>
        <div style="padding:10px; border-radius:6px; color:#475569; margin-bottom:4px; cursor:pointer;" onclick="showToast('Switched to Payment Methods')">Sales > Payment Methods</div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Store Information (UAE Store View)</div></div>
        <div class="form-grid">
          <div class="form-group full-width">
            <label class="form-label">Store Name <span class="required">*</span></label>
            <input type="text" class="form-control" value="OrlaTrends UAE Flagship Store">
          </div>
          <div class="form-group">
            <label class="form-label">Store Contact Telephone</label>
            <input type="text" class="form-control" value="+971 4 399 0000">
          </div>
          <div class="form-group">
            <label class="form-label">Base Currency</label>
            <select class="form-control">
              <option selected>AED - United Arab Emirates Dirham</option>
              <option>SAR - Saudi Riyal</option>
              <option>USD - US Dollar</option>
            </select>
          </div>
          <div class="form-group full-width">
            <label class="form-label">Store Official Address</label>
            <input type="text" class="form-control" value="Downtown Dubai, Sheikh Mohammed Bin Rashid Blvd, UAE">
          </div>
          <div class="form-group">
            <label class="form-label">VAT / TRN Registration #</label>
            <input type="text" class="form-control" value="100294819000003">
          </div>
          <div class="form-group">
            <label class="form-label">Timezone</label>
            <select class="form-control">
              <option selected>Asia/Dubai (GMT+4)</option>
              <option>Asia/Riyadh (GMT+3)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCacheView() {
  return `
    <div class="page-header-actions">
      <div>
        <div class="breadcrumbs"><a href="#/dashboard">Dashboard</a> / <span>System</span> / <span>Cache</span></div>
        <h2 style="font-size:18px; font-weight:700;">Cache Management</h2>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-danger" onclick="flushCacheFast()"><i data-lucide="trash-2"></i> Flush Orla Cache</button>
        <button class="btn btn-primary" onclick="showToast('All Cache Storage Refreshed')"><i data-lucide="refresh-cw"></i> Refresh All</button>
      </div>
    </div>

    <div class="table-container">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <input type="text" class="table-search" placeholder="Search cache types..." 
                 value="${State.cache.search}" oninput="setFilter('cache', 'search', this.value)">
          
          <select class="filter-select" onchange="setFilter('cache', 'status', this.value)">
            <option value="">All Statuses</option>
            <option value="Enabled" ${State.cache.status === 'Enabled' ? 'selected' : ''}>Enabled</option>
            <option value="Disabled" ${State.cache.status === 'Disabled' ? 'selected' : ''}>Disabled</option>
          </select>
        </div>
        <div class="toolbar-right">
          <span id="cacheCountBadge" style="font-size:12px; color:var(--text-muted);"></span>
          <button class="btn btn-secondary btn-sm" onclick="resetFilters('cache')"><i data-lucide="rotate-ccw"></i> Reset</button>
        </div>
      </div>
      <div id="cacheTableWrapper"></div>
    </div>
  `;
}

function renderCacheTableOnly() {
  const container = document.getElementById('cacheTableWrapper');
  if (!container) return;

  let list = [...DB.cacheItems];

  if (State.cache.search) {
    const q = State.cache.search.toLowerCase();
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
  }
  if (State.cache.status) {
    list = list.filter(c => c.status === State.cache.status);
  }

  const col = State.cache.sortCol;
  const dir = State.cache.sortDir === 'asc' ? 1 : -1;
  list.sort((a, b) => (a[col] > b[col] ? 1 : -1) * dir);

  const countBadge = document.getElementById('cacheCountBadge');
  if (countBadge) countBadge.innerText = `${list.length} cache pools`;

  container.innerHTML = `
    <table class="data-grid">
      <thead>
        <tr>
          <th width="30"><input type="checkbox"></th>
          <th class="sortable" onclick="toggleSort('cache', 'name')">Cache Type ${getSortIndicator('cache', 'name')}</th>
          <th class="sortable" onclick="toggleSort('cache', 'desc')">Description ${getSortIndicator('cache', 'desc')}</th>
          <th class="sortable" onclick="toggleSort('cache', 'tags')">Associated Tags ${getSortIndicator('cache', 'tags')}</th>
          <th class="sortable" onclick="toggleSort('cache', 'status')">Status ${getSortIndicator('cache', 'status')}</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(c => `
          <tr>
            <td><input type="checkbox"></td>
            <td><strong>${c.name}</strong></td>
            <td style="color:#64748b;">${c.desc}</td>
            <td><code>${c.tags}</code></td>
            <td><span class="badge badge-${c.status === 'Enabled' ? 'success' : 'danger'}">${c.status}</span></td>
            <td><button class="btn btn-secondary btn-sm" onclick="showToast('Refreshed ${c.name}')">Refresh</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  if (window.lucide) lucide.createIcons();
}

/* ==========================================================
   9. EXTENSIONS & GENERIC ENTERPRISE WORKSPACE
========================================================== */
function renderExtensionsView() {
  return `
    <div class="page-header-actions">
      <div>
        <div class="breadcrumbs"><a href="#/dashboard">Dashboard</a> / <span>Extensions</span></div>
        <h2 style="font-size:18px; font-weight:700;">Installed Extensions & Integrations</h2>
      </div>
      <button class="btn btn-primary" onclick="showToast('Checking Marketplace Updates...')"><i data-lucide="download-cloud"></i> Check for Updates</button>
    </div>

    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
      <div class="card">
        <div class="card-header"><span class="badge badge-success">INSTALLED</span><span style="font-size:11px; color:#64748b;">v3.4.1</span></div>
        <h3 style="font-size:15px; font-weight:700; margin-bottom:6px;">Telr UAE Payment Gateway</h3>
        <p style="color:#64748b; font-size:12px; margin-bottom:14px;">Direct payment orchestration for GCC credit cards, Apple Pay & Mada.</p>
        <button class="btn btn-secondary btn-sm" style="width:100%;" onclick="showToast('Configuring Telr...')">Configure Gateway</button>
      </div>
      <div class="card">
        <div class="card-header"><span class="badge badge-success">INSTALLED</span><span style="font-size:11px; color:#64748b;">v2.1.0</span></div>
        <h3 style="font-size:15px; font-weight:700; margin-bottom:6px;">Tabby & Tamara BNPL Suite</h3>
        <p style="color:#64748b; font-size:12px; margin-bottom:14px;">Split in 4 installments checkout widget and live risk scoring.</p>
        <button class="btn btn-secondary btn-sm" style="width:100%;" onclick="showToast('Configuring BNPL...')">Configure BNPL</button>
      </div>
      <div class="card">
        <div class="card-header"><span class="badge badge-warning">UPDATE AVAILABLE</span><span style="font-size:11px; color:#64748b;">v1.8.4</span></div>
        <h3 style="font-size:15px; font-weight:700; margin-bottom:6px;">Aramex Logistics Express</h3>
        <p style="color:#64748b; font-size:12px; margin-bottom:14px;">Automated airway bill generation and pickup manifest scheduling.</p>
        <button class="btn btn-primary btn-sm" style="width:100%;" onclick="showToast('Updating to v1.9.0...')">Update Extension</button>
      </div>
    </div>
  `;
}

function renderGenericModuleView(moduleTitle) {
  return `
    <div class="page-header-actions">
      <div>
        <div class="breadcrumbs"><a href="#/dashboard">Dashboard</a> / <span>${moduleTitle}</span></div>
        <h2 style="font-size:18px; font-weight:700;">${moduleTitle}</h2>
      </div>
      <button class="btn btn-primary" onclick="showToast('State synchronized')"><i data-lucide="refresh-cw"></i> Synchronize</button>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title-group">
          <div class="card-subtitle">ENTERPRISE CONFIGURATION</div>
          <div class="card-title">${moduleTitle} Workspace</div>
        </div>
        <span class="badge badge-success">ACTIVE SCOPE</span>
      </div>
      <p style="color:#64748b; margin-bottom:16px;">
        This module is operational under UAE/GCC store view parameters with automated asynchronous workers.
      </p>
      <table class="data-grid">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Scope</th>
            <th>System Value</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Async Indexing Queue</td><td>Global</td><td>RabbitMQ / Redis</td><td><span class="badge badge-success">RUNNING</span></td></tr>
          <tr><td>Varnish Full Page Cache</td><td>Store Front</td><td>Active (TTL 86400)</td><td><span class="badge badge-success">HIT RATIO 94%</span></td></tr>
          <tr><td>Elasticsearch Catalog Grid</td><td>Catalog</td><td>Port 9200 (Active)</td><td><span class="badge badge-info">OPTIMAL</span></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

/* ==========================================================
   10. UI CONTROLLERS, TOASTS & ACTIONS
========================================================== */
function resetFilters(module) {
  if (module === 'orders') State.orders = { search: '', status: '', payment: '', sortCol: 'date', sortDir: 'desc' };
  if (module === 'invoices') State.invoices = { search: '', status: '', sortCol: 'date', sortDir: 'desc' };
  if (module === 'shipments') State.shipments = { search: '', carrier: '', sortCol: 'date', sortDir: 'desc' };
  if (module === 'products') State.products = { search: '', category: '', status: '', sortCol: 'id', sortDir: 'asc' };
  if (module === 'categories') State.categories = { search: '', status: '', sortCol: 'count', sortDir: 'desc' };
  if (module === 'customers') State.customers = { search: '', group: '', status: '', sortCol: 'sales', sortDir: 'desc' };
  if (module === 'promotions') State.promotions = { search: '', status: '', sortCol: 'uses', sortDir: 'desc' };
  if (module === 'pages') State.pages = { search: '', status: '', sortCol: 'id', sortDir: 'asc' };
  if (module === 'users') State.users = { search: '', role: '', status: '', sortCol: 'id', sortDir: 'asc' };
  if (module === 'cache') State.cache = { search: '', status: '', sortCol: 'name', sortDir: 'asc' };

  if (module === 'orders') { document.getElementById('mainContent').innerHTML = renderOrdersView(); renderOrdersTableOnly(); }
  if (module === 'invoices') { document.getElementById('mainContent').innerHTML = renderInvoicesView(); renderInvoicesTableOnly(); }
  if (module === 'shipments') { document.getElementById('mainContent').innerHTML = renderShipmentsView(); renderShipmentsTableOnly(); }
  if (module === 'products') { document.getElementById('mainContent').innerHTML = renderProductsView(); renderProductsTableOnly(); }
  if (module === 'categories') { document.getElementById('mainContent').innerHTML = renderCategoriesView(); renderCategoriesTableOnly(); }
  if (module === 'customers') { document.getElementById('mainContent').innerHTML = renderCustomersView(); renderCustomersTableOnly(); }
  if (module === 'promotions') { document.getElementById('mainContent').innerHTML = renderPromotionsView(); renderPromotionsTableOnly(); }
  if (module === 'pages') { document.getElementById('mainContent').innerHTML = renderPagesView(); renderPagesTableOnly(); }
  if (module === 'users') { document.getElementById('mainContent').innerHTML = renderUsersView(); renderUsersTableOnly(); }
  if (module === 'cache') { document.getElementById('mainContent').innerHTML = renderCacheView(); renderCacheTableOnly(); }

  showToast(`Filters for ${module} reset`);
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i data-lucide="check-circle" style="color:var(--primary); width:18px;"></i> <span>${message}</span>`;
  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();
  setTimeout(() => { toast.remove(); }, 3500);
}

function flushCacheFast() {
  showToast('Flushed Orla Cache Storage Successfully.');
}

function handleLogout() {
  showToast('Admin session closed safely.');
}

function saveNewProduct() {
  const nameInput = document.getElementById('prodName');
  const skuInput = document.getElementById('prodSku');
  if (!nameInput || !skuInput) return;
  
  const name = nameInput.value;
  const sku = skuInput.value;
  const price = parseFloat(document.getElementById('prodPrice').value) || 0;
  const qty = parseInt(document.getElementById('prodQty').value) || 0;
  const category = document.getElementById('prodCategory').value;

  if (!name || !sku) {
    alert('Please fill in required fields: Name and SKU');
    return;
  }

  DB.products.unshift({
    id: 100 + DB.products.length + 1,
    name,
    sku,
    price,
    qty,
    type: 'Simple Product',
    status: 'Enabled',
    category
  });

  showToast(`Product "${name}" successfully saved.`);
  navigateTo('#/catalog/products');
}

function exportOrdersCSV() {
  showToast('Exporting filtered orders to orders-2026.csv...');
}

function handleGlobalSearch(term) {
  const box = document.getElementById('searchSuggestions');
  if (!box) return;
  if (!term.trim()) {
    box.style.display = 'none';
    return;
  }
  const matches = DB.orders.filter(o => o.id.includes(term) || o.customer.toLowerCase().includes(term.toLowerCase()));
  if (matches.length === 0) {
    box.innerHTML = `<div style="padding:12px; font-size:11px; color:#64748b;">No matching orders found</div>`;
  } else {
    box.innerHTML = matches.map(m => `
      <div class="search-item" onclick="navigateTo('#/sales/order-details/${m.id}'); document.getElementById('searchSuggestions').style.display='none';">
        <div><strong>Order #${m.id}</strong> - ${m.customer}</div>
        <div style="color:var(--primary); font-weight:700;">AED ${m.total.toFixed(2)}</div>
      </div>
    `).join('');
  }
  box.style.display = 'block';
}

function toggleNotificationsDrawer() {
  const drawer = document.getElementById('sideDrawer');
  const overlay = document.getElementById('drawerOverlay');
  if (!drawer || !overlay) return;
  
  document.getElementById('drawerTitle').innerText = 'System Notifications';
  document.getElementById('drawerBody').innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="padding:12px; border:1px solid #fed7aa; background:#fff7ed; border-radius:6px;">
        <div style="font-weight:700; color:#c2410c;">Low Stock Alert</div>
        <div style="font-size:12px; color:#431407;">Apple iPhone 17 Pro is down to 4 units in main UAE warehouse.</div>
      </div>
      <div style="padding:12px; border:1px solid #bbf7d0; background:#f0fdf4; border-radius:6px;">
        <div style="font-weight:700; color:#15803d;">Telr Payment Synced</div>
        <div style="font-size:12px; color:#14532d;">AED 4,999.00 settled automatically for Order #100028491.</div>
      </div>
    </div>
  `;
  overlay.style.display = 'block';
  drawer.classList.add('open');
}

function closeDrawer() {
  const drawer = document.getElementById('sideDrawer');
  const overlay = document.getElementById('drawerOverlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.style.display = 'none';
}

function closeModalDirect() {
  const overlay = document.getElementById('appModalOverlay');
  if (overlay) overlay.style.display = 'none';
}

function closeModal(e) {
  if (e.target.id === 'appModalOverlay') closeModalDirect();
}
