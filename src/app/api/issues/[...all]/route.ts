import { NextRequest, NextResponse } from "next/server"
import { getReport } from "@/actions/createReport" // your server action

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const id = Number(context.params.id)
  console.log(id)
  console.log("id")
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

  try {
    const report = await getReport(id)
    if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(report)
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 })
  }
}