import { NextRequest, NextResponse } from "next/server";
import { fetchMonthData, getPreviousMonth } from "@/app/lib/apiClient";
import { buildAQIDistribution } from "@/app/lib/dataTransformers";
import type { ApiResponse, ProcessedMonth } from "@/app/lib/types";
import type { AQIDistributionEntry } from "@/app/lib/dataTransformers";

type MonthSummaryResponse = {
  processed_month: ProcessedMonth;
  aqi_distribution: AQIDistributionEntry[];
  total_observations: number;
};

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<MonthSummaryResponse>>> {
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

    const { processed_month, daily_observations } = monthData;

    return NextResponse.json({
      success: true,
      data: {
        processed_month,
        aqi_distribution: buildAQIDistribution(daily_observations),
        total_observations: daily_observations.length,
      },
    });
  } catch (error) {
    console.error("[/api/visualizations/month]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch month summary" },
      { status: 500 }
    );
  }
}
