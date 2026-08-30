const { pool } = require("../config/database");
const Dashboard = {
  async overview(country = "AE") {
    const [kpis] = await pool.execute("SELECT * FROM dashboard_kpis WHERE country_code=? ORDER BY display_order", [country]);
    const [sales] = await pool.execute("SELECT metric_date,revenue,orders_count FROM dashboard_sales_daily WHERE country_code=? ORDER BY metric_date DESC LIMIT 7", [country]);
    const [visitors] = await pool.execute("SELECT metric_date,visitors,users,conversion_rate FROM dashboard_visitors_daily WHERE country_code=? ORDER BY metric_date DESC LIMIT 7", [country]);
    const [orderStats] = await pool.execute("SELECT * FROM dashboard_order_stats WHERE country_code=? ORDER BY display_order", [country]);
    const [activities] = await pool.execute("SELECT * FROM dashboard_recent_activities ORDER BY created_at DESC LIMIT 8");
    const [notifications] = await pool.execute("SELECT * FROM dashboard_notifications ORDER BY created_at DESC LIMIT 6");
    return { countryCode: country, kpis, sales: sales.reverse(), visitors: visitors.reverse(), orderStats, activities, notifications };
  },
  async search(q, country = "AE") { const like = `%${q}%`; const [r] = await pool.execute(`(SELECT 'KPI' result_type, metric_label title, metric_key subtitle FROM dashboard_kpis WHERE country_code=? AND metric_label LIKE ? LIMIT 5) UNION ALL (SELECT 'Product', title, sku FROM catalog_products WHERE title LIKE ? OR sku LIKE ? LIMIT 5)`, [country, like, like, like]); return r; }
};
module.exports = Dashboard;
