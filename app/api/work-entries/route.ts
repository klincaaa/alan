import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()

  // Pretvori workDate u yyyy-mm-dd format
  let workDate: string
  if (body.workDate) {
    const d = new Date(body.workDate)
    workDate = d.toISOString().split("T")[0] // uzima samo datum
  } else {
    workDate = new Date().toISOString().split("T")[0]
  }

  await db.query(
    "INSERT INTO work_entries (worker_id, project_id, work_date, hours, note) VALUES (?, ?, ?, ?, ?)",
    [body.workerId, body.projectId, workDate, body.hours, body.note]
  )

  return NextResponse.json({ message: "Unos je dodat" })
}