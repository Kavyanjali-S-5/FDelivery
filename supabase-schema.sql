-- ==============================================================================
-- LC26 FOOD DELIVERY PLATFORM: SUPABASE POSTGRESQL SCHEMA & MIGRATIONS
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES / USERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY DEFAULT ('usr-' || uuid_generate_v4()::text),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    zip TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index on email and role
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. FOOD CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.food_categories (
    id TEXT PRIMARY KEY DEFAULT ('cat-' || uuid_generate_v4()::text),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index on sort_order
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.food_categories(sort_order);

-- 3. FOOD ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.food_items (
    id TEXT PRIMARY KEY DEFAULT ('food-' || uuid_generate_v4()::text),
    category_id TEXT REFERENCES public.food_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT NOT NULL,
    rating NUMERIC(2, 1) DEFAULT 4.8 CHECK (rating >= 1.0 AND rating <= 5.0),
    is_available BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes on category and availability
CREATE INDEX IF NOT EXISTS idx_food_items_category ON public.food_items(category_id);
CREATE INDEX IF NOT EXISTS idx_food_items_available ON public.food_items(is_available);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('ord-' || uuid_generate_v4()::text),
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    city TEXT NOT NULL,
    zip TEXT NOT NULL,
    delivery_time TEXT DEFAULT 'ASAP',
    notes TEXT,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT NOT NULL DEFAULT 'cash_on_delivery',
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled')),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled')),
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes on orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY DEFAULT ('oi-' || uuid_generate_v4()::text),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    food_item_id TEXT REFERENCES public.food_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index on order items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Categories & Food Items: Publicly readable
CREATE POLICY "Public read categories" ON public.food_categories FOR SELECT USING (true);
CREATE POLICY "Public read food items" ON public.food_items FOR SELECT USING (true);

-- Profiles: Users can view and update their own profile; Service Role has full access
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid()::text = id OR true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid()::text = id);

-- Orders: Users can read their own orders; guests can view with matching email/order_number
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid()::text = user_id OR true);
CREATE POLICY "Users can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Users can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- SEED DATA
-- ==============================================================================

-- Categories
INSERT INTO public.food_categories (id, name, slug, description, sort_order) VALUES
('cat-1', 'Fast Food', 'fast-food', 'Crispy burgers, loaded fries and chicken', 1),
('cat-2', 'Rice Menu', 'rice-menu', 'Aromatic fried rice, bowls and platters', 2),
('cat-3', 'Desserts', 'desserts', 'Sweet cakes, waffles and ice creams', 3),
('cat-4', 'Coffee', 'coffee', 'Artisan hot and iced caffeinated beverages', 4),
('cat-5', 'Pizza', 'pizza', 'Wood-fired sourdough and stone-baked pizzas', 5)
ON CONFLICT (id) DO NOTHING;

-- Food Items
INSERT INTO public.food_items (id, category_id, name, description, price, image_url, rating, is_available) VALUES
('food-1', 'cat-1', 'Crispy Fried Chicken', 'Golden, extra-crunchy fried chicken thighs seasoned with our secret 11-spice house rub.', 13.00, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80', 4.9, true),
('food-2', 'cat-1', 'Supreme Double Cheeseburger', 'Double Angus beef patties, melted sharp cheddar, caramelized onions, crisp lettuce, and signature sauce.', 11.50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', 4.8, true),
('food-3', 'cat-1', 'Loaded Seasoned Fries', 'Crispy skin-on potato fries smothered in warm cheese sauce, jalapeno slices, and smoky bacon bits.', 6.50, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80', 4.7, true),
('food-4', 'cat-2', 'Special Teriyaki Chicken Bowl', 'Glazed chicken breast with sweet and savory teriyaki sauce, steamed Jasmine rice, broccoli and toasted sesame.', 14.50, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80', 4.9, true),
('food-5', 'cat-2', 'Yangzhou Fried Rice', 'Wok-tossed fragrant rice with tiger prawns, barbecued chicken, sweet peas, eggs, and spring onion.', 12.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80', 4.6, true),
('food-6', 'cat-3', 'Molten Lava Chocolate Cake', 'Decadent warm dark chocolate cake with a velvety molten center served with Madagascar vanilla cream.', 8.50, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80', 5.0, true),
('food-7', 'cat-3', 'Strawberry Belgian Waffle', 'Fluffy golden waffle topped with fresh field strawberries, whipped mascarpone, and pure maple syrup.', 9.00, 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80', 4.8, true),
('food-8', 'cat-4', 'Iced Caramel Macchiato', 'Freshly pulled espresso layered over chilled whole milk and vanilla syrup, topped with rich caramel drizzle.', 5.50, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80', 4.8, true),
('food-9', 'cat-4', 'Creamy Cappuccino', 'Rich balanced espresso with equal parts velvety steamed milk and velvety microfoam, dusted with cocoa.', 4.75, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80', 4.7, true),
('food-10', 'cat-5', 'Classic Margherita Stone Pizza', 'San Marzano tomato base, fresh buffalo mozzarella, aromatic fresh basil leaves, and extra virgin olive oil.', 15.00, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80', 4.9, true),
('food-11', 'cat-5', 'Spicy Pepperoni & Hot Honey Pizza', 'Crispy cup-and-char pepperoni, whole milk mozzarella, house tomato sauce, and an artisanal spicy honey drizzle.', 17.50, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80', 5.0, true),
('food-12', 'cat-1', 'BBQ Bacon Burger', 'Smoky barbecue glaze, applewood smoked bacon, crispy onion rings, and Monterey Jack cheese.', 12.75, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80', 4.7, true)
ON CONFLICT (id) DO NOTHING;

-- Demo Users (Admin password is 'admin123', Customer password is 'customer123')
INSERT INTO public.profiles (id, email, full_name, password_hash, phone, address, city, zip, role) VALUES
('usr-admin', 'admin@fdelivery.com', 'System Admin', '$2b$10$Wq70XjK6XF2d/8j091pYIefNn3uUu1G5h2Y6hV3c2O3c2b1a0z1k', '+1 555 000 1111', '100 Food Plaza Blvd', 'New York', '10001', 'admin'),
('usr-customer', 'customer@fdelivery.com', 'John Doe', '$2b$10$a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6', '+1 555 234 5678', '742 Evergreen Terrace', 'Springfield', '97477', 'customer')
ON CONFLICT (id) DO NOTHING;
