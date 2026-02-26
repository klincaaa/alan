import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const projectId = Number(id)

  // Dohvati projekat
  const [rows]: any = await db.query(
    "SELECT * FROM projects WHERE id = ?",
    [projectId]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: "Projekat nije pronađen" }, { status: 404 })
  }

  const project = rows[0]

  // Dohvati sve unose sati za projekat
  const [entries]: any = await db.query(`
    SELECT we.*, w.first_name, w.last_name, w.hourly_rate
FROM work_entries we
JOIN workers w ON we.worker_id = w.id
WHERE we.project_id = ?
  `, [projectId])

  // Dohvati sve aktivne radnike za dropdown
  const [workers]: any = await db.query(
    "SELECT id, first_name, last_name FROM workers WHERE active = true"
  )

  return NextResponse.json({ project, entries, workers })
}