// ─── Core user/auth types ────────────────────────────────────────────────────

export type User = {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

export type UserPreferences = {
  id: string;
  user_id: string;
  theme: "light" | "dark" | "system";
  default_filters?: FilterConfig;
  created_at: string;
  updated_at: string;
};

export type FilterConfig = {
  date_from?: string;
  date_to?: string;
  locations?: string[];
  cluster_type?: string;
  pollution_level_min?: number;
  pollution_level_max?: number;
};

export type SavedFilter = {
  id: string;
  user_id: string;
  name: string;
  filters: FilterConfig;
  created_at: string;
};

export type BookmarkedLocation = {
  id: string;
  user_id: string;
  location_name: string;
  coordinates: { lat: number; lng: number };
  cluster_id?: string;
  created_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string;
  action: string;
  description?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
};

// ─── Real MongoDB / API data shapes ──────────────────────────────────────────

export type AQICategory =
  | "Good"
  | "Moderate"
  | "Unhealthy for Sensitive Groups"
  | "Unhealthy"
  | "Very Unhealthy";

export type Algorithm = "kmeans" | "dbscan" | "hierarchical";

/**
 * One document per sensor per calendar day — from daily_observations collection.
 * Cluster labels from all three algorithms are included; dbscan_cluster = -1 means noise.
 */
export type DailyObservation = {
  _id: string;            // e.g. "2026-02_4853_2026-02-01"
  month_id: string;       // e.g. "2026-02"
  sensor_id: number;
  location: number;
  lat: number;
  lon: number;
  date: string;           // "YYYY-MM-DD"
  PM1: number;            // µg/m³
  PM2_5: number;          // µg/m³
  PM10: number;           // µg/m³
  fine_ratio: number;     // PM2.5 / PM10  (>1 = combustion; <1 = dust)
  coarse_ratio: number;   // PM10 / PM2.5
  humidity: number;       // %
  temperature: number;    // °C
  aqi_category: AQICategory;
  kmeans_cluster: number;
  dbscan_cluster: number; // -1 = noise point
  hierarchical_cluster: number;
};

/** Centroid for one cluster produced by any algorithm. */
export type ClusterCentroid = {
  cluster: number;
  PM1: number;
  PM2_5: number;
  PM10: number;
  fine_ratio: number;
  humidity: number;
  temperature: number;
};

/** Metrics + centroids for one algorithm run. */
export type AlgorithmResult = {
  n_clusters: number;
  silhouette: number;
  davies_bouldin: number;
  calinski_harabasz: number;
  centroids: ClusterCentroid[];
};

export type DBSCANResult = AlgorithmResult & {
  eps: number;
  min_samples: number;
  n_noise: number;
};

export type HierarchicalResult = AlgorithmResult & {
  linkage_method: string;
};

/**
 * One document per processed month — from processed_months collection.
 * Contains metrics + centroid profiles for all three algorithms.
 */
export type ProcessedMonth = {
  _id: string;            // e.g. "2026-02"
  year: number;
  month: number;
  label: string;          // e.g. "February 2026"
  status: "completed";
  processed_at: string;   // ISO date string
  kmeans: AlgorithmResult;
  dbscan: DBSCANResult;
  hierarchical: HierarchicalResult;
};

/**
 * Shape returned by the backend API:
 * GET /data/:year/:month
 * e.g. https://final-year-project-api-qbur.onrender.com/data/2026/february
 */
export type MonthApiResponse = {
  processed_month: ProcessedMonth;
  daily_observations: DailyObservation[];
};

// ─── Chart-ready types (consumed by Recharts components) ─────────────────────

export type ClusterData = {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  pm1_avg: number;
  pm25_avg: number;
  pm10_avg: number;
  fine_ratio_avg: number;
  humidity_avg: number;
  temperature_avg: number;
  air_quality_category: AQICategory;
  reading_count: number;
  algorithm: Algorithm;
};

export type TimeSeriesDataPoint = {
  date: string;
  pm1: number;
  pm25: number;
  pm10: number;
  humidity: number;
  temperature: number;
};

export type HeatmapData = {
  x: string; // date
  y: string; // sensor id (stringified)
  value: number; // PM2.5
};

export type ScatterData = {
  pm25: number;
  temperature: number;
  humidity: number;
  fine_ratio: number;
  cluster: string;  // cluster label for legend (e.g. "Cluster 0", "Noise")
  aqi_category: AQICategory;
  date: string;
};

export type LocationData = {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  clusters: string[];
};

// ─── Generic API wrapper ──────────────────────────────────────────────────────

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type VisualizationApiResponse = {
  clusters: ClusterData[];
  timeseries: TimeSeriesDataPoint[];
  heatmap: HeatmapData[];
  scatter: ScatterData[];
  locations: LocationData[];
};
