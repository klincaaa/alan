import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const { id: projectId, expenseId } = await context.params // <-- unwrap params
    const body = await req.json()
    const { description, amount } = body

    if (!description || !amount) {
      return NextResponse.json(
        { error: "Opis i iznos su obavezni" },
        { status: 400 }
      )
    }

    await db.query(
      "UPDATE project_expenses SET description = ?, amount = ? WHERE id = ? AND project_id = ?",
      [description, amount, expenseId, projectId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Greška pri ažuriranju troška" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const { id: projectId, expenseId } = await context.params // <-- unwrap params

    await db.query(
      "DELETE FROM project_expenses WHERE id = ? AND project_id = ?",
      [expenseId, projectId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Greška pri brisanju troška" },
      { status: 500 }
    )
  }
}