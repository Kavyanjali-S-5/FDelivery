# FDelivery - LC26 Food Delivery Full-Stack Platform

A complete, production-grade full-stack food delivery application built with Node.js, Express, Supabase PostgreSQL, and modern responsive frontend architecture.

This project preserves 100% of the original **LC26 Food Delivery Website** design, visual aesthetics, color palette (`#f94a3d`), layout, typography, and branding while transforming it into a robust, real-time e-commerce food delivery platform with persistent data storage, secure authentication, atomic checkout, and admin management.

---

## 🚀 Key Features

### 🛒 Customer Features
1. **Browse Food Items**: High-resolution gallery of chef specials across categories.
2. **Category Navigation**: Filter by Fast Food, Rice Menu, Desserts, Coffee, Pizza, and See All.
3. **Instant Search**: Real-time keyword filtering across names and descriptions.
4. **Food Details Modal**: View ingredient notes, dietary tags, ratings, and custom quantity selector.
5. **Interactive Sliding Cart Drawer**:
   - Increment / decrement item quantities.
   - Remove cart items.
   - Live subtotal and free delivery threshold indicator (Free home delivery on orders over $50).
6. **Checkout & Order Placement**:
   - Matches original `order.html` structure.
   - Delivery details: Name, phone, street address, city, ZIP, preferred delivery time, special instructions.
   - Automatic pre-fill for logged-in customers.
   - **Cash on Delivery (COD)** payment processing.
7. **Unique Order Generation**: Generates official formatted tracking numbers (e.g. `FD-202610-8401`).
8. **Live Visual Order Tracking**:
   - Multi-step timeline: `Pending` ➔ `Confirmed` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered` (or `Cancelled`).
   - Real-time order refresh.
9. **Customer Profile & Order History**:
   - View past orders and jump straight into live tracking.
   - Edit delivery address and contact information.

---

### 🛡️ Admin Dashboard (`admin.html` / Admin Panel)
1. **Secure Admin Authentication**: Protected routes with token verification and role authorization.
2. **Real Database Analytics**:
   - Total Orders count
   - Real-time Revenue calculation ($)
   - Active Pending / Preparing orders count
   - Completed Delivered orders count
3. **Order Management**:
   - View full customer details, phone, and delivery destination.
   - Live status transition dropdown with state machine validation.
4. **Menu Management**:
   - Add new food items with custom title, price, category, image URL, and description.
   - Toggle item availability (`In Stock` / `Unavailable`).
   - Remove obsolete food items.
5. **Customer Roster**:
   - View customer name, email, phone, city, total order count, and lifetime spend.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + TypeScript + Vite, Boxicons, Tailwind CSS, Vanilla styling |
| **Backend** | Node.js, Express.js (REST API architecture) |
| **Database** | Supabase PostgreSQL + Dual-Mode Embedded Relational fallback |
| **Authentication**| JWT (JSON Web Tokens), `bcryptjs` password hashing |
| **Security** | Server-side price calculation, parameterized database queries, role verification |

---

## 🏗️ Architecture & Frontend Migration Note

The original template was built with static HTML, CSS, and vanilla JavaScript. In this full-stack implementation:
- **Preserved Design**: Every CSS rule, class name, layout grid, typography choice, color code (`#f94a3d`), and UI asset from the original `lc26-food-delivery-website` has been strictly preserved.
- **Why React**: To provide seamless reactivity between the shopping cart, checkout, live order tracking stepper, profile modal, and admin operations without clunky full-page reloads or localStorage desync errors.
- **Multi-Mode**: Both the unified full-stack application and the pure standalone `supabase-schema.sql` are provided for direct flexibility.

---

## 🔑 Pre-Configured Demo Credentials

For quick evaluation without manual registration:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@fdelivery.com` | `admin123` |
| **Customer** | `customer@fdelivery.com` | `customer123` |

*(Quick-fill buttons are also available directly on the Sign In modal!)*

---

## 🗄️ Supabase PostgreSQL Setup

1. Create a project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open `supabase-schema.sql` from this repository, copy its contents, paste them into the SQL Editor, and click **Run**.
4. Navigate to **Project Settings > API** in your Supabase dashboard.
5. Copy your **Project URL**, **Anon Key**, and **Service Role Key** into `.env`:
   ```bash
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ADMIN_EMAILS="admin@fdelivery.com"
   ```

*Note: If no external Supabase credentials are configured, the backend automatically operates using its built-in relational database layer with the identical tables, constraints, foreign keys, and seed data!*

---

## 📧 Email Notification Service Setup

Whenever a user successfully logs in, a login security confirmation email is automatically dispatched containing:
- Customer name
- Exact login date
- Exact login time & time zone
- IP address & client info
- Security advisory

### Configuring Real SMTP Provider in `.env`:

```env
# Gmail SMTP (using App Password from Google Account Security)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-character-app-password"
SMTP_FROM='"FDelivery Security" <your-email@gmail.com>'
```

```env
# SendGrid / Brevo / Resend / Mailgun
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="apikey"
SMTP_PASS="your-api-key"
SMTP_FROM='"FDelivery Security" <verified-sender@yourdomain.com>'
```

*Note: If SMTP variables are not configured in your environment, the system automatically uses an Ethereal testing transporter so logins never fail and generated test message preview links are logged to the console.*

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Start the Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

---

## 🧪 Testing Instructions

1. **Storefront & Menu**:
   - Click category filter pills (*Fast Food*, *Pizza*, *Rice Menu*). Observe instant menu filtering.
   - Type in the search box (e.g. `Chicken` or `Pizza`). Observe real-time search.
   - Click any dish to open the **Food Details Modal**.
2. **Cart & Calculations**:
   - Click **Add To Cart +** on 2 or more dishes.
   - Open the Cart drawer. Adjust quantities. Observe the subtotal update and free delivery threshold banner.
3. **Checkout & Order Creation**:
   - Click **Proceed to Checkout**.
   - Fill in first name, phone, delivery address, city, and ZIP.
   - Click **Place Order**. Observe instant order creation and unique Order ID generation (`FD-202610-XXXX`).
4. **Order Tracking**:
   - Click **Track Live Status** or navigate to **Track Order** from the top menu.
   - Enter your Order ID. Watch the step timeline progress.
5. **Admin Operations**:
   - Click **Admin Dashboard** in the footer.
   - Sign in as `admin@fdelivery.com` / `admin123`.
   - View live overview metrics (revenue, orders, pending).
   - In **Orders**, update an order status from `Pending` to `Preparing` or `Delivered`.
   - In **Menu Management**, add a new dish and verify that it appears instantly in the customer storefront.
