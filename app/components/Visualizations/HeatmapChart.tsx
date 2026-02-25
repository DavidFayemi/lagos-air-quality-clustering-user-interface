"use client";

import React from "react";
import { motion } from "framer-motion";
import type { HeatmapData } from "@/app/lib/types";

interface HeatmapChartProps {
  data: HeatmapData[];
  loading?: boolean;
}

const getHeatmapColor = (value: number) => {
  if (value < 20) return "bg-green-400";
  if (value < 35) return "bg-yellow-400";
  if (value < 50) return "bg-orange-400";
  return "bg-red-400";
};

export function HeatmapChart({ data, loading }: HeatmapChartProps) {
  if (loading) {
    return (
      <motion.div
        className="h-80 bg-muted rounded-lg"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    );
  }

  const locations = Array.from(new Set(data.map((d) => d.y))).sort();
  const times = Array.from(new Set(data.map((d) => d.x))).sort();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full rounded-lg border border-border bg-card p-6"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Pollution Levels by Time & Location
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left p-2 font-medium text-muted-foreground">
                Location
              </th>
              {times.map((time) => (
                <th
                  key={time}
                  className="text-center p-2 font-medium text-muted-foreground"
                >
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {locations.map((location) => (
              <tr key={location}>
                <td className="text-left p-2 font-medium text-foreground">
                  {location}
                </td>
                {times.map((time) => {
                  const cellData = data.find(
                    (d) => d.x === time && d.y === location,
                  );
                  const value = cellData?.value || 0;
                  return (
                    <motion.td
                      key={`${location}-${time}`}
                      whileHover={{ scale: 1.1 }}
                      className="text-center p-2"
                    >
                      <div
                        className={`${getHeatmapColor(value)} rounded p-2 text-white font-semibold transition-all`}
                        title={`${location} at ${time}: ${value} µg/m³`}
                      >
                        {value}
                      </div>
                    </motion.td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 rounded" />
          <span>Good ({"<"}20)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded" />
          <span>Moderate (20-35)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-400 rounded" />
          <span>Unhealthy (35-50)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 rounded" />
          <span>Hazardous ({">"}50)</span>
        </div>
      </div>
    </motion.div>
  );
}
