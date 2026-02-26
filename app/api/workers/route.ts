import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// GET svi radnici
export async function GET() {
  try {
    const [workers]: any = await db.query("SELECT * FROM workers ORDER BY id DESC")
    return NextResponse.json({ workers }) // <-- OBAVEZNO JSON objekat sa workers nizom
  } catch (err) {
    console.error(err)
    return NextResponse.json({ workers: [], error: "Greška pri učitavanju radnika" }, { status: 500 })
  }
}

// POST novi radnik
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { first_name, last_name, hourly_rate } = body

    const [result]: any = await db.query(
      "INSERT INTO workers (first_name, last_name, hourly_rate) VALUES (?, ?, ?)",
      [first_name, last_name, hourly_rate]
    )

    return NextResponse.json({ message: "Radnik dodat", id: result.insertId })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Greška pri dodavanju radnika" }, { status: 500 })
  }
}