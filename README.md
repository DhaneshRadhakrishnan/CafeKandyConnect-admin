# ☕ CaféKandy Connect — Admin Panel

> A sleek, dark-themed React dashboard for managing the CaféKandy mobile ordering platform — built with Vite, Firebase, and zero compromise on aesthetics.

---

## Overview

CaféKandy Admin is the web-based control centre for the **CaféKandy Connect** Android app. It gives café operators full visibility and control over their menu, orders, customers, and promotional content — all in real time, all from a browser.

Built as part of the HHDP II final project at **JIAT (BCU intake)**, this panel pairs directly with a Firebase-backed Android app, sharing the same Firestore database and Storage bucket.

---

## Features

| Area | What you can do |
|---|---|
| **Dashboard** | Live stats — total users, products, orders, and revenue at a glance |
| **Products** | Full CRUD with direct image upload to Firebase Storage, inline status toggle |
| **Categories** | Add and delete categories with image upload; reflects instantly in the Android app |
| **Orders** | Filter by status, view delivery location on a static map, update order status |
| **Users** | Browse all registered customers with order counts; search by name or email |
| **Promos** | Upload carousel images for the Android home screen; control display order |
| **Auth** | Admin-only access via Firebase Authentication with UID-level guard |

---

## Tech Stack

```
React 18        UI framework
Vite            Build tool & dev server
React Router v6 Client-side routing
Firebase JS SDK Firestore, Auth, Storage
CSS Modules     Component-scoped styling
```

---

## Project Structure

```
cafekandy-admin/
├── src/
│   ├── firebase.js              Firebase init — exports auth, db, storage
│   ├── App.jsx                  Router, ProtectedRoute, auth state
│   ├── index.css                Design tokens, shared utility classes
│   │
│   ├── components/
│   │   ├── Layout.jsx           Sidebar navigation with NavLink active states
│   │   ├── Layout.module.css
│   │   ├── Modal.jsx            Reusable overlay modal with ESC-to-close
│   │   ├── Modal.module.css
│   │   └── StatCard.jsx         Metric card used on Dashboard and Orders
│   │
│   ├── hooks/
│   │   └── useImageUpload.js    Firebase Storage upload hook — shared across 3 pages
│   │
│   └── pages/
│       ├── Login.jsx
│       ├── Dashboard.jsx
│       ├── Products.jsx
│       ├── Categories.jsx
│       ├── Orders.jsx
│       ├── Users.jsx
│       └── Promos.jsx
│
├── functions/
│   └── index.js                 Cloud Function — FCM push on order status change
│
├── index.html
├── vite.config.js
├── firebase.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Firestore, Authentication, and Storage enabled

### Installation

```bash
git clone https://github.com/DhaneshRadhakrishnan/cafekandy-admin.git
cd cafekandy-admin
npm install
```

### Environment

No `.env` file is required — Firebase config lives in `src/firebase.js`. Replace the config values with your own project's credentials from the Firebase Console.

```js
const firebaseConfig = {
  apiKey:            "your-api-key",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project-id",
  storageBucket:     "your-project.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId:             "your-app-id"
};
```

Then update `ADMIN_UID` in `src/App.jsx` to your admin account's Firebase UID.

### Running Locally

```bash
npm run dev
```

Runs at `http://localhost:5173`.

---

## Firebase Setup

### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id}   { allow read, write: if request.auth != null; }
    match /categories/{id} { allow read, write: if request.auth != null; }
    match /promos/{id}     { allow read, write: if request.auth != null; }
    match /orders/{id}     { allow read, write: if request.auth != null; }
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
      match /cart/{i}     { allow read, write: if request.auth.uid == uid; }
      match /wishlist/{i} { allow read, write: if request.auth.uid == uid; }
    }
  }
}
```

### Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Deploying to Firebase Hosting

```bash
npm run build

firebase login
firebase init hosting
```

When prompted:

- **Public directory:** `dist`
- **Single-page app (rewrite all URLs):** `Yes`
- **Overwrite dist/index.html:** `No`

```bash
firebase deploy --only hosting
```

### Cloud Functions (FCM Notifications)

```bash
cd functions
npm install
firebase deploy --only functions
```

The `onOrderStatusUpdate` function triggers automatically when an order document changes in Firestore and sends a push notification to the customer's device.

---

## Android Integration

This panel shares a Firestore database with the **CaféKandy Connect** Android app (`com.pyro.cafekandyconnect`). Changes made here are reflected in the mobile app immediately:

- Toggling a product's status hides or shows it in the Android category view
- Adding a promo image makes it appear in the home screen carousel
- Updating an order's status triggers a push notification to the customer via FCM
- Customer FCM tokens are stored in `users/{uid}/fcmToken` and updated automatically on each app launch

---

## Design

The UI uses an espresso-and-cream palette that mirrors the Android app's Material Design 3 theme — same colour variables, same typefaces (Space Mono + DM Sans), same surface hierarchy.

| Token | Value |
|---|---|
| `--espresso` | `#2C1810` |
| `--roast` | `#8F4C34` |
| `--cream` | `#FFB59C` |
| `--gold` | `#F5BC6F` |
| `--surface` | `#1A0F0A` |
| `--surface2` | `#26180F` |

---

## Academic Context

This project was developed as part of the **Higher National Diploma in Programming (HHDP II)** final project at the **Java Institute for Advanced Technology (JIAT)**, BCU intake.

- **Student:** Dhanesh Radhakrishnan
- **Module:** HHDP II Final Project
- **Reference:** JIAT/HHDPII/EX01
- **Android counterpart:** `com.pyro.cafekandyconnect`
- **Firebase project:** `cafe-kandy-connect`

---

## License

This project is submitted as an academic deliverable and is not licensed for commercial use.
