"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border border-border bg-card p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold text-foreground">
          Profile Information
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full px-4 py-2 rounded-md border border-input bg-muted text-foreground cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={user?.user_metadata?.full_name || "Not set"}
              readOnly
              className="w-full px-4 py-2 rounded-md border border-input bg-muted text-foreground cursor-not-allowed"
            />
          </div>
        </div>
      </motion.div>

      {/* Theme Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg border border-border bg-card p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold text-foreground">Appearance</h2>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Theme
          </label>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border-2 transition-colors ${
                theme === "light"
                  ? "border-primary bg-primary/10"
                  : "border-input bg-background hover:border-primary/50"
              }`}
            >
              <Sun className="h-4 w-4" />
              Light
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border-2 transition-colors ${
                theme === "dark"
                  ? "border-primary bg-primary/10"
                  : "border-input bg-background hover:border-primary/50"
              }`}
            >
              <Moon className="h-4 w-4" />
              Dark
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme("system")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border-2 transition-colors ${
                theme === "system"
                  ? "border-primary bg-primary/10"
                  : "border-input bg-background hover:border-primary/50"
              }`}
            >
              <span>System</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>

        <div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </motion.button>

          <p className="text-xs text-muted-foreground mt-2">
            You will be logged out and redirected to the login page.
          </p>
        </div>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-4 bg-primary/5 border border-primary/20 rounded-md"
      >
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Additional account settings such as password
          change and account deletion features will be available in a future
          update.
        </p>
      </motion.div>
    </motion.div>
  );
}
