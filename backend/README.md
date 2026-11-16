# Python FastAPI & Google Colab ML Microservice

This microservice provides high-performance Machine Learning endpoints for the **Geospatial Retail Expansion & Catchment Analyzer**:
- **DBSCAN Spatial Clustering**: Exact spherical Haversine metric clustering with core/border/noise classification.
- **Random Forest Regressor Simulation**: Ensemble revenue estimation calibrated for 1,800 sq ft retail properties in Indian commercial corridors, with real-time Gini feature importances.

## Quick Start (Local)

1. Create a virtual environment & install requirements:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

3. The server runs at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.

## Google Colab Integration

1. Open `Catchment_Analyzer_Colab.ipynb` in [Google Colab](https://colab.research.google.com).
2. Run all cells to launch FastAPI with `pyngrok`.
3. Copy the public ngrok URL (e.g., `https://xxxx.ngrok-free.app`) and paste it into the **ML Engine Settings** in the Next.js web application!
