# The Eco - Multi-Tenant E-Commerce SaaS Platform

**The Eco** is a multi-tenant MERN stack (MongoDB, Express, React, Node) e-commerce application designed for sustainable, organic, and eco-friendly products. It features tenant-level isolation, unified authentication, Stripe payment integration in Indian Rupees (INR), and roles for Super Admins, Vendors, and Customers.

---

## 🚀 Getting Started with VS Code

Follow these instructions to configure, seed, and run the project locally using VS Code.

### 📋 Prerequisites

Make sure you have the following installed on your machine:
- **Node.js** (v16.x or newer)
- **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)
- **VS Code**

### 📦 Installation

Open the root folder in VS Code, open a terminal (Ctrl+` or `Terminal -> New Terminal`), and follow these steps:

1. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Install Client Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### ⚙️ Environment Configuration

In the `server` directory, configure your `.env` file (one is already provided by default with mock settings):
- `PORT=5000`
- `MONGODB_URI=mongodb://127.0.0.1:27017/the_eco`
- `JWT_SECRET=super_secret_jwt_key_123`
- `STRIPE_SECRET_KEY=sk_test_mock_key` (Replace with your Stripe secret key for real payments)
- `STRIPE_WEBHOOK_SECRET=` (Required for live Stripe webhook integrations)

---

## 🗄️ Database Seeding

To populate the database with the initial platform tenants (stores), products (in INR), and mock orders, run the seeding script:

```bash
cd server
npm run seed
```

This will clear existing collections and register:
- **1 Super Admin account** (for platform management)
- **4 Stores / Vendors** (Nike, Organic India, Khadi Naturals, Clay & Earth)
- **14 Products** across multiple categories with custom price variants (all in INR `₹`)
- **3 Test orders**

---

## 🏃 Running the Application

You need to run both the backend server and the frontend client concurrently.

### 1. Start the Backend API
In your first terminal:
```bash
cd server
npm run dev
```
*The server will start on [http://localhost:5000](http://localhost:5000).*

### 2. Start the Frontend Vite Server
In a second terminal (split terminal in VS Code, or open a new one):
```bash
cd client
npm run dev
```
*The client will start on [http://localhost:5173](http://localhost:5173).*

---

## 🔐 Seeded Accounts for Testing

Use the following credentials to log in and test different user dashboards:

| Account Type | Email Address | Password | Storefront Slug |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@theeco.com` | `password123` | *N/A (All-Store Dashboard)* |
| **Nike Store Vendor** | `nike@theeco.com` | `password123` | `/store/nike` |
| **Organic India Vendor** | `organic@theeco.com` | `password123` | `/store/organic-india` |
| **Khadi Naturals Vendor** | `khadi@theeco.com` | `password123` | `/store/khadi-naturals` |
| **Clay & Earth Vendor** | `clay@theeco.com` | `password123` | `/store/clay-earth` |
| **Customer 1** | `alice@theeco.com` | `password123` | *(Customer Shopping Portal)* |
| **Customer 2** | `bob@theeco.com` | `password123` | *(Customer Shopping Portal)* |

---

## 🛠️ VS Code Recommended Tips

- **Extensions**: We recommend installing the following extensions:
  - **ESLint** (to inspect syntax and styling bugs)
  - **Prettier - Code formatter** (for automatic code formatting)
  - **Thunder Client** or **REST Client** (to test HTTP requests directly from VS Code)
- **Multiterminal Setup**: You can split the VS Code terminal pane to see the Node backend logs and React hot-reload status side-by-side.
