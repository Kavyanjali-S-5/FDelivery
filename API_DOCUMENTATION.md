# LC26 Food Delivery Platform - REST API Reference

The backend REST API is hosted under `/api`. All endpoints return JSON responses and standard HTTP status codes.

---

## Base URL
- Local development: `http://localhost:3000/api`
- Production: `https://<your-host>/api`

---

## Authentication Endpoints

### 1. Register User
`POST /api/auth/register`

Creates a new user profile with hashed password.

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "securepassword123",
  "fullName": "Jane Doe",
  "phone": "+1 555 987 6543",
  "address": "123 Main Street, Apt 4B",
  "city": "Springfield",
  "zip": "97477"
}
```

**Response (201 Created):**
```json
{
  "message": "Account created successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-1718000000000-ab12",
    "email": "customer@example.com",
    "full_name": "Jane Doe",
    "phone": "+1 555 987 6543",
    "address": "123 Main Street, Apt 4B",
    "city": "Springfield",
    "zip": "97477",
    "role": "customer",
    "created_at": "2026-10-10T12:00:00.000Z"
  }
}
```

---

### 2. Login User
`POST /api/auth/login`

Authenticates credentials and returns a 7-day JWT token.

**Request Body:**
```json
{
  "email": "customer@fdelivery.com",
  "password": "customer123"
}
```

**Response (200 OK):**
```json
{
  "message": "Signed in successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-customer",
    "email": "customer@fdelivery.com",
    "full_name": "John Doe",
    "role": "customer"
  }
}
```

---

### 3. Get Current User Profile
`GET /api/auth/me`
*Headers: `Authorization: Bearer <token>`*

**Response (200 OK):**
```json
{
  "user": {
    "id": "usr-customer",
    "email": "customer@fdelivery.com",
    "full_name": "John Doe",
    "phone": "+1 555 234 5678",
    "address": "742 Evergreen Terrace",
    "city": "Springfield",
    "zip": "97477",
    "role": "customer"
  }
}
```

---

### 4. Update Profile
`PUT /api/auth/profile`
*Headers: `Authorization: Bearer <token>`*

**Request Body:**
```json
{
  "full_name": "John Doe",
  "phone": "+1 555 234 5678",
  "address": "742 Evergreen Terrace",
  "city": "Springfield",
  "zip": "97477"
}
```

---

## Food Categories

### 1. List Categories
`GET /api/categories`

**Response (200 OK):**
```json
{
  "categories": [
    { "id": "cat-1", "name": "Fast Food", "slug": "fast-food", "description": "Crispy burgers and fries", "sort_order": 1 },
    { "id": "cat-2", "name": "Rice Menu", "slug": "rice-menu", "description": "Fragrant rice bowls", "sort_order": 2 },
    { "id": "cat-3", "name": "Desserts", "slug": "desserts", "description": "Sweet indulgences", "sort_order": 3 },
    { "id": "cat-4", "name": "Coffee", "slug": "coffee", "description": "Artisan coffees", "sort_order": 4 },
    { "id": "cat-5", "name": "Pizza", "slug": "pizza", "description": "Stone-baked pizzas", "sort_order": 5 }
  ]
}
```

---

## Food Items

### 1. Get Food Items
`GET /api/food-items?category=Fast%20Food&search=burger&available_only=true`

Query parameters:
- `category` (optional): Filter by category name or ID
- `search` (optional): Keyword search matching name or description
- `available_only` (optional): `true` or `false`

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "food-2",
      "category_id": "cat-1",
      "name": "Supreme Double Cheeseburger",
      "description": "Double Angus beef patties, melted sharp cheddar, caramelized onions...",
      "price": 11.5,
      "image_url": "https://...",
      "rating": 4.8,
      "is_available": true
    }
  ]
}
```

---

### 2. Create Food Item (Admin only)
`POST /api/food-items`
*Headers: `Authorization: Bearer <admin-token>`*

**Request Body:**
```json
{
  "name": "Smoked BBQ Wings",
  "category_id": "cat-1",
  "description": "Hickory-smoked chicken wings tossed in tangy Carolina BBQ sauce.",
  "price": 12.99,
  "image_url": "https://images.unsplash.com/...",
  "rating": 4.9,
  "is_available": true
}
```

---

### 3. Update Food Item (Admin only)
`PUT /api/food-items/:id`
*Headers: `Authorization: Bearer <admin-token>`*

---

### 4. Delete Food Item (Admin only)
`DELETE /api/food-items/:id`
*Headers: `Authorization: Bearer <admin-token>`*

---

## Orders Endpoints

### 1. Calculate Quote (Server-Side Price Verification)
`POST /api/orders/quote`

Validates availability and calculates trusted prices on backend.

**Request Body:**
```json
{
  "items": [
    { "food_item_id": "food-1", "quantity": 2 },
    { "food_item_id": "food-3", "quantity": 1 }
  ]
}
```

**Response (200 OK):**
```json
{
  "subtotal": 32.5,
  "delivery_fee": 4.99,
  "total_amount": 37.49,
  "is_free_delivery": false,
  "free_delivery_threshold": 50.0,
  "items": [ ... ]
}
```

---

### 2. Place Order
`POST /api/orders`
*Optional Headers: `Authorization: Bearer <token>`*

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1 555 234 5678",
  "address": "742 Evergreen Terrace",
  "city": "Springfield",
  "zip": "97477",
  "deliveryTime": "ASAP",
  "notes": "Ring doorbell",
  "items": [
    { "food_item_id": "food-1", "quantity": 2 },
    { "food_item_id": "food-3", "quantity": 1 }
  ]
}
```

**Response (201 Created):**
```json
{
  "message": "Order placed successfully!",
  "order": {
    "id": "ord-1718000000000",
    "order_number": "FD-202610-8401",
    "customer_name": "John Doe",
    "customer_email": "customer@fdelivery.com",
    "customer_phone": "+1 555 234 5678",
    "delivery_address": "742 Evergreen Terrace",
    "city": "Springfield",
    "zip": "97477",
    "subtotal": 32.5,
    "delivery_fee": 4.99,
    "total_amount": 37.49,
    "payment_method": "cash_on_delivery",
    "payment_status": "pending",
    "status": "Pending",
    "created_at": "2026-10-10T12:00:00.000Z",
    "items": [ ... ]
  }
}
```

---

### 3. Track Order
`GET /api/orders/track/:orderNumberOrId`

Retrieves real-time status and delivery progression.

---

### 4. My Orders History
`GET /api/orders/my-orders`
*Headers: `Authorization: Bearer <token>`*

---

## Admin Endpoints
*All require `Authorization: Bearer <admin-token>`*

### 1. Dashboard Statistics
`GET /api/admin/stats`

**Response:**
```json
{
  "stats": {
    "totalOrders": 14,
    "totalRevenue": 482.75,
    "pendingOrders": 3,
    "deliveredOrders": 10,
    "cancelledOrders": 1,
    "customersCount": 8,
    "foodItemsCount": 12
  }
}
```

### 2. View All Orders
`GET /api/admin/orders`

### 3. Update Order Status
`PATCH /api/admin/orders/:id/status`

**Request Body:**
```json
{
  "status": "Preparing"
}
```
*Valid Statuses:* `Pending`, `Confirmed`, `Preparing`, `Out for Delivery`, `Delivered`, `Cancelled`.

### 4. View Customers
`GET /api/admin/customers`
