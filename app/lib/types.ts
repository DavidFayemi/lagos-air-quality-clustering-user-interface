// Core types for the dashboard application

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
  coordinates: {
    lat: number;
    lng: number;
  };
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

// Visualization data types
export type ClusterData = {
  id: string;
  name: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  pm1_avg: number;
  pm25_avg: number;
  pm10_avg: number;
  humidity_avg: number;
  temperature_avg: number;
  air_quality_category:
    | "Good"
    | "Moderate"
    | "Unhealthy for Sensitive Groups"
    | "Unhealthy"
    | "Very Unhealthy";
  reading_count: number;
};

export type TimeSeriesDataPoint = {
  date: string;
  pm1: number;
  pm25: number;
  pm10: number;
  humidity: number;
  temperature: number;
  location?: string;
};

export type HeatmapData = {
  x: string; // time of day or date
  y: string; // location
  value: number; // pollution level
};

export type ScatterData = {
  pm25: number;
  temperature: number;
  humidity: number;
  cluster: string;
  location: string;
};

export type LocationData = {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  clusters: string[];
};

// API Response types
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
