"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, TrendingDown, TrendingUp, Zap } from "lucide-react";
import type { ProcessedMonth, Algorithm } from "@/app/lib/types";

interface AlgorithmComparisonProps {
  processedMonth: ProcessedMonth | null;
  loading?: boolean;
  selectedAlgorithm: Algorithm;
  onSelectAlgorithm: (alg: Algorithm) => void;
}

const ALGORITHMS: { key: Algorithm; label: string; color: string }[] = [
  { key: "kmeans", label: "K-Means", color: "from-blue-500/20 to-blue-600/10 border-blue-500/30" },
  { key: "dbscan", label: "DBSCAN", color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30" },
  { key: "hierarchical", label: "Hierarchical", color: "from-purple-500/20 to-purple-600/10 border-purple-500/30" },
];

function MetricRow({
  label,
  value,
  isBest,
  higherIsBetter,
}: {
  label: string;
  value: number;
  isBest: boolean;
  higherIsBetter: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs py-1.5 border-b border-border/30 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`font-mono font-semibold ${isBest ? "text-foreground" : "text-muted-foreground"}`}>
          {value.toFixed(4)}
        </span>
        {isBest && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
            BEST
          </span>
        )}
      </div>
    </div>
  );
}

export function AlgorithmComparison({
  processedMonth,
  loading,
  selectedAlgorithm,
  onSelectAlgorithm,
}: AlgorithmComparisonProps) {
  if (loading || !processedMonth) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-64 bg-muted rounded-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    );
  }

  const { kmeans, dbscan, hierarchical } = processedMonth;

  // Determine best per metric (silhouette & CH: higher better; DB: lower better)
  const bestSilhouette = Math.max(kmeans.silhouette, dbscan.silhouette, hierarchical.silhouette);
  const bestDB = Math.min(kmeans.davies_bouldin, dbscan.davies_bouldin, hierarchical.davies_bouldin);
  const bestCH = Math.max(kmeans.calinski_harabasz, dbscan.calinski_harabasz, hierarchical.calinski_harabasz);

  const algorithms = [
    { meta: ALGORITHMS[0], result: kmeans, extra: null },
    {
      meta: ALGORITHMS[1],
      result: dbscan,
      extra: `ε=${dbscan.eps} · min_samples=${dbscan.min_samples} · ${dbscan.n_noise} noise pts`,
    },
    {
      meta: ALGORITHMS[2],
      result: hierarchical,
      extra: `linkage: ${hierarchical.linkage_method}`,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Algorithm Comparison</h3>
        <span className="text-xs text-muted-foreground">({processedMonth.label})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {algorithms.map(({ meta, result, extra }) => {
          const isSelected = selectedAlgorithm === meta.key;
          return (
            <motion.button
              key={meta.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ translateY: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectAlgorithm(meta.key)}
              className={`text-left w-full rounded-xl border bg-gradient-to-br p-5 transition-all ${meta.color} ${
                isSelected
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-md opacity-80 hover:opacity-100"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground text-sm">{meta.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {result.n_clusters} cluster{result.n_clusters !== 1 ? "s" : ""}
                  </p>
                </div>
                {isSelected && <Award className="h-4 w-4 text-primary mt-0.5" />}
              </div>

              {/* Metrics */}
              <div className="space-y-0.5">
                <MetricRow
                  label="Silhouette ↑"
                  value={result.silhouette}
                  isBest={result.silhouette === bestSilhouette}
                  higherIsBetter
                />
                <MetricRow
                  label="Davies-Bouldin ↓"
                  value={result.davies_bouldin}
                  isBest={result.davies_bouldin === bestDB}
                  higherIsBetter={false}
                />
                <MetricRow
                  label="Calinski-Harabasz ↑"
                  value={result.calinski_harabasz}
                  isBest={result.calinski_harabasz === bestCH}
                  higherIsBetter
                />
              </div>

              {/* Extra info */}
              {extra && (
                <p className="mt-3 text-[10px] text-muted-foreground font-mono bg-muted/40 rounded px-2 py-1">
                  {extra}
                </p>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
