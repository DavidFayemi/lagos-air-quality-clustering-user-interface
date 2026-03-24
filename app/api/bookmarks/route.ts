import { NextResponse, type NextRequest } from "next/server";
import { mockBookmarkedLocations } from "@/app/lib/mockData";
import type { ApiResponse, BookmarkedLocation } from "@/app/lib/types";

// GET: Fetch all bookmarks
export async function GET(): Promise<
  NextResponse<ApiResponse<BookmarkedLocation[]>>
> {
  try {
    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      data: mockBookmarkedLocations,
    });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bookmarks",
      },
      { status: 500 },
    );
  }
}

// POST: Add a bookmark
export async function POST(request: NextRequest): Promise<
  NextResponse<ApiResponse<BookmarkedLocation>>
> {
  try {
    const body = await request.json() as Partial<BookmarkedLocation>;

    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Create a new bookmark (in a real app, this would be saved to DB)
    const newBookmark: BookmarkedLocation = {
      id: `bm_${Date.now()}`,
      user_id: body.user_id || "user_1",
      location_name: body.location_name || "",
      coordinates: body.coordinates || { lat: 0, lng: 0 },
      cluster_id: body.cluster_id,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newBookmark,
    });
  } catch (error) {
    console.error("Error creating bookmark:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create bookmark",
      },
      { status: 500 },
    );
  }
}
