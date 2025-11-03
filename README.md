# 🚇 Kota Metro Route Planner

A smart and interactive **metro navigation system** built using **HTML, CSS, and JavaScript**, designed to help users find the **fastest**, **cheapest**, and **most optimized routes** between metro stations in **Kota**.  
The project uses **graph traversal algorithms (DFS)** for route discovery and provides a clean, responsive web interface for interaction.

---

## 🟢 Live Demo

🎯 **[👉 View Now on netlify](https://cerulean-lily-2a57ca.netlify.app/)**  

---

## ✨ Features

- ⚡ **Fastest Route Calculation** — Finds the path with minimum travel time.  
- 💰 **Optimized Fare Estimation** — Calculates realistic fare for each route.  
- 🔁 **Interchange Panel** — View all interchange stations and their connected lines dynamically.  
- 🧭 **Multiple Route Suggestions** — Displays the top three optimized routes with time, fare, and interchanges.  
- 📱 **Responsive Design** — Fully optimized for desktop and mobile viewing.

---

## 🧠 Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6)  
- **Logic & Algorithms:** Depth-First Search (DFS), Custom Graph Implementation  
- **Version Control:** Git & GitHub  

---

## ⚙️ How It Works

1. Each metro station is represented as a **node** in a graph.  
2. Connections between stations are **edges** with weights (distance, fare, line color).  
3. The app uses **DFS** to find *all possible paths* between the source and destination.  
4. It then compares and sorts all routes by:
   - ⏱️ Total Travel Time  
   - 💵 Estimated Fare  
   - 🔁 Line Changes  
5. Finally, the **top three optimized routes** are displayed for the user.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/prashantgoyal7691/Kota-Metro-Route-Planner.git
cd Kota-Metro-Route-Planner
