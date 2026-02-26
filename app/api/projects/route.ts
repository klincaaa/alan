import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
    try {
      const [projects]: any = await db.query("SELECT * FROM projects ORDER BY id DESC")
      return NextResponse.json({ projects }) // <-- OBAVEZNO JSON
    } catch (err) {
      console.error(err)
      return NextResponse.json({ projects: [], error: "Greška pri učitavanju projekata" }, { status: 500 })
    }
  }
  
  export async function POST(req: Request) {
    try {
      const body = await req.json()
      const { name, location, start_date, end_date, budget, description, client, status } = body
  
      const [result]: any = await db.query(
        "INSERT INTO projects (name, location, start_date, end_date, budget, description, client, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [name, location, start_date, end_date, budget, description, client, status || 'active']
      )
  
      return NextResponse.json({ message: "Projekat dodat", id: result.insertId })
    } catch (err) {
      console.error(err)
      return NextResponse.json({ error: "Greška pri dodavanju projekta" }, { status: 500 })
    }
  }