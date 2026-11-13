# FoodBridge – Smart Food Donation & Redistribution Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com)
[![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-Leaflet-7EBC6F.svg?style=flat&logo=openstreetmap&logoColor=white)](https://www.openstreetmap.org)

FoodBridge is a full-stack web platform connecting surplus food donors (hotels, banquet halls, restaurants, supermarkets) with verified NGOs and volunteer groups to eliminate food wastage and nourish food-insecure communities with speed, transparency, and safety.

---

## 1. Key Platform Features

- **Role-Based Portals & Dashboards**:
  - **Donor**: Create listings, specify prep time, storage condition (Ambient, Chilled, Frozen, Hot holding), upload photos, disclose allergens, review incoming claims, issue handoff OTP codes.
  - **NGO / Charity**: Real-time discovery, category & radius filtering, dual Card Grid / OpenStreetMap view, claim food batches, coordinate arrivals, verify handoffs with 6-digit OTP codes.
  - **Administrator**: Moderate food listings, verify NGO accreditations (registration numbers, daily meal capacities), audit community conduct reports, manage user accounts.
- **Strict Concurrency & Workflow Management**:
  - Database-level pessimistic locking (`with_for_update()`) prevents duplicate claims on the same donation.
  - Complete 9-stage lifecycle: `Available` &rarr; `Requested` &rarr; `Accepted` &rarr; `Ready for Pickup` &rarr; `Collected` &rarr; `Completed` (with `Rejected`, `Expired`, and `Cancelled` branches).
  - Background auto-expiry detection automatically expires overdue batches and notifies donors.
- **Food Safety & Real-World Compliance**:
  - Enforces mandatory preparation timestamps, use-by deadlines, thermal requirements, and allergen disclosures.
  - Two-factor physical handover with temperature logging (°C) and transport mode tracking.
  - Clear legal disclaimers and Good Samaritan food donor protections.
- **Real-Time Analytics & Impact**:
  - Automatically translates rescued food kilograms into meals served (1 meal ≈ 0.45 kg).
  - Calculates carbon footprint mitigation (1 kg diverted ≈ 2.5 kg CO₂ equivalent offset).

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Tailwind CSS, Lucide React, OpenStreetMap (Leaflet), Vite |
| **Backend** | Python 3.10+ / 3.15, FastAPI, Pydantic v2, Uvicorn |
| **Database** | MySQL 8.0, SQLAlchemy 2.0 ORM, PyMySQL |
| **Security** | JWT (JSON Web Tokens), BCrypt password hashing, RBAC |
| **Testing** | Postman Collection, PowerShell integration testing |

---

## 3. Pre-Configured Demo Accounts

The database comes pre-seeded with realistic production-grade demonstration data:

| Role | Organization / User | Email | Password | Status |
|---|---|---|---|---|
| **Admin** | Platform Administrator | `admin@foodbridge.org` | `admin123` | Active & Verified |
| **Donor** | Grand Horizon Hotel & Banquets | `grand.hotel@foodbridge.org` | `donor123` | Active & Verified |
| **Donor** | FreshMart Supermarket | `freshmart@foodbridge.org` | `donor123` | Active & Verified |
| **Donor** | Green Leaf Bistro & Bakery | `greenleaf.cafe@foodbridge.org` | `donor123` | Active & Verified |
| **NGO** | Hope Food Relief Foundation | `hope.foundation@foodbridge.org` | `ngo123` | Verified Partner (Cap: 350 meals/day) |
| **NGO** | Annapurna Hunger Relief Trust | `annapurna.trust@foodbridge.org` | `ngo123` | Verified Partner (Cap: 500 meals/day) |
| **NGO** | Care & Share Volunteer Alliance | `care.alliance@foodbridge.org` | `ngo123` | *Pending Admin Verification* (For testing) |

*(Quick 1-click fill buttons for these accounts are available on the web login screen)*

---

## 4. Installation & Setup Guide

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- MySQL Server 8.0+ running on port 3306

---

### Step 1: Database Setup
1. Create the MySQL database:
```sql
CREATE DATABASE IF NOT EXISTS foodbridge_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Run the database schema script:
```powershell
# Using MySQL CLI
mysql -u root -p foodbridge_db < database/schema.sql
```

---

### Step 2: Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```powershell
python -m venv venv
.\venv\Scripts\activate
```

3. Install required Python packages:
```bash
pip install -r requirements.txt
```

4. Configure your `.env` file (a `.env.example` is provided):
```env
APP_NAME="FoodBridge API"
DATABASE_URL="mysql+pymysql://root:root@localhost:3306/foodbridge_db?charset=utf8mb4"
SECRET_KEY="foodbridge-super-secret-key-change-in-production-2026-xyz-food-waste"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=10080
UPLOAD_DIR="uploads"
```

5. Seed demo accounts, active food listings, and transactions:
```powershell
python -m app.seed
```

6. Start the FastAPI backend server:
```powershell
python run.py
# Or directly via uvicorn:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now accessible at `http://127.0.0.1:8000`
Interactive Swagger Docs are available at `http://127.0.0.1:8000/docs`

---

### Step 3: Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install npm dependencies:
```bash
npm install
```

3. Start the Vite React development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

---

## 5. API Documentation & Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new donor or NGO | Public |
| `POST` | `/api/auth/login` | JWT login (returns token, role) | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Bearer Token |
| `GET` | `/api/donations` | List available donations (filters: category, status, lat/lng, radius) | Public |
| `GET` | `/api/donations/{id}` | Get donation details and coordinates | Public |
| `POST` | `/api/donations` | Create a food donation listing | Donor / Admin |
| `POST` | `/api/donations/{id}/upload-image` | Upload food photo | Donor / Admin |
| `POST` | `/api/donations/{id}/request` | Claim/request a donation batch | Verified NGO / Admin |
| `POST` | `/api/requests/{id}/decision` | Accept or decline request (generates OTP) | Donor / Admin |
| `POST` | `/api/collections/{id}/ready` | Mark food packed & ready for pickup | Donor / Admin |
| `POST` | `/api/collections/{id}/verify-handoff` | Verify 6-digit OTP & temperature handoff | Donor / NGO / Admin |
| `GET` | `/api/notifications` | User notifications & live alerts | Bearer Token |
| `POST` | `/api/feedback` | Rate donation experience (1-5 stars) | Donor / NGO |
| `POST` | `/api/reports` | Flag a food safety or hygiene issue | Authenticated |
| `GET` | `/api/admin/users` | Directory of donors and NGOs | Admin only |
| `PUT` | `/api/admin/ngos/{id}/verify` | Approve or reject NGO registration | Admin only |
| `GET` | `/api/analytics/overview` | Platform-wide meals and CO₂ impact | Public |

---

## 6. Testing with Postman

A comprehensive Postman collection is included in:
`postman/FoodBridge_API.postman_collection.json`

### To Import:
1. Open Postman.
2. Click **Import** and select `postman/FoodBridge_API.postman_collection.json`.
3. Set the `baseUrl` variable to `http://127.0.0.1:8000`.
4. Execute `Login - Admin` or `Login - Hotel Donor` to acquire a JWT token.
5. Set the collection's `authToken` variable to run authenticated endpoints.

---

## 7. Project Structure

```
FoodBridge/
├── backend/
│   ├── app/
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── schemas/           # Pydantic validation schemas
│   │   ├── services/          # Concurrency, OTP generation, analytics
│   │   ├── routers/           # REST API endpoints
│   │   ├── config.py          # Application configuration
│   │   ├── database.py        # Database engine & session
│   │   ├── main.py            # FastAPI entry point & CORS
│   │   └── seed.py            # Realistic demo seed data
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── api/client.js      # Axios client & endpoints
│   │   ├── context/           # Auth and Live Notification contexts
│   │   ├── components/        # Map, cards, badges, modals, navbar, footer
│   │   ├── pages/             # Home, Dashboards, Discovery, Tracking, Details
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── database/
│   └── schema.sql             # Raw MySQL 8.0 DDL schema
├── postman/
│   └── FoodBridge_API.postman_collection.json
└── README.md
```

---

## 8. License & Sustainability Mission

FoodBridge is developed as an open initiative to empower local communities, support non-profit charity partners, and eliminate commercial food waste.

