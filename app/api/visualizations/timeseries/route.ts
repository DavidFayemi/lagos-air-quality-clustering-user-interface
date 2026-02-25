import { NextResponse } from "next/server";
import { mockTimeSeriesData } from "@/app/lib/mockData";
import type { ApiResponse } from "@/app/lib/types";

export async function GET(): Promise<
  NextResponse<ApiResponse<typeof mockTimeSeriesData>>
> {
  try {
    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      data: mockTimeSeriesData,
    });
  } catch (error) {
    console.error("Error fetching timeseries data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch timeseries data",
      },
      { status: 500 },
    );
  }
}
