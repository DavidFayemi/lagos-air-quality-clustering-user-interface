# Lagos 2024 Air Quality Clustering Using Unsupervised Machine Learning

## Project Overview

This is a **Final Year Project (FYP)** that applies unsupervised machine learning to hourly air quality sensor data from **Lagos, Nigeria** collected throughout 2024. The study discovers and characterises distinct pollution regimes — including traffic-dominated periods, Harmattan dust episodes, and anomalous sensor events — without any pre-labelled training data.

The research is grounded in a full academic dissertation (`document.txt`) covering Introduction, Literature Review, and Methodology chapters, and follows the **CRISP-DM** (Cross-Industry Standard Process for Data Mining) framework.

---

## 📁 Repository Structure-

```
lagos-2024-air-quality-clustering-with-unsupervised-ml/
├── README.md                                                    ← This file
├── document.txt                                                 ← Full academic dissertation (Chapters 1–3 + References)
├── requirements.txt                                             ← Python dependencies
├── run_pipeline.py                                              ← Automated monthly pipeline (fetch → run → persist)
├── Lagos(2024) Air quality clustering using unsupervised machine learning.ipynb  ← Main analysis notebook
├── January 2024.csv  ...  December 2024.csv                    ← 12 monthly raw sensor data files
├── outputs/                                                     ← Executed notebook outputs (one per monthly run)
│   └── Lagos(2024) Air quality clustering..._{Month_Year}.ipynb
├── .gitignore
└── .env                                                         ← (NOT committed) Contains MONGO_URI, DB_NAME
```

---

## 🎯 Research Aim & Objectives

**Aim:** Apply unsupervised machine learning clustering to Lagos multi-sensor air quality data to discover and characterise spatial-temporal pollution patterns.

**Specific Objectives:**

1. Preprocess and integrate hourly PM1, PM2.5, PM10 sensor data into analysis-ready daily feature sets.
2. Perform exploratory analysis and dimensionality reduction (PCA) to understand data structure.
3. Apply and compare K-Means, DBSCAN, and hierarchical clustering using internal validation metrics.
4. Visualise discovered pollution regimes through time series, PCA scatter plots, cluster profile heatmaps, and spatial sensor maps.
5. Interpret clusters in the context of known Lagos emission sources, meteorology, and seasonal patterns.

**Primary Hypothesis:** DBSCAN is expected to outperform other algorithms due to its noise handling and ability to detect irregular cluster shapes typical in real-world sensor data.

---

## ❓ The Problem This Research Addresses

Lagos, like many rapidly developing megacities, suffers from complex, multi-source air pollution (traffic, generators, industry, Harmattan dust from the Sahara). Nigeria's regulatory monitoring network is extremely sparse (~0.4 stations per million people), and the newly available AirQo low-cost IoT sensor network generates rich hourly datasets that remain underutilised — typically summarised through basic statistics that obscure underlying pollution regimes, hotspots, and anomalous events.

No prior Nigerian study has applied **comparative unsupervised clustering** (K-Means, DBSCAN, hierarchical) to such a rich, multi-sensor, multi-pollutant dataset to characterise urban pollution regimes. This project fills that gap.

---

## 🗂️ Data Overview

### Source

- **Provider:** [AirQo](https://www.airqo.net/) sensor network (community IoT sensors deployed across Lagos)
- **Portal:** [open.africa — SensorsAfrica Airquality Archive Lagos](https://open.africa/eu/dataset/sensorsafrica-airquality-archive-lagos)
- **Format:** 12 monthly CSV files (January 2024 – December 2024)
- **Volume:** ~100,000+ hourly observations → aggregated to ~5,000 daily records for clustering

### Raw Data Structure (Long Format)

Each CSV arrives in **long format** — one row per sensor measurement type:

| sensor_id | location | lat  | lon  | timestamp        | value_type | value |
| --------- | -------- | ---- | ---- | ---------------- | ---------- | ----- |
| S001      | Ikoyi    | 6.45 | 3.63 | 2024-01-01 10:30 | P0         | 25.3  |
| S001      | Ikoyi    | 6.45 | 3.63 | 2024-01-01 10:30 | P1         | 45.2  |
| S001      | Ikoyi    | 6.45 | 3.63 | 2024-01-01 10:30 | humidity   | 65    |

### Sensor Variable Codes

| Code          | Full Name                      | Meaning                          | Unit  |
| ------------- | ------------------------------ | -------------------------------- | ----- |
| **P0**        | PM1 (Particulate Matter ≤1µm)  | Ultra-fine particles (combustion) | µg/m³ |
| **P1**        | PM2.5 (Particulate Matter ≤2.5µm) | Fine health-critical particles  | µg/m³ |
| **P2**        | PM10 (Particulate Matter ≤10µm) | Coarse particles (dust)         | µg/m³ |
| **humidity**  | Relative Humidity              | Moisture in air                  | %     |
| **temperature** | Temperature                  | Air temperature                  | °C    |

---

## 🔄 Analysis Pipeline (Steps 1–9)

The notebook executes the following sequential steps:

### Step 1: Data Transformation (Long → Wide Format)

The raw long-format CSVs are **pivoted** so that each row represents one sensor at one timestamp, with all measurement types as separate columns. This is a prerequisite for clustering — algorithms require all features for one observation to be in the same row.

```
Before: S001, Ikoyi, P0, 25.3  /  S001, Ikoyi, P1, 45.2  /  ...
After:  S001, Ikoyi, PM1=25.3, PM2.5=45.2, humidity=65, temp=28.5
```

---

### Step 2: Data Cleaning

Raw sensor data contains errors, gaps (from power outages, communication failures, malfunctions), and physically impossible values. Cleaning steps:

| Step | Action |
| ---- | ------ |
| 2.1 | Parse timestamps; remove corrupted datetime entries |
| 2.2 | Drop records missing sensor ID, location, timestamp, or value |
| 2.3 | Remove exact duplicate records (logging errors) |
| 2.4 | Impute missing PM/weather values: forward-fill → backward-fill → sensor median → global median |
| 2.5 | Remove physically impossible values (negative PM, humidity <0% or >100%, temperature <-50°C or >70°C) |
| 2.6 | Clip extreme outliers at 99th percentile (likely sensor malfunctions, not genuine pollution) |

**Data retention target:** >95% of records kept.

---

### Step 3: Feature Engineering

Raw measurements are supplemented with derived features that capture deeper patterns:

| Feature Group | Features Created | Purpose |
| ------------- | ---------------- | ------- |
| **Temporal** | Hour, day_of_week, month, is_weekend, hour_sin, hour_cos | Capture diurnal/weekly/seasonal rhythms; cyclical encoding keeps hour 23 adjacent to hour 0 |
| **Pollutant ratios** | fine_ratio = PM2.5/PM10, coarse_ratio = PM10/PM2.5 | Distinguish combustion sources (high fine_ratio) from dust (low fine_ratio) |
| **Weather interactions** | PM × humidity, PM × temperature | Capture combined environmental effects |
| **Daily aggregation** | Group hourly → daily averages per sensor+location+date | Reduce ~100k hourly rows to ~5k daily rows; smooth noise |
| **Pollution Severity Index** | Standardised average of PM1, PM2.5, PM10 | Single composite pollution score |

---

### Step 4: Feature Selection

**6 features selected for clustering:**

1. PM1 — ultra-fine particle mass
2. PM2.5 — fine particles (primary health impact)
3. PM10 — coarse particles (visibility, respiratory)
4. fine_ratio — combustion vs. dust indicator
5. humidity — meteorological context
6. temperature — meteorological context

More features would introduce "curse of dimensionality"; fewer would miss important patterns.

---

### Step 5: Data Standardisation

All 6 features are scaled with `sklearn.preprocessing.StandardScaler` (mean=0, std=1) before clustering, preventing high-range features (e.g. PM2.5 0–300 µg/m³) from dominating distance calculations over low-range features (e.g. temperature 15–35°C).

---

### Step 6: PCA Dimensionality Reduction (Visualisation)

Principal Component Analysis (PCA) is applied to project the 6-dimensional feature space into 2D for visualisation and pattern exploration. This retains the maximum variance from the original features in a form that can be plotted, and is used in cluster validation scatter plots.

---

### Step 7: Clustering Analysis (Three Algorithms)

Three complementary clustering algorithms are applied to the same preprocessed dataset. Each reveals different aspects of the data's structure.

#### Algorithm 1: K-Means

- Partitions data into K spherical clusters by minimising within-cluster variance.
- **Optimal K selection:** Elbow method (inertia vs K), Silhouette Score (maximise), Davies-Bouldin Index (minimise).
- **Configuration:** 30 random initialisations, keep best result.
- **Strengths:** Fast, interpretable, good baseline.
- **Limitations:** Must pre-specify K; sensitive to outliers; assumes spherical clusters.

#### Algorithm 2: DBSCAN

- Density-based clustering; no need to pre-specify cluster count. Identifies clusters as dense regions separated by sparse regions. Data points in sparse areas are labelled as **noise** (−1).
- **Parameter tuning:** K-distance graph to estimate `eps`; grid search over `eps ∈ [0.3, 0.5, 0.7, 1.0, 1.3]` × `min_samples ∈ [3, 5, 10]` (15 combinations); select by silhouette on non-noise points.
- **Strengths:** No K required; explicit outlier detection; handles arbitrary cluster shapes.
- **Limitations:** Sensitive to `eps` / `min_samples`; struggles with varying-density clusters.
- **Primary hypothesis:** DBSCAN is expected to perform best on this noisy, real-world sensor dataset.

#### Algorithm 3: Hierarchical Clustering (Agglomerative)

- Bottom-up: starts with N individual clusters; iteratively merges the two most similar until one cluster remains. Produces a **dendrogram** showing the full merger hierarchy.
- **Linkage methods tested:** Ward (primary — minimises merge variance), Complete, Average, Single.
- **Optimal cut:** Dendrogram cut at height maximising silhouette score across n_clusters = 2–10.
- **Strengths:** Dendrogram reveals nested structure; no K required; interpretable relationships.
- **Limitations:** O(n²) memory/time; cannot undo merges; sensitive to outliers.

---

### Step 8: Cluster Quality Evaluation

Three complementary internal validation metrics (no ground-truth labels needed):

| Metric | Range | Optimum | What it measures |
| ------ | ----- | ------- | ---------------- |
| **Silhouette Score** | −1 to +1 | Higher | Cohesion (compactness) vs separation from other clusters. >0.5 = reasonable; >0.7 = strong |
| **Davies-Bouldin Index** | 0 to ∞ | Lower | Ratio of within-cluster to between-cluster distances. <1.0 = good |
| **Calinski-Harabasz Index** | 0 to ∞ | Higher | Between-cluster variance / within-cluster variance. >50 = good |

If all three metrics agree on an algorithm → high confidence. Disagreement indicates algorithm-specific tradeoffs.

---

### Step 9: Cluster Profiling, Comparison & Recommendation

Each cluster is profiled by: size, geographic locations, mean/std of all PM variables, fine_ratio, humidity, temperature, EPA air quality category, and top contributing locations.

The three algorithms are compared side-by-side. The **highest-scoring algorithm** (by combined metrics) is recommended for final regime interpretation and policy use. Results include:
- Pollution hotspot identification (geographic areas)
- Temporal patterns (peak hours, worst months, seasonal trends)
- Source signatures (combustion vs. dust via fine_ratio)
- Meteorological relationships (humidity/temperature effects on PM)
- EPA AQI category distribution across Lagos

---

## 🤖 Automated Monthly Pipeline (`run_pipeline.py`)

The notebook is parameterised and can be executed automatically for **any target month** using `run_pipeline.py`. This script:

1. **Fetches** the target month's raw CSV directly from the [open.africa portal](https://open.africa/eu/dataset/sensorsafrica-airquality-archive-lagos) (web-scraping with BeautifulSoup).
2. **Runs** the Jupyter notebook non-interactively via [Papermill](https://papermill.readthedocs.io/), injecting the month label, CSV path, and results output path as parameters.
3. **Saves** the executed notebook to `outputs/Lagos(2024) Air quality clustering..._{Month_Year}.ipynb`.
4. **Persists** results to **MongoDB** (two collections):
   - `processed_months` — one document per month with full clustering results (K-Means, DBSCAN, Hierarchical metrics and cluster profiles).
   - `daily_observations` — one document per sensor-day, bulk upserted for idempotency.

### Running the Pipeline

```bash
# Process last month automatically
python run_pipeline.py

# Process a specific month
python run_pipeline.py "March 2024"
```

### Environment Variables (`.env` file, never committed)

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
DB_NAME=lagos_air_quality      # optional, defaults to 'lagos_air_quality'
```

> **Note:** The `.env` file is required for `run_pipeline.py` to run. The notebook itself can be run standalone without MongoDB.

---

## 📓 Running the Notebook Manually

```bash
# Install dependencies
pip install -r requirements.txt

# Launch Jupyter
jupyter lab
```

1. Open `Lagos(2024) Air quality clustering using unsupervised machine learning.ipynb`
2. Execute cells sequentially (or Cell → Run All)
3. Review outputs at each step: data shapes, visualisations, cluster quality metrics
4. Adapt parameters if results don't match expectations:
   - Change **K** in K-Means if optimal looks wrong
   - Adjust **eps/min_samples** in DBSCAN if clusters look poor
   - Try different **linkage** in Hierarchical

**Expected runtime:** 2–5 minutes on a standard machine.

---

## 🔧 Technical Stack

| Library | Role |
| ------- | ---- |
| **Python 3.8+** | Programming language |
| **pandas** | Data manipulation, pivot, groupby, imputation |
| **numpy** | Numerical computations |
| **scikit-learn** | KMeans, DBSCAN, StandardScaler, PCA, silhouette/DB/CH metrics |
| **scipy** | Hierarchical clustering (linkage, fcluster, dendrogram) |
| **matplotlib & seaborn** | Visualisations (scatter plots, heatmaps, dendrograms) |
| **papermill** | Parameterised, non-interactive notebook execution |
| **pymongo** | MongoDB client for persisting monthly results |
| **requests + beautifulsoup4** | Scraping the open.africa portal to download CSV data |
| **python-dotenv** | Loading secrets from `.env` |
| **jupyterlab** | Notebook development environment |

---

## 📊 Key Findings & Insights (Pattern)

The analysis reveals:

1. **Pollution hotspots** — specific geographic sensor locations with consistently elevated PM levels
2. **Temporal patterns** — peak pollution hours (rush hours), worst months, Harmattan season influence (Nov–Mar)
3. **Source signatures** — high fine_ratio clusters indicate combustion (traffic, generators, industry); low fine_ratio indicates dust (Harmattan, construction, unpaved roads)
4. **Meteorological relationships** — humidity and temperature effects on particle behaviour and atmospheric chemistry
5. **EPA AQI distribution** — proportion of days in Good / Moderate / Unhealthy for Sensitive / Unhealthy / Very Unhealthy categories, based on PM2.5 thresholds (≤12 / 12–35 / 35–55 / 55–150 / >150 µg/m³)

---

## 🎯 Environmental Management Recommendations

| Timeframe | Actions |
| --------- | ------- |
| **Immediate (1 month)** | Deploy targeted monitoring in identified hotspots; establish automated threshold alerts; analyse sources in high fine_ratio clusters |
| **Short-term (1–3 months)** | Traffic restriction policies in high-pollution clusters; strengthen industrial emission regulation during peak months; public health warnings for "Unhealthy" AQI days |
| **Long-term (3–12 months)** | Expand sensor network to uncovered areas; conduct formal source apportionment study; develop predictive forecast model; set quantifiable targets (e.g. 15% PM2.5 reduction); implement vehicle emission standards |

---

## ⚖️ Assumptions & Limitations

### Assumptions

- Sensor readings are accurate after outlier removal and clipping
- Daily averages represent a meaningful aggregation level
- US EPA PM2.5 thresholds are applicable in the Lagos context
- 2024 data is representative of a typical year
- Forward fill adequately preserves temporal continuity

### Limitations

- **Feature selection:** Clustering results are sensitive to which features are included
- **Algorithm sensitivity:** Different algorithms and parameter choices produce different results
- **Geographic coverage:** Only areas with deployed AirQo sensors are analysed
- **Historical context:** No pre-2024 data for direct year-on-year comparison
- **Causality:** Clustering identifies correlation/co-occurrence but cannot determine causation
- **External validation:** No ground-truth cluster labels exist; validation is purely internal
- **Gaseous pollutants excluded:** NO₂, CO, O₃ are not in this dataset

---

## 📜 Academic Context

This project is a **Final Year Project** submitted as partial fulfilment of an undergraduate degree. The full academic writeup is in `document.txt` and covers:

- **Chapter 1:** Background, problem statement, aims/objectives, scope, significance
- **Chapter 2:** Literature review — air quality challenges in developing countries, limitations of traditional analysis methods, theoretical foundations of unsupervised learning, clustering algorithm theory (K-Means, DBSCAN, hierarchical), African/Nigerian research gaps
- **Chapter 3:** Methodology — CRISP-DM framework, OOP and functional programming paradigms, system flow diagram, sequence diagram

### Key Research Contributions

1. First comparative unsupervised clustering study on the Lagos AirQo sensor network
2. Multi-metric validation (Silhouette + Davies-Bouldin + Calinski-Harabasz) for triangulated assessment
3. Comprehensive visualisation suite (PCA scatter, heatmaps, spatial maps, time series) for policy audiences
4. Replicable, open-source pipeline extensible to other Nigerian/African cities

---

## 📚 Data Attribution

- **Sensor Network:** [AirQo](https://www.airqo.net/) (Makerere University, deployed across Lagos)
- **Portal:** [SensorsAfrica Air Quality Archive — Lagos](https://open.africa/eu/dataset/sensorsafrica-airquality-archive-lagos) (open.africa)

---

**Last Updated:** March 2026
**Status:** Final Year Project — Complete Analysis
**Version:** 2.0
