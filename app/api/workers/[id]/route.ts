import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const workerId = Number(id)

  // dohvat radnika
  const [rows]: any = await db.query(
    "SELECT * FROM workers WHERE id = ?",
    [workerId]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: "Radnik nije pronađen" }, { status: 404 })
  }

  const worker = rows[0]

  // dohvat unosa sati za radnika
  const [entries]: any = await db.query(`
    SELECT we.*, p.name AS project_name,
           (we.hours * w.hourly_rate) AS total_earned
    FROM work_entries we
    JOIN projects p ON we.project_id = p.id
    JOIN workers w ON we.worker_id = w.id
    WHERE we.worker_id = ?
    ORDER BY we.work_date DESC
  `, [workerId])

  return NextResponse.json({ worker, entries })
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const { first_name, last_name, hourly_rate } = body

    await db.query(
      "UPDATE workers SET first_name = ?, last_name = ?, hourly_rate = ? WHERE id = ?",
      [first_name, last_name, hourly_rate, id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Greška pri ažuriranju" },
      { status: 500 }
    )
  }
}