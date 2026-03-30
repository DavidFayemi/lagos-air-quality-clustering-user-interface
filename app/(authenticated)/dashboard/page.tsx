"use client";

import React, { useState, useEffect } from "react";
import { VisualizationGrid } from "@/app/components/Visualizations/VisualizationGrid";
import type {
  ClusterData,
  TimeSeriesDataPoint,
  ScatterData,
  HeatmapData,
  Algorithm,
  ProcessedMonth,
} from "@/app/lib/types";
import type { AQIDistributionEntry } from "@/app/lib/dataTransformers";
import { motion } from "framer-motion";
import { RefreshCw, CalendarDays, AlertCircle } from "lucide-react";

const START_YEAR = 2024;
const START_MONTH = 0; // January is 0

function generateMonthOptions() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const options = [];
  
  for (let year = currentYear; year >= START_YEAR; year--) {
    const maxMonth = year === currentYear ? currentMonth : 11;
    const minMonth = year === START_YEAR ? START_MONTH : 0;
    
    for (let month = maxMonth; month >= minMonth; month--) {
      const date = new Date(year, month);
      const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      const monthName = date.toLocaleString('default', { month: 'long' }).toLowerCase();
      options.push({ value: `${year}-${monthName}`, label, year, month: monthName });
    }
  }
  return options;
}

export default function DashboardPage() {
  const monthOptions = React.useMemo(() => generateMonthOptions(), []);
  // Default to the most recent month option
  const defaultOption = monthOptions[0];
  
  const [algorithm, setAlgorithm] = useState<Algorithm>("kmeans");
  const [targetYear, setTargetYear] = useState<number>(defaultOption.year);
  const [targetMonth, setTargetMonth] = useState<string>(defaultOption.month);
  
  const [dataNotAvailable, setDataNotAvailable] = useState(false);

  const [monthData, setMonthData] = useState<{
    processed_month: ProcessedMonth | null;
    aqi_distribution: AQIDistributionEntry[];
    total_observations: number;
  }>({
    processed_month: null,
    aqi_distribution: [],
    total_observations: 0,
  });
  
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [timeseries, setTimeseries] = useState<TimeSeriesDataPoint[]>([]);
  const [scatter, setScatter] = useState<ScatterData[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async (
    selectedAlgorithm: Algorithm = algorithm,
    year: number = targetYear,
    month: string = targetMonth
  ) => {
    try {
      setLoading(true);
      setError(null);
      setDataNotAvailable(false);

      const [monthRes, clustersRes, timeseriesRes, scatterRes, heatmapRes] =
        await Promise.all([
          fetch(`/api/visualizations/month?year=${year}&month=${month}`),
          fetch(`/api/visualizations/clusters?algorithm=${selectedAlgorithm}&year=${year}&month=${month}`),
          fetch(`/api/visualizations/timeseries?year=${year}&month=${month}`),
          fetch(`/api/visualizations/scatter?algorithm=${selectedAlgorithm}&year=${year}&month=${month}`),
          fetch(`/api/visualizations/heatmap?year=${year}&month=${month}`),
        ]);

      if (monthRes.status === 404 || clustersRes.status === 404) {
        setDataNotAvailable(true);
        // Clear previous data
        setClusters([]);
        setTimeseries([]);
        setScatter([]);
        setHeatmap([]);
        return;
      }

      if (
        !monthRes.ok ||
        !clustersRes.ok ||
        !timeseriesRes.ok ||
        !scatterRes.ok ||
        !heatmapRes.ok
      ) {
        throw new Error("Failed to fetch visualization data");
      }

      const [monthJson, clustersJson, timeseriesJson, scatterJson, heatmapJson] =
        await Promise.all([
          monthRes.json(),
          clustersRes.json(),
          timeseriesRes.json(),
          scatterRes.json(),
          heatmapRes.json(),
        ]);

      setMonthData(monthJson.data);
      setClusters(clustersJson.data);
      setTimeseries(timeseriesJson.data);
      setScatter(scatterJson.data);
      setHeatmap(heatmapJson.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard data. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchData(algorithm, targetYear, targetMonth);
  }, []);

  // Soft fetch when switching algorithm
  const handleAlgorithmChange = (newAlg: Algorithm) => {
    setAlgorithm(newAlg);
    fetchData(newAlg, targetYear, targetMonth);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = monthOptions.find((o) => o.value === e.target.value);
    if (selected) {
      setTargetYear(selected.year);
      setTargetMonth(selected.month);
      fetchData(algorithm, selected.year, selected.month);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <div className="text-muted-foreground mt-1 flex items-center gap-2">
            Real-time air quality monitoring for Lagos
            <div className="relative flex items-center ml-2">
              <CalendarDays className="h-4 w-4 absolute left-2 text-primary pointer-events-none" />
              <select
                value={`${targetYear}-${targetMonth}`}
                onChange={handleMonthChange}
                disabled={loading}
                className="pl-8 pr-3 py-1 bg-secondary text-secondary-foreground text-sm font-medium rounded-md appearance-none outline-none cursor-pointer hover:bg-secondary/80 focus:ring-2 focus:ring-primary/50 transition-colors disabled:opacity-50"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fetchData(algorithm, targetYear, targetMonth)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </motion.button>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground"
        >
          Last updated: {lastUpdated.toLocaleTimeString()}
        </motion.p>
      )}

      {/* Error Message */}
      {error && !dataNotAvailable && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-destructive/10 border border-destructive/20 rounded-md"
        >
          <p className="text-sm text-destructive">{error}</p>
        </motion.div>
      )}

      {/* No Data Available Yellow Alert */}
      {dataNotAvailable && (
        <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md flex items-center gap-3"
        >
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Pipeline data not available for this month. 
            <span className="font-normal block mt-0.5 opacity-80">
              The clustering models may not have enough data, or sensors were offline. Please select another month.
            </span>
          </p>
        </motion.div>
      )}

      {/* Visualization Grid */}
      {!error && !dataNotAvailable && (
        <VisualizationGrid
          monthData={monthData}
          algorithm={algorithm}
          onAlgorithmChange={handleAlgorithmChange}
          clusters={clusters}
          timeseries={timeseries}
          scatter={scatter}
          heatmap={heatmap}
          loading={loading}
        />
      )}
    </motion.div>
  );
}
