# Lagos Air Quality Clustering - Dashboard UI

**Status:** ✅ Production-Ready Dashboard

A modern, professional web-based dashboard for visualizing air quality clustering data in Lagos, Nigeria. This repository represents the **interactive frontend layer** of the broader ML project.

---

## 🎯 Project Overview

This dashboard visualizes the outputs of a machine learning data pipeline (which processes raw sensor data from Open.Africa). 

The pipeline dynamically fetches real-world sensor data every month, applies transformations, and runs three separate clustering algorithms (K-Means, DBSCAN, Hierarchical) to identify pollution hotspots. The results are stored and exposed via an API, which this Next.js dashboard consumes.

### Features
- ✅ **Dynamic Monthly Data**: Displays sensor data for specific months (e.g., February 2026).
- ✅ **Algorithm Comparison**: View and switch between K-Means, DBSCAN, and Hierarchical clustering results in real-time.
- ✅ **Real-time Data Visualizations**: 
  - Geographic map of cluster centers
  - Time-series trends of PM1, PM2.5, and PM10
  - Scatter plots correlating temperature and pollution
  - Daily pattern heatmaps
  - AQI category distribution
- ✅ **Dark/Light Theme** support
- ✅ **Responsive Design** built with Tailwind CSS and `shadcn/ui`

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Valid `lagos_air_quality.processed_months.json` and `lagos_air_quality.daily_observations.json` files in the root folder, OR the REST API endpoint configured.

### Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd lagos-air-quality-clustering-ui

# 2. Install dependencies
npm install

# 3. Configure Environment Variables
# Create .env.local file with your credentials:
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_BASE_URL=https://final-year-project-api-qbur.onrender.com
EOF

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000 in your browser
```

---

## 🏗️ Architecture & Tech Stack

| Layer             | Technology     | Purpose                          |
| ----------------- | -------------- | -------------------------------- |
| **Framework**     | Next.js 16.1.6 | Full-stack React with SSR        |
| **Styling**       | Tailwind CSS 4 | Utility-first CSS                |
| **Animation**     | Framer Motion  | Smooth page transitions          |
| **Charts**        | Recharts       | Interactive data visualizations  |
| **Auth**          | Supabase       | Authentication & user routing    |
| **API Client**    | Native Fetch   | Talks to Render REST API backend |

### Data Flow

1. The Next.js dashboard requests data via `/api/visualizations/*`.
2. The internal next.js API routes (`app/lib/apiClient.ts`) call the external REST API (`GET https://final-year-project-api-qbur.onrender.com/data/:year/:month`).
3. **Fallback Mechanism**: Since the free Render backend can timeout due to cold-starts, `apiClient.ts` will gracefully catch `ENOTFOUND` or `Timeout` errors and automatically parse the `lagos_air_quality.processed_months.json` and `lagos_air_quality.daily_observations.json` files locally via `fs.readFile`.
4. The raw MongoDB-shaped data is then passed to `app/lib/dataTransformers.ts` which transforms it into standard React/Recharts prop shapes.
5. The `VisualizationGrid` renders the pure UI components.

---

## 📊 Data Structures

The dashboard consumes two primary types of data from the backend/JSON files:

### 1. `daily_observations`
Granular sensor-level health data per day:
- Includes raw metrics: `PM1`, `PM2_5`, `PM10`, `humidity`, `temperature`
- Includes calculated features: `fine_ratio`, `coarse_ratio`, `aqi_category`
- Includes algorithm assignments: `kmeans_cluster`, `dbscan_cluster` (where -1 = noise), `hierarchical_cluster`

### 2. `processed_months`
Rolled-up metrics per month comparing the ML algorithm performance:
- Includes validation scores: `silhouette`, `davies_bouldin`, `calinski_harabasz`
- Includes the `centroids` profile (averages) for every cluster produced by the algorithm.

---

## 📁 Project Structure

```
app/
├── (authenticated)/         # Protected routes (req. auth)
│   └── dashboard/page.tsx   # Main dashboard layout + state
├── api/
│   └── visualizations/      # Internal Next.js API Routes
│       ├── clusters/
│       ├── heatmap/
│       ├── locations/
│       ├── month/           # Monthly algorithm metrics
│       ├── scatter/
│       └── timeseries/
├── components/
│   └── Visualizations/      # Recharts/UI components
│       ├── AlgorithmComparison.tsx
│       ├── AQIDistribution.tsx
│       ├── ClusterMap.tsx
│       ├── ClusterStatistics.tsx
│       ├── HeatmapChart.tsx
│       ├── ScatterPlot.tsx
│       ├── TimeSeriesChart.tsx
│       └── VisualizationGrid.tsx
└── lib/
    ├── apiClient.ts         # render.com Fetch + JSON Fallback
    ├── dataTransformers.ts  # transforms data for charts
    ├── supabase.ts          # Auth config
    └── types.ts             # TypeScript definitions
```

---

## 🎨 Color System & Theming

The UI supports both dark and light mode via `next-themes`. Chart colors are defined as CSS variables in `globals.css` and dynamically cycle through ten distinct cluster colors (to support algorithms like K-Means that generate multiple clusters), plus a distinct grey token for DBSCAN's "Noise" points.

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test thoroughly (`npm run dev`)
4. Create a Pull Request against `main`

---

**Last Updated:** March 2026
**Version:** 1.0.0
**Status:** Production Ready ✅ 
