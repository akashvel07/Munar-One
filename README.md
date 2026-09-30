# 🏍️ Munnar Trip (Munnar One)

> Premium Collaborative Motorcycle Trip Management & Navigation Command Center for **Akash** & **Vinoth**.

[![Trip Dates](https://img.shields.io/badge/Dates-Oct%202--4%2C%202026-forest?style=flat-square)](https://github.com/akashvel07/Munar-One)
[![Duration](https://img.shields.io/badge/Duration-3%20Days-green?style=flat-square)](https://github.com/akashvel07/Munar-One)
[![Total Budget](https://img.shields.io/badge/Budget-%E2%82%B910%2C000-earth?style=flat-square)](https://github.com/akashvel07/Munar-One)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20TypeScript%20%7C%20Supabase-blue?style=flat-square)](https://github.com/akashvel07/Munar-One)

---

## 🌟 Key Features

- **📱 Mobile-First Biker UI**: Dark forest-green tactile theme designed for glove use and outdoor visibility.
- **🧭 Live Ride Mode**: Real-time GPS speedometer (km/h), live barometric altitude meter (m), heading compass, distance tracking, and route recorder.
- **🗺️ Interactive Map & 26 Munnar Places**: Complete catalogue of top viewpoints, tea estates, dams, and mountain passes with direct Google Maps navigation launchers.
- **🏔️ Treks & Waterfalls Guides**: Curated guides for Meesapulimala, Rajamala / Eravikulam National Park, Attukad, and Lakkam Falls with safety notices.
- **🍛 Kerala Food & Eateries**: Authentic local recommendations (Kerala Sadya, Appam & Stew, Puttu Kadala, Karimeen Pollichathu, Pazham Pori) and curated dining spots.
- **⛽ Petrol Station Finder**: Track verified petrol pumps in Munnar town and Marayoor with fuel level warnings before climbing remote ghat roads.
- **💰 ₹10,000 Shared Budget & Expense Splitter**: Real-time split tracker between **Akash** and **Vinoth** across Fuel (₹3,000), Stay (₹3,500), Food (₹2,000), and Emergency/Other (₹1,500).
- **🏍️ Motorcycle & Fuel Manager**: Pre-configured for KTM Duke 200 (13.4L tank) with odometer logs, fill-up history, and real mountain mileage calculator.
- **📅 3-Day Dynamic Itinerary**: Day-by-day timeline with time slots, completion checkboxes, and quick place links.
- **🎒 Pre-Ride Checklist**: Essential safety checks for bike, riding gear, documents (RC, DL, PUC, Insurance), and emergency kit.
- **🚨 Emergency Center**: One-tap SOS call triggers for Kerala Police, Ambulance, Forest Dept, Towing, and nearby hospitals.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom CSS Design System
- **State & Data**: Zustand + TanStack Query (React Query)
- **Database & Auth**: Supabase (PostgreSQL with Realtime WebSockets & Row Level Security)
- **Icons & Motion**: Lucide React + Framer Motion
- **Charts**: Recharts (for altitude profiles and mileage trends)
- **Maps**: Leaflet + React-Leaflet + OpenStreetMap

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/akashvel07/Munar-One.git
cd Munar-One
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file based on `.env.example`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_WEATHER_API_KEY=your-openweathermap-key
VITE_APP_NAME="Munnar Trip"
VITE_TRIP_ID=1
```

### 4. Database Setup
1. Open your **Supabase Dashboard** → **SQL Editor**.
2. Run the script in `supabase/schema.sql` (all-in-one master schema and seed file).

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser (or on your mobile phone on the same Wi-Fi).

---

## 👥 Riders
- **Akash** (Trip Lead)
- **Vinoth** (Co-Rider)
