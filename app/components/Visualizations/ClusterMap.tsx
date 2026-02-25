"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, AlertCircle } from "lucide-react";
import type { ClusterData } from "@/app/lib/types";

interface ClusterMapProps {
  clusters: ClusterData[];
  loading?: boolean;
}

const categoryColors = {
  Good: "bg-green-500",
  Moderate: "bg-yellow-500",
  "Unhealthy for Sensitive Groups": "bg-orange-500",
  Unhealthy: "bg-red-500",
  "Very Unhealthy": "bg-red-700",
};

export function ClusterMap({ clusters, loading }: ClusterMapProps) {
  if (loading) {
    return (
      <motion.div
        className="h-80 bg-muted rounded-lg"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    );
  }

  // Calculate map bounds based on coordinates
  const lats = clusters.map((c) => c.coordinates.lat);
  const lngs = clusters.map((c) => c.coordinates.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const padding = 0.05;
  const latRange = maxLat - minLat;
  const lngRange = maxLng - minLng;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-96 rounded-lg border border-border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 overflow-hidden"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Air Quality Clusters Map
      </h3>

      <div className="relative w-full h-full bg-gradient-to-b from-blue-400/20 to-blue-600/20 rounded border border-blue-200/30 dark:border-blue-800/30 overflow-hidden">
        {/* Map background */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`${minLng - padding * lngRange} ${minLat - padding * latRange} ${lngRange + padding * lngRange * 2} ${latRange + padding * latRange * 2}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid overlay */}
          <defs>
            <pattern
              id="grid"
              width="0.1"
              height="0.1"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 0.1 0 L 0 0 0 0.1"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.01"
                opacity="0.1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Cluster markers */}
          {clusters.map((cluster) => (
            <motion.g key={cluster.id}>
              {/* Pulse effect */}
              <circle
                cx={cluster.coordinates.lng}
                cy={cluster.coordinates.lat}
                r="0.08"
                fill="currentColor"
                opacity="0.1"
                className="text-primary"
              >
                <animate
                  attributeName="r"
                  values="0.08;0.15"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.3;0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Main marker */}
              <motion.circle
                cx={cluster.coordinates.lng}
                cy={cluster.coordinates.lat}
                r="0.05"
                className={
                  categoryColors[
                    cluster.air_quality_category as keyof typeof categoryColors
                  ]
                }
                whileHover={{ r: 0.08 }}
              />

              {/* Label */}
              <motion.text
                x={cluster.coordinates.lng}
                y={cluster.coordinates.lat - 0.08}
                textAnchor="middle"
                className="text-xs font-medium fill-foreground pointer-events-none select-none"
                fontSize="0.08"
              >
                {cluster.name.split(" ")[0]}
              </motion.text>
            </motion.g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur border border-border rounded p-3">
          <p className="text-xs font-medium text-foreground mb-2">
            Clusters Overview
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {clusters.map((cluster) => (
              <div key={cluster.id} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${categoryColors[cluster.air_quality_category as keyof typeof categoryColors]}`}
                />
                <span className="text-foreground">{cluster.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>Hover over markers to see detailed cluster information</p>
      </div>
    </motion.div>
  );
}
