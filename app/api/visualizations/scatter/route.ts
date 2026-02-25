import { NextResponse } from "next/server";
import { mockScatterData } from "@/app/lib/mockData";
import type { ApiResponse } from "@/app/lib/types";

export async function GET(): Promise<
  NextResponse<ApiResponse<typeof mockScatterData>>
> {
  try {
    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      data: mockScatterData,
    });
  } catch (error) {
    console.error("Error fetching scatter data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch scatter data",
      },
      { status: 500 },
    );
  }
}
