"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookmarkIcon, MapPin, X } from "lucide-react";
import type { BookmarkedLocation } from "@/app/lib/types";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await fetch("/api/bookmarks");
        const data = await res.json();
        setBookmarks(data.data);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (bookmarkId: string) => {
    setDeleting(bookmarkId);
    try {
      // In a real app, would call DELETE endpoint
      const newBookmarks = bookmarks.filter((bm) => bm.id !== bookmarkId);
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error("Error removing bookmark:", error);
    } finally {
      setDeleting(null);
    }
  };

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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
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
          {bookmarks.map((bookmark) => (
            <motion.div
              key={bookmark.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ translateY: -4 }}
              className="rounded-lg border border-border bg-card p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">
                    {bookmark.location_name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(bookmark.created_at).toLocaleDateString()}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                  disabled={deleting === bookmark.id}
                  className="p-2 rounded-md hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                </motion.button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {bookmark.coordinates.lat.toFixed(2)},{" "}
                    {bookmark.coordinates.lng.toFixed(2)}
                  </span>
                </div>

                {bookmark.cluster_id && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Cluster</p>
                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                      {bookmark.cluster_id}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
