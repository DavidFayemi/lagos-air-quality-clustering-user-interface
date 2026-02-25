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

const clusterColors: Record<string, string> = {
  Lekki: "hsl(var(--chart-1))",
  Ikeja: "hsl(var(--chart-2))",
  VI: "hsl(var(--chart-3))",
  Ikoyi: "hsl(var(--chart-4))",
  Yaba: "hsl(var(--chart-5))",
};

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full h-80 rounded-lg border border-border bg-card p-6"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">
        PM2.5 vs Temperature
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="temperature"
            name="Temperature (°C)"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            dataKey="pm25"
            name="PM2.5 (µg/m³)"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            cursor={{ strokeDasharray: "3 3" }}
          />
          <Legend />
          {Object.entries(
            data.reduce(
              (acc, point) => {
                if (!acc[point.cluster]) {
                  acc[point.cluster] = [];
                }
                acc[point.cluster].push(point);
                return acc;
              },
              {} as Record<string, ScatterData[]>,
            ),
          ).map(([cluster, points]) => (
            <Scatter key={cluster} name={cluster} data={points}>
              {points.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={clusterColors[cluster] || "#8884d8"}
                />
              ))}
            </Scatter>
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
