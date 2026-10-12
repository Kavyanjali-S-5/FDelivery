import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Category,
  FoodItem,
  User,
  Order,
  OrderItem,
  initialCategories,
  initialFoodItems,
  initialOrders,
} from './seedData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'local_db.json');

// Supabase client instance
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
let supabase: SupabaseClient | null = null;
let supabaseReady = false;
let userTableName: 'profiles' | 'users' = 'profiles';

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('YOUR_SUPABASE')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch {
    supabase = null;
  }
}

// Ensure data directory exists for local disk persistence
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Ignore filesystem error in read-only environments
}

// In-memory / persistent relational tables
let categoriesTable: Category[] = [...initialCategories];
let foodItemsTable: FoodItem[] = [...initialFoodItems];
let usersTable: User[] = [
  {
    id: 'usr-admin',
    email: 'admin@fdelivery.com',
    full_name: 'Administrator',
    password_hash: bcrypt.hashSync('admin123', 10),
    phone: '+1 555 000 1111',
    address: '100 Food Plaza Blvd',
    city: 'New York',
    zip: '10001',
    role: 'admin',
    created_at: new Date(Date.now() - 3600 * 1000 * 24 * 30).toISOString(),
  },
  {
    id: 'usr-customer',
    email: 'customer@fdelivery.com',
    full_name: 'John Doe',
    password_hash: bcrypt.hashSync('customer123', 10),
    phone: '+1 555 234 5678',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    zip: '97477',
    role: 'customer',
    created_at: new Date(Date.now() - 3600 * 1000 * 24 * 10).toISOString(),
  },
];
let ordersTable: Order[] = [...initialOrders];

// Load local database from file if available
function loadLocalDatabase() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.categories) && data.categories.length > 0) categoriesTable = data.categories;
      if (Array.isArray(data.foodItems) && data.foodItems.length > 0) foodItemsTable = data.foodItems;
      if (Array.isArray(data.users) && data.users.length > 0) usersTable = data.users;
      if (Array.isArray(data.orders)) ordersTable = data.orders;
    }
  } catch {
    // Keep initialized seed data on error
  }
}

// Save local database to disk
function saveLocalDatabase() {
  try {
    const data = {
      categories: categoriesTable,
      foodItems: foodItemsTable,
      users: usersTable,
      orders: ordersTable,
      updated_at: new Date().toISOString(),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Non-blocking in case of filesystem constraints
  }
}

// Initial load from disk
loadLocalDatabase();

// Probe Supabase schema silently
export async function checkSupabaseSchema(): Promise<{ configured: boolean; ready: boolean; userTable: string }> {
  if (!supabase) {
    supabaseReady = false;
    return { configured: false, ready: false, userTable: userTableName };
  }

  try {
    const testProfiles = await supabase.from('profiles').select('id').limit(1);
    if (!testProfiles.error) {
      userTableName = 'profiles';
      supabaseReady = true;
      return { configured: true, ready: true, userTable: 'profiles' };
    }

    const testUsers = await supabase.from('users').select('id').limit(1);
    if (!testUsers.error) {
      userTableName = 'users';
      supabaseReady = true;
      return { configured: true, ready: true, userTable: 'users' };
    }

    // Schema tables haven't been created yet in Supabase
    supabaseReady = false;
    return { configured: true, ready: false, userTable: userTableName };
  } catch {
    supabaseReady = false;
    return { configured: true, ready: false, userTable: userTableName };
  }
}

// Run initial check
checkSupabaseSchema();

// Order status validation
export const VALID_ORDER_STATUSES: Order['status'][] = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const ALLOWED_STATUS_TRANSITIONS: Record<Order['status'], Order['status'][]> = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Preparing', 'Cancelled'],
  Preparing: ['Out for Delivery', 'Cancelled'],
  'Out for Delivery': ['Delivered', 'Cancelled'],
  Delivered: [],
  Cancelled: [],
};

export const db = {
  isSupabaseConfigured(): boolean {
    return !!supabase;
  },

  isSupabaseReady(): boolean {
    return supabaseReady;
  },

  async getDatabaseStatus() {
    const status = await checkSupabaseSchema();
    return {
      mode: status.ready ? 'supabase-postgresql' : 'embedded-relational',
      supabaseConfigured: status.configured,
      supabaseSchemaReady: status.ready,
      userTable: status.userTable,
      totalUsers: usersTable.length,
      totalOrders: ordersTable.length,
      totalItems: foodItemsTable.length,
    };
  },

  // ================= USERS & AUTH =================
  async findUserByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();

    if (supabaseReady && supabase) {
      try {
        const { data, error } = await supabase
          .from(userTableName)
          .select('*')
          .eq('email', normalized)
          .maybeSingle();
        if (!error && data) return data as User;
      } catch {
        // Fall back to local store
      }
    }

    const found = usersTable.find((u) => u.email.toLowerCase() === normalized);
    return found || null;
  },

  async findUserById(id: string): Promise<User | null> {
    if (supabaseReady && supabase) {
      try {
        const { data, error } = await supabase
          .from(userTableName)
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data as User;
      } catch {
        // Fall back to local store
      }
    }

    const found = usersTable.find((u) => u.id === id);
    return found || null;
  },

  async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const id = 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newUser: User = {
      ...userData,
      id,
      email: userData.email.trim().toLowerCase(),
      created_at: new Date().toISOString(),
    };

    if (supabaseReady && supabase) {
      try {
        const { data, error } = await supabase
          .from(userTableName)
          .insert([newUser])
          .select()
          .single();
        if (!error && data) {
          usersTable.push(data as User);
          saveLocalDatabase();
          return data as User;
        }
      } catch {
        // Fall back to local store
      }
    }

    usersTable.push(newUser);
    saveLocalDatabase();
    return newUser;
  },

  async updateUserProfile(id: string, updates: Partial<Pick<User, 'full_name' | 'phone' | 'address' | 'city' | 'zip'>>): Promise<User | null> {
    if (supabaseReady && supabase) {
      try {
        const { data, error } = await supabase
          .from(userTableName)
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          const idx = usersTable.findIndex((u) => u.id === id);
          if (idx !== -1) usersTable[idx] = data as User;
          saveLocalDatabase();
          return data as User;
        }
      } catch {
        // Fall back to local store
      }
    }

    const idx = usersTable.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    usersTable[idx] = { ...usersTable[idx], ...updates };
    saveLocalDatabase();
    return usersTable[idx];
  },

  async getAllCustomers(): Promise<{ id: string; full_name: string; email: string; phone: string; city: string; orders_count: number; total_spent: number; created_at: string }[]> {
    const customers = usersTable.filter((u) => u.role === 'customer');
    return customers.map((c) => {
      const customerOrders = ordersTable.filter(
        (o) => o.user_id === c.id || o.customer_email.toLowerCase() === c.email.toLowerCase()
      );
      const deliveredOrConfirmed = customerOrders.filter((o) => o.status !== 'Cancelled');
      const totalSpent = deliveredOrConfirmed.reduce((sum, o) => sum + o.total_amount, 0);

      return {
        id: c.id,
        full_name: c.full_name,
        email: c.email,
        phone: c.phone || 'N/A',
        city: c.city || 'N/A',
        orders_count: customerOrders.length,
        total_spent: Math.round(totalSpent * 100) / 100,
        created_at: c.created_at,
      };
    });
  },

  // ================= CATEGORIES =================
  async getCategories(): Promise<Category[]> {
    if (supabaseReady && supabase) {
      try {
        const { data, error } = await supabase
          .from('food_categories')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) return data as Category[];
      } catch {
        // Fall back to local store
      }
    }
    return [...categoriesTable].sort((a, b) => a.sort_order - b.sort_order);
  },

  async createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    const id = 'cat-' + Date.now();
    const newCat: Category = { ...cat, id };

    if (supabaseReady && supabase) {
      try {
        const { data, error } = await supabase
          .from('food_categories')
          .insert([newCat])
          .select()
          .single();
        if (!error && data) {
          categoriesTable.push(data as Category);
          saveLocalDatabase();
          return data as Category;
        }
      } catch {
        // Fall back to local store
      }
    }

    categoriesTable.push(newCat);
    saveLocalDatabase();
    return newCat;
  },

  // ================= FOOD ITEMS =================
  async getFoodItems(options?: { category?: string; search?: string; availableOnly?: boolean }): Promise<FoodItem[]> {
    let items = [...foodItemsTable];

    if (supabaseReady && supabase) {
      try {
        const { data, error } = await supabase.from('food_items').select('*');
        if (!error && data && data.length > 0) {
          items = data as FoodItem[];
        }
      } catch {
        // Fall back to local store
      }
    }

    if (options?.availableOnly !== false) {
      items = items.filter((item) => item.is_available);
    }

    if (options?.category && options.category !== 'All' && options.category !== 'All Product') {
      const catName = options.category.toLowerCase();
      const matchedCat = categoriesTable.find(
        (c) => c.name.toLowerCase() === catName || c.slug.toLowerCase() === catName || c.id === options.category
      );
      if (matchedCat) {
        items = items.filter((item) => item.category_id === matchedCat.id);
      }
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      items = items.filter(
        (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      );
    }

    return items;
  },

  async getFoodItemById(id: string): Promise<FoodItem | null> {
    const item = foodItemsTable.find((f) => f.id === id);
    return item || null;
  },

  async createFoodItem(itemData: Omit<FoodItem, 'id' | 'created_at' | 'updated_at'>): Promise<FoodItem> {
    const id = 'food-' + Date.now();
    const now = new Date().toISOString();
    const newItem: FoodItem = {
      ...itemData,
      id,
      created_at: now,
      updated_at: now,
    };

    if (supabaseReady && supabase) {
      try {
        const { data, error } = await supabase
          .from('food_items')
          .insert([newItem])
          .select()
          .single();
        if (!error && data) {
          foodItemsTable.push(data as FoodItem);
          saveLocalDatabase();
          return data as FoodItem;
        }
      } catch {
        // Fall back to local store
      }
    }

    foodItemsTable.push(newItem);
    saveLocalDatabase();
    return newItem;
  },

  async updateFoodItem(id: string, updates: Partial<FoodItem>): Promise<FoodItem | null> {
    const idx = foodItemsTable.findIndex((f) => f.id === id);
    if (idx === -1) return null;

    foodItemsTable[idx] = {
      ...foodItemsTable[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (supabaseReady && supabase) {
      try {
        await supabase.from('food_items').update(updates).eq('id', id);
      } catch {
        // Ignore remote update failure
      }
    }

    saveLocalDatabase();
    return foodItemsTable[idx];
  },

  async deleteFoodItem(id: string): Promise<boolean> {
    const initialLen = foodItemsTable.length;
    foodItemsTable = foodItemsTable.filter((f) => f.id !== id);

    if (supabaseReady && supabase) {
      try {
        await supabase.from('food_items').delete().eq('id', id);
      } catch {
        // Ignore remote failure
      }
    }

    saveLocalDatabase();
    return foodItemsTable.length < initialLen;
  },

  // ================= ORDERS =================
  async createOrder(params: {
    user_id?: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address: string;
    city: string;
    zip: string;
    delivery_time?: string;
    notes?: string;
    items: { food_item_id: string; quantity: number }[];
  }): Promise<{ order: Order; errors?: string[] }> {
    if (!params.items || params.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // Server-side validation of food availability & prices
    let subtotal = 0;
    const orderItems: OrderItem[] = [];
    const orderId = 'ord-' + Date.now();

    for (const itemReq of params.items) {
      const food = foodItemsTable.find((f) => f.id === itemReq.food_item_id);
      if (!food) {
        throw new Error(`Food item not found with ID: ${itemReq.food_item_id}`);
      }
      if (!food.is_available) {
        throw new Error(`Food item "${food.name}" is currently unavailable.`);
      }
      if (itemReq.quantity <= 0) {
        throw new Error(`Invalid quantity ${itemReq.quantity} for item "${food.name}".`);
      }

      const itemTotal = Math.round(food.price * itemReq.quantity * 100) / 100;
      subtotal += itemTotal;

      orderItems.push({
        id: 'oi-' + Math.random().toString(36).substring(2, 9),
        order_id: orderId,
        food_item_id: food.id,
        item_name: food.name,
        unit_price: food.price,
        quantity: itemReq.quantity,
        total_price: itemTotal,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;
    const delivery_fee = subtotal >= 50.0 ? 0.0 : 4.99;
    const total_amount = Math.round((subtotal + delivery_fee) * 100) / 100;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `FD-${datePrefix}-${randomSuffix}`;

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      user_id: params.user_id,
      customer_name: params.customer_name.trim(),
      customer_email: params.customer_email.trim().toLowerCase(),
      customer_phone: params.customer_phone.trim(),
      delivery_address: params.delivery_address.trim(),
      city: params.city.trim(),
      zip: params.zip.trim(),
      delivery_time: params.delivery_time || 'ASAP',
      notes: params.notes || '',
      subtotal,
      delivery_fee,
      total_amount,
      payment_method: 'cash_on_delivery',
      payment_status: 'pending',
      status: 'Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: orderItems,
    };

    if (supabaseReady && supabase) {
      try {
        const { error: ordErr } = await supabase.from('orders').insert([{
          id: newOrder.id,
          order_number: newOrder.order_number,
          user_id: newOrder.user_id,
          customer_name: newOrder.customer_name,
          customer_email: newOrder.customer_email,
          customer_phone: newOrder.customer_phone,
          delivery_address: newOrder.delivery_address,
          city: newOrder.city,
          zip: newOrder.zip,
          delivery_time: newOrder.delivery_time,
          notes: newOrder.notes,
          subtotal: newOrder.subtotal,
          delivery_fee: newOrder.delivery_fee,
          total_amount: newOrder.total_amount,
          payment_method: newOrder.payment_method,
          payment_status: newOrder.payment_status,
          status: newOrder.status,
        }]);

        if (!ordErr) {
          await supabase.from('order_items').insert(orderItems);
        }
      } catch {
        // Fall back safely
      }
    }

    ordersTable.unshift(newOrder);
    saveLocalDatabase();
    return { order: newOrder };
  },

  async getOrderById(id: string): Promise<Order | null> {
    const order = ordersTable.find((o) => o.id === id || o.order_number === id);
    return order || null;
  },

  async getUserOrders(userId: string, email?: string): Promise<Order[]> {
    return ordersTable.filter((o) => {
      if (o.user_id && o.user_id === userId) return true;
      if (email && o.customer_email.toLowerCase() === email.toLowerCase()) return true;
      return false;
    });
  },

  async getAllOrders(): Promise<Order[]> {
    return [...ordersTable];
  },

  async updateOrderStatus(
    orderId: string,
    newStatus: Order['status']
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    if (!VALID_ORDER_STATUSES.includes(newStatus)) {
      return { success: false, error: `Invalid order status "${newStatus}"` };
    }

    const order = ordersTable.find((o) => o.id === orderId || o.order_number === orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.status === newStatus) {
      return { success: true, order };
    }

    // Check transition rules
    const allowed = ALLOWED_STATUS_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(newStatus)) {
      return {
        success: false,
        error: `Cannot transition order status from "${order.status}" to "${newStatus}".`,
      };
    }

    order.status = newStatus;
    order.updated_at = new Date().toISOString();

    if (newStatus === 'Delivered') {
      order.payment_status = 'paid';
      order.delivered_at = new Date().toISOString();
    }

    if (supabaseReady && supabase) {
      try {
        await supabase
          .from('orders')
          .update({
            status: order.status,
            payment_status: order.payment_status,
            delivered_at: order.delivered_at,
            updated_at: order.updated_at,
          })
          .eq('id', order.id);
      } catch {
        // Ignore remote update failure
      }
    }

    saveLocalDatabase();
    return { success: true, order };
  },

  // ================= ADMIN STATS =================
  async getAdminStats() {
    const totalOrders = ordersTable.length;
    const pendingOrders = ordersTable.filter((o) => o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Preparing').length;
    const deliveredOrders = ordersTable.filter((o) => o.status === 'Delivered').length;
    const cancelledOrders = ordersTable.filter((o) => o.status === 'Cancelled').length;

    const totalRevenue = ordersTable
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const customersCount = usersTable.filter((u) => u.role === 'customer').length;
    const foodItemsCount = foodItemsTable.length;

    return {
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      customersCount,
      foodItemsCount,
    };
  },
};
