# 🎆 MOHANA PYRO PARK - Crackers Shop Management System

A full-stack MERN application for managing a crackers shop with customer purchasing, order tracking, inventory management, and analytics.

## 🚀 Features

### Customer Features
- 🛒 Browse and search products by category, price, and safety level
- 🛍️ Shopping cart with quantity management
- 📦 Order placement with delivery or store pickup options
- 📋 Order tracking and history
- 👤 User profile management

### Admin Features
- 📊 Dashboard with key metrics and charts
- 📦 Order management with status updates
- 📈 Inventory management with stock adjustments
- 🏷️ Product CRUD operations
- 📉 Analytics with revenue, sales, and customer insights
- 👥 User management with role-based access

### User Roles
1. **Customer** - Can browse products, place orders, track orders
2. **Staff** - Can view/update orders, view inventory
3. **Manager** - Full access except user management
4. **Owner** - Full access to all features

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS
- React Query (TanStack Query)
- Zustand (State Management)
- React Router DOM
- Recharts
- Lucide Icons
- React Hot Toast

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs

## 📋 Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas)
- npm or yarn

## ⚙️ Installation

### 1. Clone the repository
```bash
cd mohana-pyro-park
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://akilak23cse_db_user:hRKuM2xtjGW26HgW@cluster0.ododkjk.mongodb.net/mohana_pyro_park?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=30d
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend folder (optional):
```env
VITE_API_URL=/api
```

### 4. Seed the Database
```bash
cd ../backend
npm run seed
```

This will create:
- Categories for different cracker types
- 50+ products
- Demo users (customer, staff, manager, owner)
- 2 years of realistic order data with festival spikes

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start backend (serves static files)
cd ../backend
npm start
```

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@mohanapyro.com | password123 |
| Manager | manager@mohanapyro.com | password123 |
| Staff | staff@mohanapyro.com | password123 |
| Customer | customer@mohanapyro.com | password123 |

## 📁 Project Structure

```
mohana-pyro-park/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   ├── inventoryController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── error.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── InventoryLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── userRoutes.js
│   ├── seed/
│   │   └── seedData.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── customer/
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   └── CustomerLayout.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   └── customer/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── store/
│   │   │   └── index.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## 🎨 Theme Colors

- **Primary**: Pink/Magenta (#ec4899)
- **Secondary**: Purple (#a855f7)
- Light theme with gradient accents

## 📊 Festival Data

The seed script generates realistic data with festival spikes:
- **Diwali** (Oct-Nov): 8-15x normal sales
- **New Year** (Dec-Jan): 3-6x normal sales
- **Pongal** (Jan): 2-4x normal sales

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Input validation

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

**MOHANA PYRO PARK** - Light up your celebrations! 🎆✨
