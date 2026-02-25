"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Detailed analysis and insights about air quality trends
        </p>
      </div>

      {/* Placeholder */}
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center mb-4"
        >
          <BarChart3 className="h-12 w-12 text-muted-foreground" />
        </motion.div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Coming Soon
        </h2>
        <p className="text-muted-foreground">
          Advanced analytics features are currently being developed. Check back
          soon!
        </p>
      </div>
    </motion.div>
  );
}
