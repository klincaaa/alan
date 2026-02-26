"use client"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [projects, setProjects] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])

  // --- Fetch projekata ---
  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Ne mogu učitati projekte")
      const data = await res.json()
      setProjects(data.projects || []) // <-- obavezno uzimamo niz
    } catch (err) {
      console.error(err)
      setProjects([])
    }
  }

  // --- Fetch radnika ---
  const fetchWorkers = async () => {
    try {
      const res = await fetch("/api/workers")
      if (!res.ok) throw new Error("Ne mogu učitati radnike")
      const data = await res.json()
      setWorkers(data.workers || []) // <-- ovo je ključno
    } catch (err) {
      console.error(err)
      setWorkers([])
    }
  }

  useEffect(() => {
    fetchProjects()
    fetchWorkers()
  }, [])

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-8">
      {/* Projekti */}
      <section>
        <h1 className="text-2xl font-bold mb-4">Projekti</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.isArray(projects) && projects.map(p => (
            <a
              key={p.id}
              href={`/projects/${p.id}`}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer bg-white"
            >
              <h2 className="font-bold text-lg mb-1">{p.name}</h2>
              {p.location && <p className="text-sm text-gray-500">{p.location}</p>}
              {p.start_date && p.end_date && (
                <p className="text-sm text-gray-400">
                  {new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()}
                </p>
              )}
              {p.budget && <p className="text-sm text-gray-600">Budžet: {p.budget} €</p>}
              <p className="text-sm font-semibold">Status: {p.status}</p>
            </a>
          ))}
          {(!projects || projects.length === 0) && <p>Nema projekata za prikaz.</p>}
        </div>
      </section>

      {/* Radnici */}
      <section>
        <h1 className="text-2xl font-bold mb-4">Radnici</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.isArray(workers) && workers.map(w => (
            <a
              key={w.id}
              href={`/workers/${w.id}`}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer bg-white"
            >
              <h2 className="font-bold text-lg mb-1">{w.first_name} {w.last_name}</h2>
              <p className="text-sm text-gray-500">Satnica: {w.hourly_rate} €</p>
            </a>
          ))}
          {(!workers || workers.length === 0) && <p>Nema radnika za prikaz.</p>}
        </div>
      </section>
    </div>
  )
}