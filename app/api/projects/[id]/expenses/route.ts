import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// GET troškovi projekta
export async function GET(req: Request, { params }: { params: { id: string } | Promise<{ id: string }> }) {
  try {
    // Ako je params Promise, await-ujemo ga
    const resolvedParams = await params
    const projectId = resolvedParams.id

    const [expenses]: any = await db.query(
      "SELECT * FROM project_expenses WHERE project_id = ? ORDER BY created_at DESC",
      [projectId]
    )

    return NextResponse.json({ expenses })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ expenses: [], error: "Greška pri učitavanju troškova" }, { status: 500 })
  }
}

// POST novi trošak
export async function POST(req: Request, { params }: { params: { id: string } | Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const projectId = resolvedParams.id

    const body = await req.json()
    const { description, amount } = body

    await db.query(
      "INSERT INTO project_expenses (project_id, description, amount) VALUES (?, ?, ?)",
      [projectId, description, amount]
    )

    return NextResponse.json({ message: "Trošak dodat" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Greška pri dodavanju troška" }, { status: 500 })
  }
}