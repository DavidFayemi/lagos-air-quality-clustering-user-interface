"use client";

import React, { useState, useEffect } from "react";
import { ClusterStatistics } from "./ClusterStatistics";
import { TimeSeriesChart } from "./TimeSeriesChart";
import { ScatterPlot } from "./ScatterPlot";
import { HeatmapChart } from "./HeatmapChart";
import { ClusterMap } from "./ClusterMap";
import type {
  ClusterData,
  TimeSeriesDataPoint,
  ScatterData,
  HeatmapData,
} from "@/app/lib/types";

interface VisualizationGridProps {
  clusters: ClusterData[];
  timeseries: TimeSeriesDataPoint[];
  scatter: ScatterData[];
  heatmap: HeatmapData[];
  loading?: boolean;
}

export function VisualizationGrid({
  clusters,
  timeseries,
  scatter,
  heatmap,
  loading = false,
}: VisualizationGridProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Cluster Statistics Cards */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Cluster Overview
        </h2>
        <ClusterStatistics clusters={clusters} loading={loading} />
      </section>

      {/* Cluster Map - Full Width */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Geographic Distribution
        </h2>
        <ClusterMap clusters={clusters} loading={loading} />
      </section>

      {/* Time Series Chart - Full Width */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Temporal Analysis
        </h2>
        <TimeSeriesChart data={timeseries} loading={loading} />
      </section>

      {/* Scatter Plot and Heatmap - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Correlation Analysis
          </h2>
          <ScatterPlot data={scatter} loading={loading} />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Daily Pattern
          </h2>
          <HeatmapChart data={heatmap} loading={loading} />
        </section>
      </div>
    </div>
  );
}
