"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Bookmark } from "lucide-react";
import type { LocationData } from "@/app/lib/types";

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("/api/visualizations/locations");
        const data = await res.json();
        setLocations(data.data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Locations</h1>
        <p className="text-muted-foreground mt-1">
          Monitor air quality across different areas of Lagos
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {locations.map((location) => (
            <motion.div
              key={location.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ translateY: -4 }}
              className="rounded-lg border border-border bg-card p-6 cursor-pointer hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">
                    {location.name}
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-md hover:bg-accent transition-colors"
                >
                  <Bookmark className="h-5 w-5 text-muted-foreground" />
                </motion.button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {location.coordinates.lat.toFixed(2)},{" "}
                    {location.coordinates.lng.toFixed(2)}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Clusters</p>
                  <div className="flex flex-wrap gap-1">
                    {location.clusters.map((cluster) => (
                      <span
                        key={cluster}
                        className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                      >
                        {cluster}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
