"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Wind } from "lucide-react";
import type { AQIDistributionEntry } from "@/app/lib/dataTransformers";

interface AQIDistributionProps {
  data: AQIDistributionEntry[];
  totalObservations: number;
  loading?: boolean;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: AQIDistributionEntry }[];
}) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-0.5">{entry.name}</p>
      <p className="text-muted-foreground">
        {entry.value} day{entry.value !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

export function AQIDistribution({
  data,
  totalObservations,
  loading,
}: AQIDistributionProps) {
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
      transition={{ duration: 0.5, delay: 0.15 }}
      className="w-full rounded-lg border border-border bg-card p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Wind className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          AQI Category Distribution
        </h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {totalObservations} sensor-days
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              animationBegin={0}
              animationDuration={600}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Percentage breakdown below chart */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground truncate">{entry.name}</span>
            <span className="ml-auto font-medium text-foreground tabular-nums">
              {((entry.value / totalObservations) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
