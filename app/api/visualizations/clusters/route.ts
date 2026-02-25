import { NextResponse } from "next/server";
import { mockClusterData } from "@/app/lib/mockData";
import type { ApiResponse } from "@/app/lib/types";

export async function GET(): Promise<
  NextResponse<ApiResponse<typeof mockClusterData>>
> {
  // This is a stub API route that returns mock data
  // In production, this would fetch from your actual backend API

  try {
    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      data: mockClusterData,
    });
  } catch (error) {
    console.error("Error fetching cluster data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cluster data",
      },
      { status: 500 },
    );
  }
}
