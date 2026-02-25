"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { LogOut, Settings, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white text-xs font-bold">
          {user?.email?.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:inline max-w-[100px] truncate">
          {user?.email}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-popover shadow-lg z-50"
          >
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {user?.user_metadata?.full_name || "User"}
              </p>
            </div>

            <div className="p-2 space-y-1">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 rounded px-3 py-2 text-sm text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-left"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
