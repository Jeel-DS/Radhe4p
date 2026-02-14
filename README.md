# Radhe 4P - Diamond Management System

A production-ready web application for managing diamond processing operations with role-based access control, work request tracking, pricing management, and comprehensive reporting.

## 🚀 Features

### Manager Module
- ✅ Approve/reject worker requests with custom pricing
- 💎 Manage dealers and diamond types
- 💰 Configure dealer-wise diamond prices
- 💵 Give advances to workers
- 📊 View comprehensive analytics
- 📥 Download detailed Excel reports

### Worker Module
- 📝 Submit daily work requests
- 💰 View earnings after approval
- 💵 Track advances received
- 📥 Download Excel reports (daily/monthly/yearly)

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **bcryptjs** for password hashing
- **ExcelJS** for report generation

### Frontend
- **React.js** with Vite
- **React Router** for navigation
- **Axios** for API calls
- Modern CSS with gradients and animations

## 📁 Project Structure

```
Radhe4p/
├── backend/
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Authentication middleware
│   ├── utils/            # Excel generator & seeding
│   ├── server.js         # Express server
│   ├── .env              # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Page components
    │   ├── context/      # Auth context
    │   ├── services/     # API service
    │   ├── App.jsx       # Main app component
    │   └── App.css       # Global styles
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or remote connection)

### 1. Clone and Navigate
```bash
cd Radhe4p
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Edit `.env` file if needed:
```env
MONGODB_URI=mongodb://localhost:27017/radhe4p
JWT_SECRET=radhe4p_super_secret_key_change_in_production
PORT=5000
```

Seed the database with sample data:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🔐 Default Credentials

After seeding the database, use these credentials:

**Manager Account:**
- Email: `manager@radhe4p.com`
- Password: `manager123`

**Worker Account:**
- Email: `worker@radhe4p.com`
- Password: `worker123`

**Additional Worker:**
- Email: `priya@radhe4p.com`
- Password: `worker123`

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (manager only)
- `GET /api/auth/me` - Get current user

### Worker Endpoints
- `POST /api/worker/work-request` - Submit work request
- `GET /api/worker/earnings` - View approved earnings
- `GET /api/worker/advances` - View advances
- `GET /api/worker/dealers` - Get active dealers
- `GET /api/worker/diamond-types` - Get active diamond types
- `GET /api/worker/report` - Download Excel report

### Manager Endpoints
- `GET /api/manager/pending-requests` - Get pending work requests
- `PUT /api/manager/approve-request/:id` - Approve/reject request
- `GET /api/manager/dealers` - Get all dealers
- `POST /api/manager/dealers` - Create dealer
- `PUT /api/manager/dealers/:id` - Update dealer
- `GET /api/manager/diamond-types` - Get all diamond types
- `POST /api/manager/diamond-types` - Create diamond type
- `GET /api/manager/prices` - Get all prices
- `POST /api/manager/prices` - Set/update price
- `POST /api/manager/advances` - Give advance to worker
- `GET /api/manager/workers` - Get all workers
- `GET /api/manager/analytics` - Get analytics data
- `GET /api/manager/report` - Download Excel report

## 🎨 Features Highlights

- **Beautiful UI**: Modern gradient design with smooth animations
- **Role-based Access**: Separate dashboards for managers and workers
- **Real-time Updates**: Immediate reflection of data changes
- **Excel Reports**: Download detailed reports with formatting
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Secure Authentication**: JWT-based auth with token persistence

## 📊 Database Schema

- **Users**: Manager and worker accounts
- **Dealers**: Diamond suppliers
- **DiamondTypes**: Categories of diamonds
- **DiamondPrices**: Dealer-wise pricing configuration
- **WorkRequests**: Worker submissions with approval workflow
- **Advances**: Money given to workers

## 🔧 Development Commands

### Backend
```bash
npm run dev     # Start dev server with nodemon
npm start       # Start production server
npm run seed    # Seed database with sample data
```

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🚀 Deployment

### Backend
1. Set environment variables on your hosting platform
2. Ensure MongoDB is accessible
3. Run `npm install` and `npm start`

### Frontend
1. Build: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure API proxy or update base URL

## 📝 License

MIT License - feel free to use this project for your needs.

## 👨‍💻 Support

For any issues or questions, please contact the development team.

---

Built with ❤️ for Radhe 4P Diamond Processing
