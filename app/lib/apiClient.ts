/**
 * API client for the Lagos Air Quality backend.
 *
 * Base URL: https://final-year-project-api-qbur.onrender.com
 * Endpoint:  GET /data/:year/:month  (e.g. /data/2026/february)
 *
 * The server is hosted on a free Render plan and may cold-start (30 s).
 * Server-side callers use Next.js `fetch` with a 60 s timeout + no-store
 * so data is always fresh.
 */

import type { MonthApiResponse } from "@/app/lib/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://final-year-project-api-qbur.onrender.com";

import fs from "fs/promises";
import path from "path";

/**
 * Fetch processed_month + daily_observations for a given year and month.
 * Falls back to local JSON files if the remote API fails.
 *
 * @param year  e.g. 2026
 * @param month full month name, lower-case  e.g. "february"
 */
export async function fetchMonthData(
  year: number | string,
  month: string
): Promise<MonthApiResponse | null> {
  const url = `${BASE_URL}/data/${year}/${month.toLowerCase()}`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(60_000), // allow 60 s for Render cold-start
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error(
        `Backend returned ${res.status} for ${url}: ${await res.text()}`
      );
    }

    const data = await res.json();
    return {
      processed_month: data.month,
      daily_observations: data.observations,
    } as MonthApiResponse;
  } catch (error) {
    console.error(`[API Error] Failed to fetch from ${url}, attempting local fallback:`, error);
    
    try {
      // Fallback to reading the local JSON files
      const projectRoot = process.cwd();
      
      const processedMonthsRaw = await fs.readFile(
        path.join(projectRoot, "lagos_air_quality.processed_months.json"),
        "utf-8"
      );
      // Clean MongoDB Extended JSON ($date) out before parsing to avoid Next.js serialization issues later
      const cleanProcessedMonthsRaw = processedMonthsRaw.replace(/"\$date":\s*"([^"]+)"/g, '"$1"');
      const processedMonths = JSON.parse(cleanProcessedMonthsRaw);
      
      let processed_month = Array.isArray(processedMonths) 
        ? processedMonths.find(m => String(m.year) === String(year) && m.label.toLowerCase().includes(month.toLowerCase()))
        : null;
        
      if (!processed_month && Array.isArray(processedMonths) && processedMonths.length > 0) {
        processed_month = processedMonths[0]; // fallback to first
      }

      if (!processed_month) {
        // In the fallback, if we truly can't find the month, it's a 404, not a 500
        console.warn(`Local fallback: No processed_month found for ${month} ${year}`);
        return null;
      }

      // Handle raw _id from mongo if it's an object
      const monthId = typeof processed_month._id === 'object' && processed_month._id.$oid 
        ? processed_month._id.$oid 
        : processed_month._id;

      const dailyObsRaw = await fs.readFile(
        path.join(projectRoot, "lagos_air_quality.daily_observations.json"),
        "utf-8"
      );
      // Clean up any potential mongo extended json in here too
      const cleanDailyObsRaw = dailyObsRaw.replace(/"\$date":\s*"([^"]+)"/g, '"$1"');
      const allDailyObservations = JSON.parse(cleanDailyObsRaw);
      
      let daily_observations = Array.isArray(allDailyObservations) ? allDailyObservations : [];
      
      // Filter observations to only those matching the exact month
      if (monthId) {
         const filtered = daily_observations.filter((obs: any) => {
           const obsMonthId = typeof obs.month_id === 'object' && obs.month_id.$oid ? obs.month_id.$oid : obs.month_id;
           return obsMonthId === monthId;
         });
         
         if (filtered.length > 0) {
           daily_observations = filtered;
         }
      }

      console.log(`[API Fallback] Successfully loaded ${daily_observations.length} observations from local JSON files.`);
      
      return {
        processed_month,
        daily_observations
      };
      
    } catch (fallbackError) {
      console.error("[API Fallback Error] Could not read local JSON files either:", fallbackError);
      throw error; // throw original fetch error
    }
  }
}

/**
 * Returns {year, monthName} for the previous calendar month.
 * Used as the default when no query params are provided.
 */
export function getPreviousMonth(): { year: number; monthName: string } {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthName = d
    .toLocaleString("en-US", { month: "long" })
    .toLowerCase();
  return { year: d.getFullYear(), monthName };
}

/**
 * Helper: convert numeric month (1-based) to lowercase full name.
 * e.g. 2 → "february"
 */
export function monthNumberToName(n: number): string {
  return new Date(2000, n - 1, 1)
    .toLocaleString("en-US", { month: "long" })
    .toLowerCase();
}
