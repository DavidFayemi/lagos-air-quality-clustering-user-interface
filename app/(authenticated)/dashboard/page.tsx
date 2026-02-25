"use client";

import React, { useState, useEffect } from "react";
import { VisualizationGrid } from "@/app/components/Visualizations/VisualizationGrid";
import type {
  ClusterData,
  TimeSeriesDataPoint,
  ScatterData,
  HeatmapData,
} from "@/app/lib/types";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [timeseries, setTimeseries] = useState<TimeSeriesDataPoint[]>([]);
  const [scatter, setScatter] = useState<ScatterData[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [clustersRes, timeseriesRes, scatterRes, heatmapRes] =
        await Promise.all([
          fetch("/api/visualizations/clusters"),
          fetch("/api/visualizations/timeseries"),
          fetch("/api/visualizations/scatter"),
          fetch("/api/visualizations/heatmap"),
        ]);

      if (
        !clustersRes.ok ||
        !timeseriesRes.ok ||
        !scatterRes.ok ||
        !heatmapRes.ok
      ) {
        throw new Error("Failed to fetch visualization data");
      }

      const [clustersData, timeseriesData, scatterData, heatmapData] =
        await Promise.all([
          clustersRes.json(),
          timeseriesRes.json(),
          scatterRes.json(),
          heatmapRes.json(),
        ]);

      setClusters(clustersData.data);
      setTimeseries(timeseriesData.data);
      setScatter(scatterData.data);
      setHeatmap(heatmapData.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time air quality monitoring for Lagos State
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </motion.button>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground"
        >
          Last updated: {lastUpdated.toLocaleTimeString()}
        </motion.p>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-destructive/10 border border-destructive/20 rounded-md"
        >
          <p className="text-sm text-destructive">{error}</p>
        </motion.div>
      )}

      {/* Visualization Grid */}
      {!error && (
        <VisualizationGrid
          clusters={clusters}
          timeseries={timeseries}
          scatter={scatter}
          heatmap={heatmap}
          loading={loading}
        />
      )}
    </motion.div>
  );
}
