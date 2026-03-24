import { NextRequest, NextResponse } from "next/server";
import { fetchMonthData, getPreviousMonth } from "@/app/lib/apiClient";
import { buildLocationData } from "@/app/lib/dataTransformers";
import type { ApiResponse, LocationData, Algorithm } from "@/app/lib/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<LocationData[]>>> {
  try {
    const { searchParams } = request.nextUrl;
    const algorithm = (searchParams.get("algorithm") ?? "kmeans") as Algorithm;
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
    const data = buildLocationData(daily_observations, algorithm);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[/api/visualizations/locations]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch location data" },
      { status: 500 }
    );
  }
}
