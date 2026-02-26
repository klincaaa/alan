"use client"
import { useState, useEffect } from "react"

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([])
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")

  // učitaj radnike
  const fetchWorkers = async () => {
    try {
      const res = await fetch("/api/workers")
      if (!res.ok) throw new Error("Ne mogu učitati radnike")
      const data = await res.json()
      setWorkers(data.workers || []) // <-- uzimamo stvarni niz radnika
    } catch (err) {
      console.error(err)
      setWorkers([])
    }
  }

  

  useEffect(() => {
    fetchWorkers()
  }, [])

  // dodavanje radnika
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!firstName || !lastName || !hourlyRate) return

    await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          hourly_rate: parseFloat(hourlyRate)
        })
      })

    setFirstName("")
    setLastName("")
    setHourlyRate("")
    fetchWorkers()
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Radnici</h1>

      {/* Forma za dodavanje radnika */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Ime"
          className="w-full border p-2 rounded"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Prezime"
          className="w-full border p-2 rounded"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Satnica (€)"
          className="w-full border p-2 rounded"
          step="0.01"
          value={hourlyRate}
          onChange={e => setHourlyRate(e.target.value)}
          required
        />
        <button className="w-full bg-black text-white p-2 rounded">
          Dodaj radnika
        </button>
      </form>

      {/* Lista radnika */}
      <div className="space-y-2">
        {workers.map(w => (
          <a
            key={w.id}
            href={`/workers/${w.id}`}
            className="block border p-2 rounded"
          >
            {w.first_name} {w.last_name} - {w.hourly_rate} €
          </a>
        ))}
      </div>
    </div>
  )
}