import { NextResponse } from "next/server";
import { mockLocations } from "@/app/lib/mockData";
import type { ApiResponse } from "@/app/lib/types";

export async function GET(): Promise<
  NextResponse<ApiResponse<typeof mockLocations>>
> {
  try {
    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      data: mockLocations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch locations",
      },
      { status: 500 },
    );
  }
}
