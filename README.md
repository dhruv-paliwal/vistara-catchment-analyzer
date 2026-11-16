# Vistāra (विस्तार) - Geospatial Retail Expansion & Catchment Analyzer

A geospatial intelligence web application designed for commercial retail expansion and site selection across Indian urban markets, calibrated on the **Bengaluru Metropolitan Region**.

---

## 🎨 UI/UX & Indian Art Aesthetic

- **Warm Heritage Color Palette**:
  - **Terracotta** (`#C85A32`, `#9E381A`): Primary anchor, buttons, and high-intensity nodes
  - **Saffron / Kesar** (`#E67E22`, `#F39C12`): Secondary actions, cluster boundaries, accents
  - **Turmeric / Haldi** (`#E5A93C`, `#F59E0B`): Density highlights, pin glow, currency badges
  - **Soft Cream & Off-White** (`#FAF6ED`, `#FFFDF9`, `#F5ECE0`): Non-sterile, warm, tactile background canvas
- **Indian Art Filigree**: Subtle SVG Jali (lattice) borders, Mandala lotus insignias, and Indian Rupee medallions.
- **Indian Numbering Financials**: All metrics formatted automatically in **Indian Rupees (₹)** using the Indian numbering system (**Lakhs and Crores**, e.g., `₹45.5 Lakhs`, `₹1.25 Crores`).
- **Fully Mobile-Responsive**: Fluid grid with collapsible parameter panels and responsive Leaflet touch controls.
- **Zero Dummy Components**: Every slider, button, toggle, and file upload zone is fully functional and mapped to real reactive state.

---

## 🚀 5-Phase Functional Architecture

### Phase 1: Data Acquisition & Base Mapping
- **Direct CSV Reader**: Drag-and-drop or browse CSV files on the main dashboard using PapaParse.
- **Instant Geospatial Plotting**: Automatically renders raw coordinates on an interactive Leaflet map.
- **Interactive Map Pins**: Custom SVG pins by location type (`Retail Hub`, `Competitor`, `Highway Intersection`) with hover tooltips and detail popups showing daily traffic and population density.
- **Downloadable Template**: Includes `Bengaluru_Commercial_Catchment_Data.csv` with 36 authentic Bengaluru commercial points (Indiranagar, Koramangala, Silk Board, Whitefield, MG Road, etc.).

### Phase 2: Spatial EDA & Heatmapping
- **"View Density Heatmap" Toggle**: Seamlessly transitions discrete point pins into a continuous multi-ring thermal gradient (Turmeric → Saffron → Terracotta).
- **Metric Weighting**: Toggle heatmap weighting between **Traffic Flow** and **Population Density**.
- **Highway Proximity Benchmark Card**: Calculates and displays the average distance to the nearest major highway intersection for the dataset using spherical Haversine formulas.

### Phase 3: Catchment Area Clustering (DBSCAN)
- **Interactive Control Sliders**:
  - `eps` (radius): 0.5 km to 5.0 km
  - `min_samples` (density threshold): 2 to 10 points
- **"Run DBSCAN Clustering" Button**: Groups high-density points into distinct colored zones (Catchment Zones) with dynamic convex hull boundary polygons.
- **Noise Isolation**: Isolated points below the density threshold are grayed out as noise.

### Phase 4: Revenue Viability Prediction (Random Forest Simulation)
- **Candidate Site Selection**: Interactive form for an **1,800 sq ft property**. Click anywhere on the map or enter GPS coordinates manually.
- **Ensemble Regression**: Passes location features (traffic, highway distance, population density, cluster proximity, competitor count) through a 20-tree Random Forest simulation.
- **Recharts Feature Importance Bar Graph**: Visualizes Gini/permutation importance weights, proving whether highway proximity outweighed population density for that specific site.

### Phase 5: Pipeline Integration & Final Output Dashboard
- **Printable Site Viability Report Card**: Overlays the dashboard, stating:
  1. Catchment zone clearance status (inside vs outside viable cluster)
  2. Target zone's primary characteristics (commercial intensity, traffic profile, demographic density, moat)
  3. Projected annual revenue formatted in INR (e.g., `₹45.5 Lakhs`)
  4. Break-even period in months and estimated ROI %
- **Download Actions**: Export as formatted **JSON audit data** or **Print to PDF** with `@media print` layout.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Visualization**: Recharts, Leaflet, Lucide-React
- **CSV Parsing**: PapaParse
- **ML Logic**:
  - **In-Browser Instant Engine**: Built-in Haversine DBSCAN + Random Forest Decision Tree Ensemble (zero setup required)
  - **Python FastAPI Backend**: scikit-learn (`DBSCAN`, `RandomForestRegressor`), FastAPI, Uvicorn
  - **Google Colab Notebook**: `backend/Catchment_Analyzer_Colab.ipynb` with `pyngrok` support

---

## 🏃‍♂️ How to Run

### Option A: Next.js Web App (Instant Start)

```bash
cd "C:\Users\Dhruv\.gemini\antigravity\scratch\vistara-catchment-analyzer"
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option B: Run with Python FastAPI ML Microservice

1. Start the FastAPI microservice:
   ```bash
   cd backend
   python -m uvicorn main:app --reload --port 8000
   ```
2. In the web app header, switch the **ML Engine** toggle from "In-Browser" to **"Python FastAPI / Colab Endpoint"** (defaults to `http://localhost:8000`).
3. Click "Test Connection" to confirm the service is online.
