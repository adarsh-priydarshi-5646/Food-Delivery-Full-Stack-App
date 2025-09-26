# Food-Delivery-MERN-Stack-App

A **full-stack food delivery application** built with **MERN stack** (MongoDB, Express.js, React.js, Node.js) to provide a seamless experience for users to order food online, track orders, and manage deliveries.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Folder Structure](#folder-structure)  
- [Screenshots](#screenshots)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Features

- User registration and authentication  
- Browse food items by category  
- Add items to cart and place orders  
- Real-time order tracking  
- Admin panel for managing restaurants, menus, and orders  
- Responsive design for web and mobile  

---

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, HTML, CSS, JavaScript  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT  
- **Other Tools:** Axios, Redux (if used), React Router  

---

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/Food-Delivery-Full-Stack-App.git
cd Food-Delivery-Full-Stack-App

npm install       # for backend
cd client
npm install       # for frontend
```

PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Folder Structure
```
Food-Delivery-Full-Stack-App/
│
├─ backend/             # Node.js & Express backend
│  ├─ controllers/
│  ├─ models/
│  ├─ routes/
│  ├─ middleware/
│  └─ server.js
│
├─ frontend/              # React frontend
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ redux/
│  │  └─ App.js
│  └─ package.json
│
├─ .env
├─ package.json
└─ README.md
```

# Contributing

1. Fork the repository

2. Create your feature branch: git checkout -b feature/YourFeature

3. Commit your changes: git commit -m 'Add some feature'

4. Push to the branch: git push origin feature/YourFeature

5. Open a Pull Request

