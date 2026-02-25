import { NextResponse } from "next/server";
import { mockHeatmapData } from "@/app/lib/mockData";
import type { ApiResponse } from "@/app/lib/types";

export async function GET(): Promise<
  NextResponse<ApiResponse<typeof mockHeatmapData>>
> {
  try {
    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      data: mockHeatmapData,
    });
  } catch (error) {
    console.error("Error fetching heatmap data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch heatmap data",
      },
      { status: 500 },
    );
  }
}
