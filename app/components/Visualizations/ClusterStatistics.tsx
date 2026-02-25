"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, TrendingUp } from "lucide-react";
import type { ClusterData } from "@/app/lib/types";

interface ClusterStatisticsProps {
  clusters: ClusterData[];
  loading?: boolean;
}

const categoryColors = {
  Good: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Moderate:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "Unhealthy for Sensitive Groups":
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  Unhealthy: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "Very Unhealthy":
    "bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200",
};

export function ClusterStatistics({
  clusters,
  loading,
}: ClusterStatisticsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {clusters.slice(0, 3).map((cluster) => (
        <motion.div
          key={cluster.id}
          variants={itemVariants}
          whileHover={{ translateY: -4 }}
          className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-sm mb-1">
                {cluster.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {cluster.location}
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">PM2.5</p>
                <p className="font-bold text-foreground">
                  {cluster.pm25_avg.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">PM10</p>
                <p className="font-bold text-foreground">
                  {cluster.pm10_avg.toFixed(1)}
                </p>
              </div>
            </div>

            <div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  categoryColors[
                    cluster.air_quality_category as keyof typeof categoryColors
                  ]
                }`}
              >
                <AlertCircle className="h-3 w-3" />
                {cluster.air_quality_category}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {cluster.reading_count} readings analyzed
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
