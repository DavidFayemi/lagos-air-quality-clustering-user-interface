import { NextRequest, NextResponse } from "next/server";
import { fetchMonthData, getPreviousMonth } from "@/app/lib/apiClient";
import { buildHeatmap } from "@/app/lib/dataTransformers";
import type { ApiResponse, HeatmapData } from "@/app/lib/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<HeatmapData[]>>> {
  try {
    const { searchParams } = request.nextUrl;
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    const { year: prevYear, monthName: prevMonth } = getPreviousMonth();
    const targetYear = year ? Number(year) : prevYear;
    const targetMonth = month ?? prevMonth;

    const monthData = await fetchMonthData(targetYear, targetMonth);
    
    if (!monthData) {
      return NextResponse.json(
        { success: false, error: "DATA_NOT_FOUND" },
        { status: 404 }
      );
    }

    const { daily_observations } = monthData;
    const data = buildHeatmap(daily_observations);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[/api/visualizations/heatmap]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch heatmap data" },
      { status: 500 }
    );
  }
}
