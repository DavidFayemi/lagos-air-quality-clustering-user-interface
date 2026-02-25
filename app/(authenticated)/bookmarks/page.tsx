"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookmarkIcon } from "lucide-react";

export default function BookmarksPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bookmarks</h1>
        <p className="text-muted-foreground mt-1">
          Your favorite locations and reports
        </p>
      </div>

      {/* Placeholder */}
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center mb-4"
        >
          <BookmarkIcon className="h-12 w-12 text-muted-foreground" />
        </motion.div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          No Bookmarks Yet
        </h2>
        <p className="text-muted-foreground">
          Visit the Locations page and bookmark your favorite areas to see them
          here.
        </p>
      </div>
    </motion.div>
  );
}
