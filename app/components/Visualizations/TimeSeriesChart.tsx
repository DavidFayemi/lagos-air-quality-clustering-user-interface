"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import type { TimeSeriesDataPoint } from "@/app/lib/types";

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  loading?: boolean;
}

export function TimeSeriesChart({ data, loading }: TimeSeriesChartProps) {
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
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full h-80 rounded-lg border border-border bg-card p-6"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Air Quality Trends
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <YAxis
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
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="pm1"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={false}
            name="PM1"
          />
          <Line
            type="monotone"
            dataKey="pm25"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={false}
            name="PM2.5"
          />
          <Line
            type="monotone"
            dataKey="pm10"
            stroke="hsl(var(--chart-3))"
            strokeWidth={2}
            dot={false}
            name="PM10"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
