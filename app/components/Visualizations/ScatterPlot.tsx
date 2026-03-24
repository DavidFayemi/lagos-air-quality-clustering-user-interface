"use client";

import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import type { ScatterData } from "@/app/lib/types";

interface ScatterPlotProps {
  data: ScatterData[];
  loading?: boolean;
}

// Palette that cycles for any number of cluster labels
const PALETTE = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#a78bfa",
  "#34d399",
  "#fb923c",
  "#60a5fa",
  "#f472b6",
];

const NOISE_COLOR = "hsl(var(--muted-foreground))";

function getClusterColor(label: string, allLabels: string[]): string {
  if (label === "Noise") return NOISE_COLOR;
  const idx = allLabels.filter((l) => l !== "Noise").indexOf(label);
  return PALETTE[idx % PALETTE.length] ?? "#8884d8";
}

export function ScatterPlot({ data, loading }: ScatterPlotProps) {
  if (loading) {
    return (
      <motion.div
        className="h-80 bg-muted rounded-lg"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    );
  }

  // Group by cluster label
  const grouped = data.reduce(
    (acc, point) => {
      if (!acc[point.cluster]) acc[point.cluster] = [];
      acc[point.cluster].push(point);
      return acc;
    },
    {} as Record<string, ScatterData[]>
  );

  const allLabels = Object.keys(grouped).sort();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full h-80 rounded-lg border border-border bg-card p-6"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">
        PM2.5 vs Temperature — by Cluster
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="temperature"
            name="Temperature (°C)"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
            label={{
              value: "Temp (°C)",
              position: "insideBottomRight",
              offset: -5,
              style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" },
            }}
          />
          <YAxis
            dataKey="pm25"
            name="PM2.5 (µg/m³)"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
            label={{
              value: "PM2.5",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)}`,
              name,
            ]}
          />
          <Legend />
          {allLabels.map((label) => (
            <Scatter
              key={label}
              name={label}
              data={grouped[label]}
              fill={getClusterColor(label, allLabels)}
            >
              {grouped[label].map((_, i) => (
                <Cell
                  key={i}
                  fill={getClusterColor(label, allLabels)}
                  opacity={label === "Noise" ? 0.4 : 0.75}
                />
              ))}
            </Scatter>
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
