"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function ProjectDetails() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)

  // Forma za unos sati
  const [showHoursForm, setShowHoursForm] = useState(false)
  const [workerId, setWorkerId] = useState("")
  const [hours, setHours] = useState("")
  const [note, setNote] = useState("")
  const [workDate, setWorkDate] = useState<Date | null>(new Date())

  // Forma za dodavanje troška
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [expenses, setExpenses] = useState<any[]>([])
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")

  // --- Fetch projekta sa radnicima i unosa sati ---
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`)
      const json = await res.json()
      setData({
        project: json.project || null,
        entries: json.entries || [],
        workers: json.workers || []
      })
    } catch (err) {
      console.error(err)
      setData({ project: null, entries: [], workers: [] })
    }
  }

  // --- Fetch troškova ---
  const fetchExpenses = async () => {
    try {
      const res = await fetch(`/api/projects/${id}/expenses`)
      const json = await res.json()
      setExpenses(json.expenses || [])
    } catch (err) {
      console.error(err)
      setExpenses([])
    }
  }

  useEffect(() => {
    fetchData()
    fetchExpenses()
  }, [id])

  // --- Dodavanje unosa sati ---
  const addEntry = async (e: any) => {
    e.preventDefault()
    if (!workerId || !hours || !workDate) return

    await fetch("/api/work-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerId,
        projectId: id,
        workDate: workDate.toISOString(),
        hours,
        note
      })
    })

    setWorkerId("")
    setHours("")
    setNote("")
    setWorkDate(new Date())
    setShowHoursForm(false)
    fetchData()
  }

  // --- Dodavanje troška ---
  const handleAddExpense = async (e: any) => {
    e.preventDefault()
    if (!description || !amount) return

    await fetch(`/api/projects/${id}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, amount: parseFloat(amount) })
    })

    setDescription("")
    setAmount("")
    setShowExpenseForm(false)
    fetchExpenses()
  }

  if (!data || !data.project) return <div className="p-4">Loading...</div>

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const remainingBudget = Number(data.project.budget) - totalSpent

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6">

      {/* Naziv projekta i budžet */}
      <div className="bg-white p-4 rounded shadow space-y-2">
        <h1 className="text-2xl font-bold">{data.project.name}</h1>
        <p>Pocetni budžet: <span className="font-semibold">{data.project.budget} €</span></p>
        <p>Trenutno stanje: <span className="font-semibold">{remainingBudget} €</span></p>
      </div>

      {/* Dugmad za forme */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowExpenseForm(!showExpenseForm)}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-1 rounded-lg"
        >
          Dodaj trošak
        </button>
        <button
          onClick={() => setShowHoursForm(!showHoursForm)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 rounded-lg"
        >
          Dodaj sate
        </button>
      </div>

      {/* Forma za dodavanje troška */}
      {showExpenseForm && (
        <div className="bg-white p-4 rounded shadow space-y-2">
          <h2 className="text-xl font-semibold">Dodaj trošak</h2>
          <form onSubmit={handleAddExpense} className="space-y-2">
            <input
              type="text"
              placeholder="Opis troška"
              className="w-full border p-2 rounded"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Iznos (€)"
              className="w-full border p-2 rounded"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
            <button className="w-full bg-black text-white p-2 rounded">Spremi trošak</button>
          </form>
        </div>
      )}

      {/* Lista troškova */}
      <div className="bg-white p-4 rounded shadow space-y-2">
        <h2 className="text-xl font-semibold">Troškovi</h2>
        {expenses.length === 0 ? (
          <p>Nema troškova.</p>
        ) : (
          <ul className="space-y-1">
            {expenses.map(e => (
              <li key={e.id} className="border p-2 rounded bg-gray-50">
                {e.description} - {e.amount} €
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Forma za unos sati */}
      {showHoursForm && (
        <div className="bg-white p-4 rounded shadow space-y-2">
          <h2 className="text-xl font-semibold">Dodaj sate</h2>
          <form onSubmit={addEntry} className="space-y-2">
            <select
              className="w-full border p-2 rounded"
              value={workerId}
              onChange={e => setWorkerId(e.target.value)}
              required
            >
              <option value="">Izaberi radnika</option>
              {data.workers.map((w: any) => (
                <option key={w.id} value={w.id}>
                  {w.first_name} {w.last_name}
                </option>
              ))}
            </select>

            <input
              type="number"
              step="0.5"
              placeholder="Sati"
              className="w-full border p-2 rounded"
              value={hours}
              onChange={e => setHours(e.target.value)}
              required
            />

            <input
              placeholder="Komentar"
              className="w-full border p-2 rounded"
              value={note}
              onChange={e => setNote(e.target.value)}
            />

            <DatePicker
              selected={workDate}
              onChange={(date: Date) => setWorkDate(date)}
              className="w-full border p-2 rounded"
              dateFormat="yyyy-MM-dd"
              required
            />

            <button className="w-full bg-black text-white p-2 rounded">Spremi sate</button>
          </form>
        </div>
      )}

      {/* Lista unosa sati */}
      <div className="bg-white p-4 rounded shadow space-y-2">
        <h2 className="text-xl font-semibold">Unosi sati</h2>
        {data.entries.length === 0 ? (
          <p>Nema unosa sati.</p>
        ) : (
          <ul className="space-y-2">
            {data.entries.map((e: any) => (
              <li key={e.id} className="border p-2 rounded bg-gray-50">
                <p><span className="font-semibold">{e.first_name} {e.last_name}</span></p>
                <p>{new Date(e.work_date).toLocaleDateString()} - {e.hours}h</p>
                <p>{e.note}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}