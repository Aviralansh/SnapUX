import { NextResponse } from "next/server"

// Mock database for demo purposes
const frictionPoints = [
  {
    id: "fp1",
    page: "Checkout",
    element: "Payment Form",
    issue: "Form validation errors not clearly visible",
    severity: "high",
    occurrences: 24,
    lastSeen: "10 minutes ago",
    url: "https://example.com/checkout",
  },
  {
    id: "fp2",
    page: "Product Detail",
    element: "Add to Cart Button",
    issue: "Button not visible without scrolling on mobile",
    severity: "medium",
    occurrences: 18,
    lastSeen: "25 minutes ago",
    url: "https://example.com/product/123",
  },
  {
    id: "fp3",
    page: "Homepage",
    element: "Navigation Menu",
    issue: "Dropdown menu closes too quickly",
    severity: "low",
    occurrences: 12,
    lastSeen: "1 hour ago",
    url: "https://example.com",
  },
  {
    id: "fp4",
    page: "Search Results",
    element: "Filter Panel",
    issue: "Filter options not working on Safari",
    severity: "high",
    occurrences: 32,
    lastSeen: "2 hours ago",
    url: "https://example.com/search?q=shoes",
  },
  {
    id: "fp5",
    page: "Cart",
    element: "Quantity Selector",
    issue: "Users repeatedly clicking increment button",
    severity: "medium",
    occurrences: 15,
    lastSeen: "3 hours ago",
    url: "https://example.com/cart",
  },
]

export async function GET() {
  return NextResponse.json(frictionPoints)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // In a real app, you would validate the data and save to a database
    const newFrictionPoint = {
      id: `fp${frictionPoints.length + 1}`,
      ...body,
      lastSeen: "Just now",
      occurrences: 1,
    }

    // Check if this friction point already exists
    const existingIndex = frictionPoints.findIndex(
      (fp) => fp.page === body.page && fp.element === body.element && fp.issue === body.issue,
    )

    if (existingIndex >= 0) {
      // Update existing friction point
      frictionPoints[existingIndex].occurrences += 1
      frictionPoints[existingIndex].lastSeen = "Just now"
      return NextResponse.json(frictionPoints[existingIndex])
    }

    frictionPoints.push(newFrictionPoint)

    return NextResponse.json(newFrictionPoint, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
