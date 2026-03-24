/**
 * Pure functions that transform raw DailyObservation[] + ProcessedMonth
 * into chart-ready types for each Recharts component.
 *
 * All heavy computation stays here so API routes stay lean.
 */

import type {
  DailyObservation,
  ProcessedMonth,
  Algorithm,
  ClusterData,
  TimeSeriesDataPoint,
  HeatmapData,
  ScatterData,
  LocationData,
  AQICategory,
} from "@/app/lib/types";

// ── AQI category ordering for sorting / colouring ─────────────────────────────
const AQI_ORDER: AQICategory[] = [
  "Good",
  "Moderate",
  "Unhealthy for Sensitive Groups",
  "Unhealthy",
  "Very Unhealthy",
];

function dominantAQI(obs: DailyObservation[]): AQICategory {
  if (obs.length === 0) return "Moderate";
  const counts = obs.reduce(
    (acc, o) => {
      acc[o.aqi_category] = (acc[o.aqi_category] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  return (
    (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as AQICategory) ??
    "Moderate"
  );
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

// ── Cluster statistics cards ──────────────────────────────────────────────────

/**
 * Build ClusterData[] from the centroids stored in ProcessedMonth.
 * Each centroid becomes one "cluster card".
 */
export function buildClusterData(
  month: ProcessedMonth,
  observations: DailyObservation[],
  algorithm: Algorithm
): ClusterData[] {
  const result = month[algorithm];
  const clusterKey =
    algorithm === "kmeans"
      ? "kmeans_cluster"
      : algorithm === "dbscan"
        ? "dbscan_cluster"
        : "hierarchical_cluster";

  return result.centroids.map((centroid) => {
    const clusterObs = observations.filter(
      (o) => (o[clusterKey] as number) === centroid.cluster
    );

    // Use centroid lat/lon median if subset exists, otherwise 0
    const lats = clusterObs.map((o) => o.lat);
    const lons = clusterObs.map((o) => o.lon);

    const label =
      algorithm === "dbscan" && centroid.cluster === -1
        ? "Noise / Outliers"
        : `Cluster ${centroid.cluster}`;

    return {
      id: `${algorithm}-${centroid.cluster}`,
      name: label,
      location: `Sensor group ${centroid.cluster}`,
      coordinates: {
        lat: lats.length ? avg(lats) : 6.52,
        lng: lons.length ? avg(lons) : 3.38,
      },
      pm1_avg: centroid.PM1,
      pm25_avg: centroid.PM2_5,
      pm10_avg: centroid.PM10,
      fine_ratio_avg: centroid.fine_ratio,
      humidity_avg: centroid.humidity,
      temperature_avg: centroid.temperature,
      air_quality_category: dominantAQI(clusterObs),
      reading_count: clusterObs.length,
      algorithm,
    } satisfies ClusterData;
  });
}

// ── Time series ───────────────────────────────────────────────────────────────

/**
 * Aggregate daily observations by date → city-wide daily means.
 */
export function buildTimeSeries(
  observations: DailyObservation[]
): TimeSeriesDataPoint[] {
  const byDate = new Map<string, DailyObservation[]>();
  for (const obs of observations) {
    const existing = byDate.get(obs.date) ?? [];
    existing.push(obs);
    byDate.set(obs.date, existing);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, obs]) => ({
      date,
      pm1: +avg(obs.map((o) => o.PM1)).toFixed(2),
      pm25: +avg(obs.map((o) => o.PM2_5)).toFixed(2),
      pm10: +avg(obs.map((o) => o.PM10)).toFixed(2),
      humidity: +avg(obs.map((o) => o.humidity)).toFixed(1),
      temperature: +avg(obs.map((o) => o.temperature)).toFixed(1),
    }));
}

// ── Heatmap ───────────────────────────────────────────────────────────────────

/**
 * Build sensor × date grid of PM2.5 values.
 * Heatmap rows = sensors, columns = dates.
 * Limits to the top 10 sensors by record count to keep the table manageable.
 */
export function buildHeatmap(observations: DailyObservation[]): HeatmapData[] {
  // Pick the top-N sensors
  const sensorCounts = new Map<number, number>();
  for (const o of observations) {
    sensorCounts.set(o.sensor_id, (sensorCounts.get(o.sensor_id) ?? 0) + 1);
  }
  const topSensors = [...sensorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);

  return observations
    .filter((o) => topSensors.includes(o.sensor_id))
    .map((o) => ({
      x: o.date,
      y: `Sensor ${o.sensor_id}`,
      value: +o.PM2_5.toFixed(1),
    }));
}

// ── Scatter plot ──────────────────────────────────────────────────────────────

/**
 * Each observation becomes a scatter point coloured by its cluster label
 * for the selected algorithm. DBSCAN noise points are labelled "Noise".
 */
export function buildScatterData(
  observations: DailyObservation[],
  algorithm: Algorithm
): ScatterData[] {
  const clusterKey =
    algorithm === "kmeans"
      ? "kmeans_cluster"
      : algorithm === "dbscan"
        ? "dbscan_cluster"
        : "hierarchical_cluster";

  return observations.map((o) => {
    const clusterNum = o[clusterKey] as number;
    const clusterLabel =
      algorithm === "dbscan" && clusterNum === -1
        ? "Noise"
        : `Cluster ${clusterNum}`;

    return {
      pm25: +o.PM2_5.toFixed(2),
      temperature: +o.temperature.toFixed(1),
      humidity: +o.humidity.toFixed(1),
      fine_ratio: +o.fine_ratio.toFixed(3),
      cluster: clusterLabel,
      aqi_category: o.aqi_category,
      date: o.date,
    };
  });
}

// ── Locations ─────────────────────────────────────────────────────────────────

/**
 * Unique sensor locations with their coordinates and which clusters they appear in.
 */
export function buildLocationData(
  observations: DailyObservation[],
  algorithm: Algorithm
): LocationData[] {
  const clusterKey =
    algorithm === "kmeans"
      ? "kmeans_cluster"
      : algorithm === "dbscan"
        ? "dbscan_cluster"
        : "hierarchical_cluster";

  const byLocation = new Map<
    number,
    { lat: number; lon: number; clusters: Set<string> }
  >();

  for (const o of observations) {
    const existing = byLocation.get(o.location) ?? {
      lat: o.lat,
      lon: o.lon,
      clusters: new Set<string>(),
    };
    const clusterNum = o[clusterKey] as number;
    existing.clusters.add(
      algorithm === "dbscan" && clusterNum === -1
        ? "Noise"
        : `Cluster ${clusterNum}`
    );
    byLocation.set(o.location, existing);
  }

  return Array.from(byLocation.entries()).map(([locationId, data]) => ({
    id: String(locationId),
    name: `Location ${locationId}`,
    coordinates: { lat: data.lat, lng: data.lon },
    clusters: Array.from(data.clusters),
  }));
}

// ── AQI distribution (for pie chart) ─────────────────────────────────────────

export type AQIDistributionEntry = {
  name: AQICategory;
  value: number;
  color: string;
};

const AQI_COLORS: Record<AQICategory, string> = {
  Good: "#22c55e",
  Moderate: "#eab308",
  "Unhealthy for Sensitive Groups": "#f97316",
  Unhealthy: "#ef4444",
  "Very Unhealthy": "#991b1b",
};

export function buildAQIDistribution(
  observations: DailyObservation[]
): AQIDistributionEntry[] {
  const counts = new Map<AQICategory, number>();
  for (const o of observations) {
    counts.set(o.aqi_category, (counts.get(o.aqi_category) ?? 0) + 1);
  }
  return AQI_ORDER.filter((cat) => counts.has(cat)).map((cat) => ({
    name: cat,
    value: counts.get(cat)!,
    color: AQI_COLORS[cat],
  }));
}
