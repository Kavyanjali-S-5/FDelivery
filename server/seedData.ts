export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
}

export interface FoodItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  rating: number;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  role: 'customer' | 'admin';
  created_at: string;
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

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Fast Food', slug: 'fast-food', description: 'Crispy burgers, loaded fries and chicken', sort_order: 1 },
  { id: 'cat-2', name: 'Rice Menu', slug: 'rice-menu', description: 'Aromatic fried rice, bowls and platters', sort_order: 2 },
  { id: 'cat-3', name: 'Desserts', slug: 'desserts', description: 'Sweet cakes, waffles and ice creams', sort_order: 3 },
  { id: 'cat-4', name: 'Coffee', slug: 'coffee', description: 'Artisan hot and iced caffeinated beverages', sort_order: 4 },
  { id: 'cat-5', name: 'Pizza', slug: 'pizza', description: 'Wood-fired sourdough and stone-baked pizzas', sort_order: 5 },
];

export const initialFoodItems: FoodItem[] = [
  // Fast Food
  {
    id: 'food-1',
    category_id: 'cat-1',
    name: 'Crispy Fried Chicken',
    description: 'Golden, extra-crunchy fried chicken thighs seasoned with our secret 11-spice house rub.',
    price: 13.0,
    image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    is_available: true,
  },
  {
    id: 'food-2',
    category_id: 'cat-1',
    name: 'Supreme Double Cheeseburger',
    description: 'Double Angus beef patties, melted sharp cheddar, caramelized onions, crisp lettuce, and signature sauce.',
    price: 11.5,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    is_available: true,
  },
  {
    id: 'food-3',
    category_id: 'cat-1',
    name: 'Loaded Seasoned Fries',
    description: 'Crispy skin-on potato fries smothered in warm cheese sauce, jalapeno slices, and smoky bacon bits.',
    price: 6.5,
    image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    is_available: true,
  },
  // Rice Menu
  {
    id: 'food-4',
    category_id: 'cat-2',
    name: 'Special Teriyaki Chicken Bowl',
    description: 'Glazed chicken breast with sweet and savory teriyaki sauce, steamed Jasmine rice, broccoli and toasted sesame.',
    price: 14.5,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    is_available: true,
  },
  {
    id: 'food-5',
    category_id: 'cat-2',
    name: 'Yangzhou Fried Rice',
    description: 'Wok-tossed fragrant rice with tiger prawns, barbecued chicken, sweet peas, eggs, and spring onion.',
    price: 12.0,
    image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    is_available: true,
  },
  // Desserts
  {
    id: 'food-6',
    category_id: 'cat-3',
    name: 'Molten Lava Chocolate Cake',
    description: 'Decadent warm dark chocolate cake with a velvety molten center served with Madagascar vanilla cream.',
    price: 8.5,
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    is_available: true,
  },
  {
    id: 'food-7',
    category_id: 'cat-3',
    name: 'Strawberry Belgian Waffle',
    description: 'Fluffy golden waffle topped with fresh field strawberries, whipped mascarpone, and pure maple syrup.',
    price: 9.0,
    image_url: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    is_available: true,
  },
  // Coffee
  {
    id: 'food-8',
    category_id: 'cat-4',
    name: 'Iced Caramel Macchiato',
    description: 'Freshly pulled espresso layered over chilled whole milk and vanilla syrup, topped with rich caramel drizzle.',
    price: 5.5,
    image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    is_available: true,
  },
  {
    id: 'food-9',
    category_id: 'cat-4',
    name: 'Creamy Cappuccino',
    description: 'Rich balanced espresso with equal parts velvety steamed milk and velvety microfoam, dusted with cocoa.',
    price: 4.75,
    image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    is_available: true,
  },
  // Pizza
  {
    id: 'food-10',
    category_id: 'cat-5',
    name: 'Classic Margherita Stone Pizza',
    description: 'San Marzano tomato base, fresh buffalo mozzarella, aromatic fresh basil leaves, and extra virgin olive oil.',
    price: 15.0,
    image_url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    is_available: true,
  },
  {
    id: 'food-11',
    category_id: 'cat-5',
    name: 'Spicy Pepperoni & Hot Honey Pizza',
    description: 'Crispy cup-and-char pepperoni, whole milk mozzarella, house tomato sauce, and an artisanal spicy honey drizzle.',
    price: 17.5,
    image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    is_available: true,
  },
  {
    id: 'food-12',
    category_id: 'cat-1',
    name: 'BBQ Bacon Burger',
    description: 'Smoky barbecue glaze, applewood smoked bacon, crispy onion rings, and Monterey Jack cheese.',
    price: 12.75,
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    is_available: true,
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    order_number: 'FD-202610-8401',
    user_id: 'usr-customer',
    customer_name: 'John Doe',
    customer_email: 'customer@fdelivery.com',
    customer_phone: '+1 555 234 5678',
    delivery_address: '742 Evergreen Terrace',
    city: 'Springfield',
    zip: '97477',
    delivery_time: 'ASAP',
    notes: 'Please ring the doorbell twice',
    subtotal: 24.5,
    delivery_fee: 4.99,
    total_amount: 29.49,
    payment_method: 'cash_on_delivery',
    payment_status: 'pending',
    status: 'Delivered',
    created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 22).toISOString(),
    items: [
      { id: 'oi-1', order_id: 'ord-101', food_item_id: 'food-1', item_name: 'Crispy Fried Chicken', unit_price: 13.0, quantity: 1, total_price: 13.0 },
      { id: 'oi-2', order_id: 'ord-101', food_item_id: 'food-2', item_name: 'Supreme Double Cheeseburger', unit_price: 11.5, quantity: 1, total_price: 11.5 },
    ]
  },
  {
    id: 'ord-102',
    order_number: 'FD-202610-8402',
    user_id: 'usr-customer',
    customer_name: 'Sarah Connor',
    customer_email: 'sarah@example.com',
    customer_phone: '+1 555 987 6543',
    delivery_address: '100 Ocean View Drive, Apt 4B',
    city: 'Los Angeles',
    zip: '90001',
    delivery_time: 'Within 30 min',
    notes: 'Leave at front lobby reception',
    subtotal: 32.5,
    delivery_fee: 0,
    total_amount: 32.5,
    payment_method: 'cash_on_delivery',
    payment_status: 'pending',
    status: 'Preparing',
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    items: [
      { id: 'oi-3', order_id: 'ord-102', food_item_id: 'food-10', item_name: 'Classic Margherita Stone Pizza', unit_price: 15.0, quantity: 1, total_price: 15.0 },
      { id: 'oi-4', order_id: 'ord-102', food_item_id: 'food-11', item_name: 'Spicy Pepperoni & Hot Honey Pizza', unit_price: 17.5, quantity: 1, total_price: 17.5 },
    ]
  }
];
