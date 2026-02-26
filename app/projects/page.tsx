"use client"
import { useState, useEffect } from "react"



export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)

  // Forma polja
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [budget, setBudget] = useState("")
  const [description, setDescription] = useState("")
  const [client, setClient] = useState("")
  const [status, setStatus] = useState("active") // default active

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Ne mogu učitati projekte")
      const data = await res.json()
      setProjects(data.projects || []) // ✅ uzmemo niz iz objekta
    } catch (err) {
      console.error(err)
      setProjects([])
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!name || !startDate || !endDate) return

    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        location,
        start_date: startDate,
        end_date: endDate,
        budget: budget ? parseFloat(budget) : null,
        description,
        client,
        status
      })
    })

    // reset forme
    setName("")
    setLocation("")
    setStartDate("")
    setEndDate("")
    setBudget("")
    setDescription("")
    setClient("")
    setStatus("active")
    setShowForm(false)

    // refresh liste
    fetchProjects()
  }
  

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Projekti</h1>

      {/* Dugme za dodavanje projekta */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 bg-black text-white px-4 py-2 rounded"
      >
        + Dodaj projekat
      </button>

      {/* Forma */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded shadow-sm bg-white space-y-3">
          <input type="text" placeholder="Naziv projekta" className="w-full border p-2 rounded" value={name} onChange={e => setName(e.target.value)} required />
          <input type="text" placeholder="Lokacija" className="w-full border p-2 rounded" value={location} onChange={e => setLocation(e.target.value)} />
          <div className="flex gap-2">
            <input type="date" className="w-1/2 border p-2 rounded" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            <input type="date" className="w-1/2 border p-2 rounded" value={endDate} onChange={e => setEndDate(e.target.value)} required />
          </div>
          <input type="number" placeholder="Budžet (€)" className="w-full border p-2 rounded" value={budget} onChange={e => setBudget(e.target.value)} />
          <input type="text" placeholder="Klijent" className="w-full border p-2 rounded" value={client} onChange={e => setClient(e.target.value)} />
          <select className="w-full border p-2 rounded" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="planirano">Planirano</option>
            <option value="u toku">U toku</option>
            <option value="završeno">Završeno</option>
          </select>
          <textarea placeholder="Opis projekta" className="w-full border p-2 rounded" value={description} onChange={e => setDescription(e.target.value)} />
          <button className="w-full bg-black text-white p-2 rounded">Spremi projekat</button>
        </form>
      )}

      {/* Grid projekata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map(p => (
            <a
              key={p.id}
              href={`/projects/${p.id}`}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer bg-white"
            >
              <h2 className="font-bold text-lg mb-1">{p.name}</h2>
              {p.location && <p className="text-sm text-gray-500">{p.location}</p>}
              {p.deadline && (
                <p className="text-sm text-gray-400">{new Date(p.deadline).toLocaleDateString()}</p>
              )}
            </a>
          ))}
        </div>
    </div>
  )
}