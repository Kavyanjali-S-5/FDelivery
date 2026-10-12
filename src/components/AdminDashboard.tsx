import React, { useState, useEffect } from 'react';
import { api, AdminStats, Order, FoodItem, Category, CustomerSummary } from '../api.ts';
import { ActiveView } from '../types.ts';

interface AdminDashboardProps {
  onNavigate: (view: ActiveView) => void;
  categories: Category[];
  foodItems: FoodItem[];
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  categories,
  foodItems,
  onRefreshData,
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'orders' | 'menu' | 'customers'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [dbInfo, setDbInfo] = useState<{ mode: string; supabaseConfigured: boolean; supabaseSchemaReady: boolean } | null>(null);
  const [isRecheckingDb, setIsRecheckingDb] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New food item form states
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0]?.id || 'cat-1');
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState('');
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, ordersRes, customersRes, dbRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOrders(),
        api.getAdminCustomers(),
        api.getDatabaseStatus().catch(() => null),
      ]);
      setStats(statsRes.stats);
      setOrders(ordersRes.orders || []);
      setCustomers(customersRes.customers || []);
      if (dbRes) setDbInfo(dbRes);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to load admin data. Make sure you are signed in as admin.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecheckSupabase = async () => {
    setIsRecheckingDb(true);
    try {
      const res = await api.recheckDatabase();
      setMessage({
        text: res.message,
        type: res.status.ready ? 'success' : 'error',
      });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to recheck database.', type: 'error' });
    } finally {
      setIsRecheckingDb(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      const res = await api.updateOrderStatus(orderId, status);
      setMessage({ text: res.message, type: 'success' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update order status.', type: 'error' });
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) {
      setMessage({ text: 'Food title and price are required.', type: 'error' });
      return;
    }

    setIsSubmittingItem(true);
    try {
      await api.createFoodItem({
        name: newTitle.trim(),
        price: parseFloat(newPrice),
        category_id: newCategory,
        description: newDescription.trim() || 'Freshly prepared specialty dish with premium ingredients.',
        image_url: newImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        rating: 4.8,
        is_available: true,
      });

      setMessage({ text: `Food item "${newTitle}" added to menu successfully!`, type: 'success' });
      setNewTitle('');
      setNewPrice('');
      setNewDescription('');
      setNewImage('');
      onRefreshData();
      fetchAdminData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to add food item.', type: 'error' });
    } finally {
      setIsSubmittingItem(false);
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the menu?`)) return;
    try {
      await api.deleteFoodItem(id);
      setMessage({ text: `Item "${name}" deleted.`, type: 'success' });
      onRefreshData();
      fetchAdminData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to delete item.', type: 'error' });
    }
  };

  const handleToggleItemAvailability = async (item: FoodItem) => {
    try {
      await api.updateFoodItem(item.id, { is_available: !item.is_available });
      setMessage({ text: `Availability updated for "${item.name}".`, type: 'success' });
      onRefreshData();
      fetchAdminData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update item availability.', type: 'error' });
    }
  };

  const outForDeliveryOrders = orders.filter((o) => o.status === 'Out for Delivery');

  return (
    <div className="admin-shell">
      {/* Sidebar matching admin.html */}
      <aside className="admin-sidebar">
        <div className="brand-block">
          <div className="logo-badge" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>
            <i className="bx bxs-dish"></i>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>FDelivery Admin</h2>
        </div>

        <nav className="admin-nav">
          <button
            type="button"
            className={activeSection === 'overview' ? 'active' : ''}
            onClick={() => setActiveSection('overview')}
          >
            <i className="bx bx-grid-alt"></i> Overview
          </button>
          <button
            type="button"
            className={activeSection === 'orders' ? 'active' : ''}
            onClick={() => setActiveSection('orders')}
          >
            <i className="bx bx-package"></i> Orders ({orders.length})
          </button>
          <button
            type="button"
            className={activeSection === 'menu' ? 'active' : ''}
            onClick={() => setActiveSection('menu')}
          >
            <i className="bx bx-food-menu"></i> Menu Management ({foodItems.length})
          </button>
          <button
            type="button"
            className={activeSection === 'customers' ? 'active' : ''}
            onClick={() => setActiveSection('customers')}
          >
            <i className="bx bx-user"></i> Customers ({customers.length})
          </button>

          <div style={{ margin: '1.5rem 0', borderTop: '1px solid #1f2937' }}></div>

          <button
            type="button"
            onClick={() => onNavigate('storefront')}
            style={{ color: '#9ca3af' }}
          >
            <i className="bx bx-home"></i> View Storefront
          </button>
          <button
            type="button"
            onClick={() => onNavigate('storefront')}
            style={{ color: '#9ca3af' }}
          >
            <i className="bx bx-arrow-back"></i> Back to Home
          </button>
        </nav>
      </aside>

      {/* Main Admin Content */}
      <main className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Admin Panel</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn small"
              id="manage-menu-button"
              type="button"
              onClick={() => setActiveSection('menu')}
            >
              <i className="bx bx-plus"></i> Manage Menu
            </button>
            <button
              className="btn small outline"
              type="button"
              onClick={fetchAdminData}
            >
              <i className="bx bx-refresh"></i> Refresh
            </button>
          </div>
        </header>

        {message && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: message.type === 'success' ? '#065f46' : '#991b1b',
              border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            }}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} style={{ background: 'none', color: 'inherit' }}>
              ✕
            </button>
          </div>
        )}

        {/* Database Sync Status Badge */}
        {dbInfo && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '14px',
              marginBottom: '2rem',
              background: dbInfo.supabaseSchemaReady ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${dbInfo.supabaseSchemaReady ? '#bbf7d0' : '#fef3c7'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i
                className={`bx ${dbInfo.supabaseSchemaReady ? 'bxs-check-shield' : 'bx-info-circle'}`}
                style={{
                  fontSize: '1.75rem',
                  color: dbInfo.supabaseSchemaReady ? '#16a34a' : '#d97706',
                }}
              ></i>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#1f2937' }}>
                  {dbInfo.supabaseSchemaReady
                    ? 'Connected to Cloud Supabase PostgreSQL'
                    : 'Operating in Persistent Relational Mode (Cloud SQL Schema Pending)'}
                </strong>
                <p style={{ margin: 0, fontSize: '0.825rem', color: '#4b5563' }}>
                  {dbInfo.supabaseSchemaReady
                    ? 'Active cloud tables verified. All mutations are writing directly to Supabase.'
                    : 'Supabase project detected. To sync directly to your cloud PostgreSQL database, run "supabase-schema.sql" in your Supabase SQL Editor.'}
                </p>
              </div>
            </div>

            {dbInfo.supabaseConfigured && !dbInfo.supabaseSchemaReady && (
              <button
                type="button"
                className="btn small"
                onClick={handleRecheckSupabase}
                disabled={isRecheckingDb}
                style={{ backgroundColor: '#d97706', color: '#fff' }}
              >
                {isRecheckingDb ? (
                  <span><i className="bx bx-loader-alt bx-spin"></i> Checking...</span>
                ) : (
                  <span><i className="bx bx-refresh"></i> Recheck Supabase Schema</span>
                )}
              </button>
            )}
          </div>
        )}

        {/* 1. Overview Section */}
        {activeSection === 'overview' && (
          <section className="admin-overview" id="overview">
            <div className="stats-grid">
              <div className="stat-card">
                <span>Total Orders</span>
                <strong id="total-orders">{stats?.totalOrders ?? orders.length}</strong>
              </div>
              <div className="stat-card">
                <span>Revenue</span>
                <strong id="total-revenue">${(stats?.totalRevenue ?? 0).toFixed(2)}</strong>
              </div>
              <div className="stat-card">
                <span>Pending / Prep</span>
                <strong id="pending-orders">{stats?.pendingOrders ?? 0}</strong>
              </div>
              <div className="stat-card">
                <span>Out for Delivery</span>
                <strong style={{ color: '#d97706' }}>{outForDeliveryOrders.length}</strong>
              </div>
            </div>

            {outForDeliveryOrders.length > 0 && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <strong style={{ fontSize: '1.05rem', color: '#92400e', display: 'block' }}>
                    🚚 {outForDeliveryOrders.length} Order(s) Currently Out for Delivery
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: '#b45309' }}>
                    Orders can be updated to "Delivered" once delivery is completed.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn small"
                  style={{ backgroundColor: '#d97706' }}
                  onClick={() => setActiveSection('orders')}
                >
                  <i className="bx bx-package"></i> View Active Orders
                </button>
              </div>
            )}
          </section>
        )}

        {/* 2. Orders Panel */}
        {activeSection === 'orders' && (
          <section className="admin-panel" id="orders">
            <div className="panel-header">
              <h2>Recent Orders</h2>
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                Manage customer orders and update delivery status
              </span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Update Action</th>
                  </tr>
                </thead>
                <tbody id="orders-table-body">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                        No orders recorded in database.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id}>
                        <td>
                          <strong style={{ color: 'var(--primary-color)' }}>{ord.order_number}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td>
                          <strong>{ord.customer_name}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{ord.customer_phone}</div>
                        </td>
                        <td>
                          {ord.items && ord.items.length > 0 ? (
                            <span>
                              {ord.items.map((i) => `${i.quantity}x ${i.item_name}`).join(', ')}
                            </span>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>No item details</span>
                          )}
                        </td>
                        <td>
                          <strong>${ord.total_amount.toFixed(2)}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>COD</div>
                        </td>
                        <td>
                          <span className={`badge-status badge-${ord.status.replace(/\s+/g, '-')}`}>{ord.status}</span>
                        </td>
                        <td>
                          {ord.status === 'Delivered' ? (
                            <span style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: 600 }}>
                              ✓ Delivered
                            </span>
                          ) : ord.status === 'Cancelled' ? (
                            <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                              Cancelled
                            </span>
                          ) : (
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateStatus(ord.id, e.target.value as Order['status'])}
                              style={{
                                padding: '0.35rem 0.6rem',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                fontSize: '0.85rem',
                                outline: 'none',
                              }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Preparing">Preparing</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 3. Menu Management Panel */}
        {activeSection === 'menu' && (
          <section className="admin-panel" id="menu">
            <div className="panel-header">
              <h2>Menu Management</h2>
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                Add, edit, or configure active food items
              </span>
            </div>

            <form onSubmit={handleAddMenuItem} className="menu-form-row">
              <input
                id="menu-title"
                type="text"
                placeholder="Food name (e.g. Truffle Cheeseburger)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <input
                id="menu-price"
                type="number"
                step="0.01"
                placeholder="Price ($)"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                required
              />
              <select
                id="menu-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="btn small"
                id="add-menu-item"
                disabled={isSubmittingItem}
              >
                {isSubmittingItem ? 'Saving...' : 'Save Item'}
              </button>
            </form>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Availability</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="menu-table-body">
                  {foodItems.map((item) => {
                    const cat = categories.find((c) => c.id === item.category_id);
                    return (
                      <tr key={item.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                              src={item.image_url}
                              alt={item.name}
                              style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                            />
                            <div>
                              <strong>{item.name}</strong>
                              <div style={{ fontSize: '0.75rem', color: '#9ca3af', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{cat?.name || 'Fast Food'}</td>
                        <td>
                          <strong>${item.price.toFixed(2)}</strong>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleToggleItemAvailability(item)}
                            style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '50px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: item.is_available ? '#dcfce7' : '#fee2e2',
                              color: item.is_available ? '#166534' : '#991b1b',
                              cursor: 'pointer',
                            }}
                          >
                            {item.is_available ? '● Available' : '○ Disabled'}
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            style={{
                              background: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                            }}
                            title="Delete food item"
                          >
                            <i className="bx bx-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 5. Customers Panel */}
        {activeSection === 'customers' && (
          <section className="admin-panel" id="customers">
            <div className="panel-header">
              <h2>Registered Customers</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Orders Count</th>
                    <th>Total Spent</th>
                  </tr>
                </thead>
                <tbody id="customers-table-body">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                        No customers registered yet.
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.full_name}</strong>
                        </td>
                        <td>{c.email}</td>
                        <td>{c.phone}</td>
                        <td>{c.city}</td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{c.orders_count}</span> orders
                        </td>
                        <td>
                          <strong style={{ color: 'var(--primary-color)' }}>
                            ${c.total_spent.toFixed(2)}
                          </strong>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
