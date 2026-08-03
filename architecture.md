
# EVAN COLLECTIONS – System Architecture Document

**Version:** 1.0  
**Project:** EVAN COLLECTIONS – Luxury Saree E-Commerce Platform

---

# 1. Architecture Overview

The platform follows a modern three-tier architecture with a React frontend, Node.js/Express backend, MongoDB database, and cloud services for storage, payments, shipping, and analytics.

---

# 2. High-Level Architecture

```text
Customers (Web / Mobile Browser)
            │
            ▼
      Cloudflare CDN
            │
            ▼
 React + Vite Frontend (Vercel)
            │
        HTTPS / REST API
            │
            ▼
 Node.js + Express Backend (Render)
            │
 ┌──────────┼──────────┬──────────┬──────────┐
 ▼          ▼          ▼          ▼          ▼
MongoDB  Cloudinary Razorpay Shiprocket Firebase
 Atlas     Images    Payment   Shipping  Push
```

---

# 3. Architecture Principles

- Modular architecture
- API-first development
- Responsive UI
- Stateless backend
- Secure by default
- Cloud-native deployment
- Horizontal scalability
- High availability

---

# 4. Frontend Architecture

## Technology
- React
- Vite
- TypeScript
- Tailwind CSS
- Redux Toolkit
- React Router
- Axios

## Folder Structure

```text
src/
 ├── assets/
 ├── components/
 ├── layouts/
 ├── pages/
 ├── hooks/
 ├── redux/
 ├── services/
 ├── routes/
 ├── utils/
 └── App.tsx
```

Responsibilities:
- UI rendering
- Client routing
- State management
- Form validation
- API communication
- Authentication handling

---

# 5. Backend Architecture

## Technology
- Node.js
- Express.js
- TypeScript
- Mongoose

## Folder Structure

```text
server/
 ├── routes/
 ├── controllers/
 ├── services/
 ├── repositories/
 ├── middlewares/
 ├── validators/
 ├── models/
 ├── config/
 ├── utils/
 └── tests/
```

Responsibilities:
- Business logic
- Authentication
- Payment verification
- Inventory management
- Notifications
- Reporting

---

# 6. Database Architecture

Collections:
- Users
- Products
- Categories
- Orders
- OrderItems
- Reviews
- Coupons
- Cart
- Wishlist
- Addresses
- Payments
- Notifications

Relationship Overview

```text
Users
 ├── Addresses
 ├── Wishlist
 ├── Cart
 └── Orders
         │
         ▼
    Order Items
         │
         ▼
      Products
         │
   Categories
         │
      Reviews
```

---

# 7. API Architecture

Authentication
- POST /api/auth/register
- POST /api/auth/login

Products
- GET /api/products
- GET /api/products/:id
- POST /api/products

Orders
- POST /api/orders
- GET /api/orders/:id

Customers
- GET /api/profile
- PUT /api/profile

---

# 8. Authentication Flow

```text
Register/Login
      │
      ▼
JWT Access Token
      │
      ▼
Protected API
      │
      ▼
Role Verification
```

Roles:
- Customer
- Admin
- Super Admin

---

# 9. Payment Architecture

```text
Cart
 │
 ▼
Checkout
 │
 ▼
Razorpay Order
 │
 ▼
Payment
 │
 ▼
Webhook Verification
 │
 ▼
Order Confirmation
```

---

# 10. Order Processing

```text
Browse
→ Cart
→ Checkout
→ Payment
→ Order Creation
→ Inventory Update
→ Shipping Request
→ Delivery
→ Review
```

---

# 11. Security Architecture

- HTTPS
- JWT
- bcrypt password hashing
- Helmet
- Rate limiting
- CSRF protection
- XSS prevention
- Input validation
- Audit logging

---

# 12. Performance Architecture

- CDN
- Lazy loading
- Image optimization
- Pagination
- Code splitting
- MongoDB indexes
- Browser caching

Targets:
- Page Load < 2 sec
- API Response < 300 ms
- Lighthouse > 90

---

# 13. Integrations

- Cloudinary
- Razorpay
- Shiprocket
- Google Analytics
- Meta Pixel
- Firebase Cloud Messaging

---

# 14. DevOps Architecture

```text
Developer
   │
GitHub Repository
   │
GitHub Actions (CI/CD)
   ├───────────────┐
   ▼               ▼
Vercel         Render
   │               │
   └──────┬────────┘
          ▼
    MongoDB Atlas
```

---

# 15. Scalability

- Stateless APIs
- Load balancer ready
- Horizontal scaling
- CDN caching
- Database indexing
- Queue-ready architecture

---

# 16. Monitoring

- Winston/Pino logs
- Health checks
- Error tracking
- Uptime monitoring
- Daily backups

---

# 17. Future Architecture

- Microservices
- Redis cache
- Elasticsearch
- AI recommendation engine
- Event queues
- Mobile API gateway

---

# 18. Architecture Summary

| Layer | Technology |
|--------|------------|
| Frontend | React + Vite + Tailwind |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Authentication | JWT + OAuth |
| Storage | Cloudinary |
| Payments | Razorpay |
| Shipping | Shiprocket |
| Hosting | Vercel + Render |
| Analytics | Google Analytics + Meta Pixel |
| Notifications | Firebase |

This architecture provides a secure, scalable, cloud-native foundation for EVAN COLLECTIONS and supports future expansion to mobile apps, AI-powered features, and multi-vendor commerce.
