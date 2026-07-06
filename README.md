# 🚦 TrafficFlow: Smart Traffic Management System for Urban Congestion

[![Live Demo](https://img.shields.io/badge/Demo-Live_Deployment-brightgreen?style=for-the-badge&logo=vercel&logoColor=white)](https://traffic-flow-peach.vercel.app)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Video_Presentation-red?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/lBdHk5jTqNU?si=ZhTVLD5dn_nVc4cM)
[![SIH 2025](https://img.shields.io/badge/Smart_India_Hackathon-2025-blue?style=for-the-badge&logo=smartthings&logoColor=white)](#-smart-india-hackathon-sih-2025-details)
[![Tech Stack](https://img.shields.io/badge/Stack-Next.js_|_Express_|_YOLO-orange?style=for-the-badge)](#-tech-stack)

Our project, **TrafficFlow**, tackles one of the biggest urban challenges: **traffic congestion and emergency vehicle dispatching**. It is an interactive, AI-driven smart traffic management solution designed to replace inflexible fixed-timing traffic signals with real-time adaptive optimization, computer vision analysis, and automatic emergency overrides.

---

## 📁 Project Structure

```
trafficflow/
├── backend/                  # Express.js API Server
│   ├── data/
│   │   └── store.js          # In-memory data store
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js           # Signup, Login, Get User
│   │   ├── traffic.js        # Traffic scans & statistics
│   │   ├── dispatch.js       # Dispatch & light control logs
│   │   └── incidents.js      # Incident management
│   ├── server.js             # Express entry point
│   ├── package.json
│   └── .env
├── frontend/                 # Next.js Dashboard & UI
│   ├── src/
│   │   ├── ai/               # YoLo model
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utilities, stores, API client
│   ├── public/               # Static assets
│   ├── package.json
│   └── .env
├── package.json              # Root package (concurrently)
└── README.md
```

---

## 🛠️ Getting Started (Local Development)

### Prerequisites
* Node.js v18+
* npm v9+

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/monkeysoul-cmd/traffic-flow.git
   cd traffic-flow
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```
   Or install them separately:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Start both servers (recommended):**
   ```bash
   npm run dev
   ```
   This starts:
   - **Backend** → `http://localhost:5000` (Express API)
   - **Frontend** → `http://localhost:9002` (Next.js Dashboard)

4. **Or run them individually:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **(Optional) Run Genkit Developer UI:**
   ```bash
   cd frontend && npm run genkit:dev
   ```

### Default Login Credentials
| Email | Password |
| :--- | :--- |
| `admin@trafficflow.com` | `password` |

---

## 🔌 Backend API Reference

Base URL: `http://localhost:5000`

### Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login & get JWT token | ❌ |
| `GET` | `/api/auth/me` | Get current user profile | ✅ |

### Traffic
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/traffic/scans` | Get all traffic scan records | ✅ |
| `POST` | `/api/traffic/scans` | Save a new traffic scan | ✅ |
| `GET` | `/api/traffic/stats` | Get aggregated statistics | ✅ |

### Dispatch & Light Control
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dispatch/logs` | Get dispatch logs | ✅ |
| `POST` | `/api/dispatch/logs` | Create dispatch log | ✅ |
| `GET` | `/api/dispatch/light-control` | Get light control history | ✅ |
| `POST` | `/api/dispatch/light-control` | Log light control action | ✅ |

### Incidents
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/incidents` | List all incidents | ✅ |
| `POST` | `/api/incidents` | Create a new incident | ✅ |

### Health Check
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Check if the API is running |

> **Note:** For authenticated endpoints, include the JWT token in the `Authorization` header as `Bearer <token>`.

---

## ⚠️ The Problem: Smart Traffic Management System for Urban Congestion

Traditional urban infrastructure is struggling to keep pace with rapid urbanization, resulting in severe bottlenecks and inefficiencies:
* ⏳ **Fixed-Timing Signals:** Inflexible, pre-programmed traffic schedules that do not adapt to real-time lane demands.
* 🚗 **Severe Congestion:** Overcrowded roads leading to extensive delays, vehicle bunching, and frustration.
* 🧠 **Lack of Intelligence:** Total absence of smart, automated control systems capable of learning and responding to traffic patterns.
* 🔀 **No Dynamic Re-routing:** Inability to adapt to real-time conditions, road construction, or sudden incidents.
* 🌿 **Environmental Impact:** High carbon footprint, CO2, NOx, and PM2.5 emissions due to unnecessary vehicle idling.
* 👁️ **Poor Visibility:** Limited oversight and tracking metrics for municipal authorities and traffic personnel.
* 📉 **Economic Losses:** High financial setbacks for logistics and commuters due to time and fuel wastage.

---

## 🚀 How It Works (Key Innovations)

The system is split into three core pillars:

1. **🧠 Adaptive Traffic Light Controller (TLC)**
   * **RL (DQN) Model:** Utilizing Deep Q-Networks (DQN) reinforcement learning, the system dynamically adjusts green/red light times based on real-time vehicle queues, cutting commute times and average wait times.
2. **📡 IoT-Based Emergency Vehicle Override (EVSO)**
   * **Priority Routing:** Integrated ESP32 hardware/simulation automatically overrides traffic signals to give green lights to approaching ambulances and emergency vehicles, securing a collision-free corridor.
3. **💻 Web Platform & Dashboard**
   * **Command Center:** A fully functional, responsive admin website built for city authorities featuring live traffic analysis, video feed integrations, emergency dispatching, and manual signal controls.

---

## 🏅 Smart India Hackathon (SIH) 2025 Details

| Metric | Information |
| :--- | :--- |
| **Problem Statement ID** | 25050 |
| **Problem Statement Title** | Smart Traffic Management System for Urban Congestion |
| **Theme** | Transportation & Logistics |
| **Category** | Software |
| **Team ID** | 77386 |
| **Team Name** | **Bitfusion-I** |

---

## 💻 Tech Stack

### Frontend & Dashboard
* **Framework:** Next.js 15, React 18, Tailwind CSS
* **State Management:** Zustand
* **Data Visualizations:** Recharts
* **UI Components:** Radix UI primitives & Lucide React icons

### Backend & API
* **Core API Server:** Node.js, Express.js
* **Authentication:** JWT (jsonwebtoken) + bcryptjs
* **AI Orchestration:** Google Genkit (`@genkit-ai/googleai`)
* **Computer Vision:** TensorFlow.js, COCO-SSD (browser-side)

### Database & Deployments
* **In-Memory Store:** Demo data store (swappable with PostgreSQL/MongoDB)
* **Optional:** Supabase (PostgreSQL), Firebase
* **Hosting:** Vercel (Frontend), Any Node.js host (Backend)

---

## 👥 Team & Contributions

### **Ayush Bhati**
* **Role:** **Team Leader** & **Lead Frontend Developer**
* **Key Contributions:**
  * Led and coordinated the development timeline for the SIH 2025 project.
  * Architected and developed the responsive web platform dashboard from scratch.
  * Implemented real-time traffic statistics visualizations using **Recharts**.
  * Integrated **Zustand** state management and web platform overrides.
  * Designed the UX layout for live CCTV streaming, incident alert dashboards, and police dispatch triggers.

---

## 🔮 Future Roadmap

* 📈 **Larger Datasets:** Expand AI training with diverse, real-world multi-city traffic datasets.
* 🔮 **Predictive Analytics:** Build predictive machine learning models to suggest optimal travel times to citizens.
* ☁️ **Cloud Scale:** Scale PMS (Priority Management System) integration across major cities with real-time updates.
* 👁️ **Next-Gen CV:** Incorporate state-of-the-art vision-language models for superior incident detection accuracy.
* 🗄️ **Production Database:** Replace in-memory store with PostgreSQL/MongoDB for production deployments.
