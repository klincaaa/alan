import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await context.params
  
      await db.query(
        "DELETE FROM work_entries WHERE id = ?",
        [id]
      )
  
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error(error)
      return NextResponse.json(
        { error: "Greška pri brisanju" },
        { status: 500 }
      )
    }
  }

  export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await context.params
      const { hours, note, workDate } = await req.json()
  
      // Formatiraj datum u YYYY-MM-DD
      const date = new Date(workDate)
      const formattedDate = date.toISOString().split("T")[0] // samo datum, bez vremena
  
      await db.query(
        "UPDATE work_entries SET hours = ?, note = ?, work_date = ? WHERE id = ?",
        [hours, note, formattedDate, id]
      )
  
      return NextResponse.json({ success: true })
    } catch (err) {
      console.error(err)
      return NextResponse.json({ error: "Greška pri uređivanju unosa" }, { status: 500 })
    }
  }