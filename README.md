# 🍳 Culinary Blog - Gourmet Recipes & Instant Push Alert Platform

A full-featured, modern web application for discovering, creating, and publishing authentic gourmet culinary recipes with category filtering, full-text ingredient search, responsive kitchen cooking focus mode, and a **real-time instant push notification engine that alerts subscribers the moment a new dish is published**.

Built with a warm beige, ceramic brown, and espresso color palette in strict adherence to software requirements standards (**IEEE 830 / ISO/IEC/IEEE 29148:2018**).

---

## 🛠️ Technology Stack

### Frontend & Core
- **Framework & Runtime**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/) (Sub-second cold start & optimized bundling)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: [Lora](https://fonts.google.com/specimen/Lora) & [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)

### Real-Time & Notification Engine
- **Web Push API**: Native operating system screen popups sent directly to users even when the app is in the background.
- **BroadcastChannel API**: Sub-85ms cross-tab real-time dispatch synchronization (`culinary_blog_broadcast_push_v2`).
- **Web Audio API**: Real-time harmonic synthesizer that plays a soothing crystalline chime when new recipes are broadcast and kitchen timer chimes.
- **Micro-Interactions**: Celebratory [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) upon recipe publication.

### Data & Persistence
- **Client Storage**: HTML5 LocalStorage persistence for recipes, categories, push dispatch logs, and subscriber devices.
- **Structured Data (SEO)**: `Schema.org/Recipe` (JSON-LD) format embedded for Google Rich Recipe cards.

---

## 🔥 Key Features

### 1. Instant Push Notification Engine
- **Automatic Broadcast on Publish**: Whenever an author or admin marks a recipe as **Published**, the notification engine automatically broadcasts an instant push alert and plays a chime to all active subscribers.
- **Push Dispatch Hub (Broadcaster)**: Dedicated modal console for authors and admins to compose custom alerts, select recipes, configure audience segments (All Subscribers, Mains Lovers, Vegetarian, Desserts), and set priority levels (Hot & Urgent vs Standard).
- **Interactive Live Toast**: Animated slide-down notification banner in the bottom-right corner with recipe thumbnail and instant *"View Recipe"* navigation.
- **Multi-Device & Permission Manager**: Easily grant browser notifications, test audio chimes, and inspect connected devices in the Push Management center.

### 2. Recipe Catalog & Management (FR-RCP & FR-CAT)
- **Smart Search & Filters**: Search across recipe titles, descriptions, and ingredients simultaneously. Filter by category, preparation time (≤ 15m, ≤ 30m, ≤ 60m), and difficulty.
- **Interactive Portion Scaler**: Dynamically scales ingredient amounts when switching from 2 servings to 4 or 8 servings.
- **Ingredient Checklist**: Interactive preparation checklist for home cooks to mark ready ingredients before starting.
- **Nutrition Facts Card**: Detailed nutritional breakdown (Calories, Protein, Carbohydrates, Fat, Dietary Fiber, Sodium).

### 3. Kitchen Focus Mode
- Full-screen distraction-free cooking assistant with high-contrast, large-format typography designed for tablets and mobile in the kitchen.
- Step-by-step guidance with **independent countdown timers**, audio completion alerts, and step completion checklists.

### 4. Multi-Role User Access (RBAC)
- Switch roles instantly in the top navigation bar:
  - 👤 **Guest**: Explore public recipes, use step timers, receive push alerts, and bookmark favorites.
  - 👨‍🍳 **Author (Chef Linh Dan)**: Draft, edit, publish personal recipes, and broadcast alerts.
  - 🛡️ **Administrator (Master Chef Hoang Nam)**: Manage all recipes across the system, create categories, and inspect system telemetry.

---

## 🚀 How to Run the Application (Setup & Quickstart)

> **Important**: This project runs entirely via **Node.js** with **Vite** and **React** (there is no separate .NET backend directory required; all APIs and state engines are self-contained).

### Prerequisites:
- [Node.js](https://nodejs.org/) installed (v18, v20, or v22 LTS recommended).

### Steps to Run:

1. **Open the project root directory in your Terminal / PowerShell / Command Prompt:**
   ```bash
   cd culinary-blog
   ```
   *(Ensure you are in the directory containing `package.json`)*

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Open the URL displayed in the terminal:
   ```text
   http://localhost:3000
   ```
   *(or the port indicated by Vite)*

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```text
├── index.html                  # HTML entry point with Google Fonts & SEO meta tags
├── package.json                # Project dependencies & scripts (npm run dev, build)
├── vite.config.ts              # Vite bundler & path alias configuration
├── tsconfig.json               # TypeScript configuration
├── README.md                   # Documentation and quickstart guide
└── src/
    ├── main.tsx                # React DOM root entry point
    ├── App.tsx                 # Core app state orchestrator & navigation
    ├── index.css               # Global Tailwind CSS styling and theme setup
    ├── types/
    │   └── index.ts            # Type definitions (Recipe, Category, User, PushNotification)
    ├── utils/
    │   └── textUtils.ts        # Slug generation, time formatters, unaccent helpers
    ├── services/
    │   ├── soundEffects.ts     # Web Audio API harmonic sound synthesizers
    │   └── pushNotificationService.ts # Web Push API & BroadcastChannel engine
    ├── data/
    │   └── mockData.ts         # Initial gourmet recipes, categories & subscribers
    ├── assets/images/          # High-resolution culinary food photography
    └── components/
        ├── Header.tsx                 # Top navigation bar, role switcher & notification icon
        ├── HeroSection.tsx            # Magazine hero banner, search bar & category filters
        ├── RecipeCard.tsx             # Recipe card with badges & cooking time
        ├── RecipeDetailModal.tsx      # Comprehensive recipe detail modal & portion scaler
        ├── RecipeEditorModal.tsx      # Recipe creation & editing wizard
        ├── CookingFocusMode.tsx       # Distraction-free kitchen cooking mode with timers
        ├── PushBroadcastModal.tsx     # Dispatch console to send instant alerts to subscribers
        ├── PushNotificationDrawer.tsx # Slide-over notification inbox with audio toggle
        ├── PushManagementView.tsx     # Telemetry dashboard & subscriber devices log
        ├── CategoriesView.tsx         # Culinary collection browsing & category creator
        ├── MyRecipesView.tsx          # Chef's kitchen management studio
        ├── LivePushToast.tsx          # Real-time animated notification banner toast
        └── Footer.tsx                 # Footer with specs & quick links
```

---

## 📝 License
Distributed under the **Apache-2.0 License**.
