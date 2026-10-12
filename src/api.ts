export interface FoodItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  rating: number;
  is_available: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  role: 'customer' | 'admin';
  created_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  food_item_id: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  zip: string;
  delivery_time: string;
  notes?: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: 'Pending' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  customersCount: number;
  foodItemsCount: number;
}

export interface CustomerSummary {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  orders_count: number;
  total_spent: number;
  created_at: string;
}

const API_BASE = '/api';

export const authState = {
  getToken(): string | null {
    return localStorage.getItem('fdelivery_token');
  },
  setSession(token: string, user: UserProfile) {
    localStorage.setItem('fdelivery_token', token);
    localStorage.setItem('fdelivery_user', JSON.stringify(user));
  },
  getUser(): UserProfile | null {
    const raw = localStorage.getItem('fdelivery_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  clearSession() {
    localStorage.removeItem('fdelivery_token');
    localStorage.removeItem('fdelivery_user');
  },
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authState.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(params: {
    email: string;
    password: string;
    confirmPassword?: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
  }) {
    const res = await request<{ message: string; token: string; user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    authState.setSession(res.token, res.user);
    return res;
  },

  async login(email: string, password: string) {
    const res = await request<{ message: string; token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    authState.setSession(res.token, res.user);
    return res;
  },

  logout() {
    authState.clearSession();
  },

  async getMe() {
    return request<{ user: UserProfile }>('/auth/me');
  },

  async updateProfile(updates: Partial<UserProfile>) {
    return request<{ message: string; user: UserProfile }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Categories
  async getCategories() {
    return request<{ categories: Category[] }>('/categories');
  },

  async createCategory(cat: { name: string; description?: string; sort_order?: number }) {
    return request<{ category: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(cat),
    });
  },

  // Food Items
  async getFoodItems(params?: { category?: string; search?: string; available_only?: boolean }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.available_only !== undefined) query.append('available_only', String(params.available_only));
    const qs = query.toString();
    return request<{ items: FoodItem[] }>(`/food-items${qs ? `?${qs}` : ''}`);
  },

  async getFoodItem(id: string) {
    return request<{ item: FoodItem }>(`/food-items/${id}`);
  },

  async createFoodItem(item: Partial<FoodItem>) {
    return request<{ item: FoodItem }>('/food-items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async updateFoodItem(id: string, updates: Partial<FoodItem>) {
    return request<{ item: FoodItem }>(`/food-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteFoodItem(id: string) {
    return request<{ message: string }>(`/food-items/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders
  async getQuote(items: { food_item_id: string; quantity: number }[]) {
    return request<{
      subtotal: number;
      delivery_fee: number;
      total_amount: number;
      items: any[];
      is_free_delivery: boolean;
      free_delivery_threshold: number;
    }>('/orders/quote', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  async createOrder(params: {
    firstName?: string;
    lastName?: string;
    customer_name?: string;
    customer_email?: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
    deliveryTime?: string;
    notes?: string;
    items: { food_item_id: string; quantity: number }[];
  }) {
    return request<{ message: string; order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async getMyOrders() {
    return request<{ orders: Order[] }>('/orders/my-orders');
  },

  async trackOrder(orderIdOrNumber: string) {
    return request<{ order: Order }>(`/orders/track/${encodeURIComponent(orderIdOrNumber)}`);
  },

  // Admin
  async getAdminStats() {
    return request<{ stats: AdminStats }>('/admin/stats');
  },

  async getAdminOrders() {
    return request<{ orders: Order[] }>('/admin/orders');
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    return request<{ message: string; order: Order }>(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getAdminCustomers() {
    return request<{ customers: CustomerSummary[] }>('/admin/customers');
  },

  async getDatabaseStatus() {
    return request<{
      mode: string;
      supabaseConfigured: boolean;
      supabaseSchemaReady: boolean;
      userTable: string;
      totalUsers: number;
      totalOrders: number;
      totalItems: number;
    }>('/database/status');
  },

  async recheckDatabase() {
    return request<{
      message: string;
      status: { configured: boolean; ready: boolean; userTable: string };
    }>('/database/recheck', { method: 'POST' });
  },
};
