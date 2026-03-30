"use client";

import React, { useState, useEffect } from "react";
import { ClusterStatistics } from "./ClusterStatistics";
import { TimeSeriesChart } from "./TimeSeriesChart";
import { ScatterPlot } from "./ScatterPlot";
import { HeatmapChart } from "./HeatmapChart";
import { ClusterMap } from "./ClusterMap";
import { AlgorithmComparison } from "./AlgorithmComparison";
import { AQIDistribution } from "./AQIDistribution";
import type {
  ClusterData,
  TimeSeriesDataPoint,
  ScatterData,
  HeatmapData,
  Algorithm,
  ProcessedMonth,
} from "@/app/lib/types";
import type { AQIDistributionEntry } from "@/app/lib/dataTransformers";

interface VisualizationGridProps {
  monthData: {
    processed_month: ProcessedMonth | null;
    aqi_distribution: AQIDistributionEntry[];
    total_observations: number;
  };
  algorithm: Algorithm;
  onAlgorithmChange: (alg: Algorithm) => void;
  clusters: ClusterData[];
  timeseries: TimeSeriesDataPoint[];
  scatter: ScatterData[];
  heatmap: HeatmapData[];
  loading?: boolean;
}

export function VisualizationGrid({
  monthData,
  algorithm,
  onAlgorithmChange,
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
      {/* Algorithm Comparison */}
      <section>
        <AlgorithmComparison
          processedMonth={monthData.processed_month}
          loading={loading}
          selectedAlgorithm={algorithm}
          onSelectAlgorithm={onAlgorithmChange}
        />
      </section>

      {/* Cluster Statistics Cards */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Cluster Overview
        </h2>
        <ClusterStatistics clusters={clusters} loading={loading} algorithm={algorithm} />
      </section>

      {/* Cluster Map - Full Width */}
      {/* <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Geographic Distribution
        </h2>
        <ClusterMap clusters={clusters} loading={loading} />
      </section> */}

      {/* Time Series Chart - Full Width */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Temporal Analysis
        </h2>
        <TimeSeriesChart data={timeseries} loading={loading} />
      </section>

      {/* Scatter Plot and Temporal AQI - Side by Side */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Correlation Analysis
          </h2>
          <ScatterPlot data={scatter} loading={loading} />
        </section>

        <section className="xl:col-span-1">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Health Impact
          </h2>
          <AQIDistribution 
            data={monthData.aqi_distribution} 
            totalObservations={monthData.total_observations} 
            loading={loading} 
          />
        </section>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Daily Location Patterns
        </h2>
        <HeatmapChart data={heatmap} loading={loading} />
      </section>
    </div>
  );
}
