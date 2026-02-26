"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function ProjectDetails() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)

  const [showHoursForm, setShowHoursForm] = useState(false)
  const [workerId, setWorkerId] = useState("")
  const [hours, setHours] = useState("")
  const [note, setNote] = useState("")
  const [workDate, setWorkDate] = useState<Date | null>(new Date())

  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [expenses, setExpenses] = useState<any[]>([])
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")

  // ================= FETCH =================

  const fetchData = async () => {
    const res = await fetch(`/api/projects/${id}`)
    const json = await res.json()

    setData({
      project: json.project || null,
      entries: json.entries || [],
      workers: json.workers || []
    })
  }

  const fetchExpenses = async () => {
    const res = await fetch(`/api/projects/${id}/expenses`)
    const json = await res.json()
    setExpenses(json.expenses || [])
  }

  useEffect(() => {
    fetchData()
    fetchExpenses()
  }, [id])

  // ================= ADD ENTRY =================

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

  // ================= ADD EXPENSE =================

  const handleAddExpense = async (e: any) => {
    e.preventDefault()
    if (!description || !amount) return

    await fetch(`/api/projects/${id}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        amount: parseFloat(amount)
      })
    })

    setDescription("")
    setAmount("")
    setShowExpenseForm(false)
    fetchExpenses()
  }

  if (!data || !data.project) return <div className="p-4">Loading...</div>

  // ================= CALCULATIONS =================

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  )

  const totalWorkCost = data.entries.reduce(
    (sum: number, e: any) =>
      sum + Number(e.hours) * Number(e.hourly_rate),
    0
  )

  const totalSpent = totalExpenses + totalWorkCost

  const remainingBudget =
    Number(data.project.budget) - totalSpent

  const totalHours = data.entries.reduce(
    (sum: number, e: any) => sum + Number(e.hours),
    0
  )

  // ================= UI =================

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6">

      {/* PROJECT INFO */}
      <div className="bg-white p-4 rounded shadow space-y-2">
        <h1 className="text-2xl font-bold">{data.project.name}</h1>

        <p>Početni budžet:
          <span className="ml-2 font-semibold">
            {data.project.budget} €
          </span>
        </p>

        <p>Ukupno potrošeno:
          <span className="ml-2 font-semibold">
            {totalSpent.toFixed(2)} €
          </span>
        </p>

        <p>Ukupno sati:
          <span className="ml-2 font-semibold">
            {totalHours} h
          </span>
        </p>

        <p className={
          remainingBudget < 0
            ? "text-red-600 font-bold"
            : "text-green-600 font-bold"
        }>
          Trenutno stanje: {remainingBudget.toFixed(2)} €
        </p>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowExpenseForm(!showExpenseForm)}
          className="flex-1 bg-green-500 text-white py-1 rounded-lg"
        >
          Dodaj trošak
        </button>

        <button
          onClick={() => setShowHoursForm(!showHoursForm)}
          className="flex-1 bg-blue-500 text-white py-1 rounded-lg"
        >
          Dodaj sate
        </button>
      </div>

      {/* EXPENSE FORM */}
      {showExpenseForm && (
        <div className="bg-white p-4 rounded shadow">
          <form onSubmit={handleAddExpense} className="space-y-2">
            <input
              type="text"
              placeholder="Opis"
              className="w-full border p-2 rounded"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Iznos"
              className="w-full border p-2 rounded"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
            <button className="w-full bg-black text-white p-2 rounded">
              Spremi
            </button>
          </form>
        </div>
      )}

      {/* EXPENSE LIST */}
      <div className="bg-white p-4 rounded shadow space-y-2">
        <h2 className="font-semibold text-lg">Troškovi</h2>

        {expenses.map(e => (
          <div key={e.id} className="border p-2 rounded bg-gray-50">
            {e.description} - {e.amount} €

            <div className="flex gap-3 text-sm mt-1">
              <button
                onClick={async () => {
                  const newAmount = prompt("Novi iznos:", e.amount)
                  if (!newAmount) return

                  await fetch(`/api/projects/${id}/expenses/${e.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      description: e.description,
                      amount: newAmount
                    })
                  })

                  fetchExpenses()
                }}
                className="text-blue-500"
              >
                Uredi
              </button>

              <button
                onClick={async () => {
                  if (!confirm("Sigurno?")) return
                  await fetch(`/api/projects/${id}/expenses/${e.id}`, {
                    method: "DELETE"
                  })
                  fetchExpenses()
                }}
                className="text-red-500"
              >
                Obriši
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* WORK ENTRY FORM */}
      {showHoursForm && (
        <div className="bg-white p-4 rounded shadow">
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
              placeholder="Napomena"
              className="w-full border p-2 rounded"
              value={note}
              onChange={e => setNote(e.target.value)}
            />

            <DatePicker
              selected={workDate}
              onChange={(date: Date) => setWorkDate(date)}
              className="w-full border p-2 rounded"
              dateFormat="yyyy-MM-dd"
            />

            <button className="w-full bg-black text-white p-2 rounded">
              Spremi sate
            </button>
          </form>
        </div>
      )}

      {/* WORK ENTRY LIST */}
      <div className="bg-white p-4 rounded shadow space-y-2">
        <h2 className="font-semibold text-lg">Unosi sati</h2>

        {data.entries.map((e: any) => (
          <div key={e.id} className="border p-2 rounded bg-gray-50">
            <p className="font-semibold">
              {e.first_name} {e.last_name}
            </p>
            <p>
              {new Date(e.work_date).toLocaleDateString()} — {e.hours}h
            </p>
            <p>Trošak rada: {(e.hours * e.hourly_rate).toFixed(2)} €</p>
            <p>{e.note}</p>

            <div className="flex gap-3 text-sm mt-1">
              <button
                onClick={async () => {
                  const newHours = prompt("Novi broj sati:", e.hours)
                  if (!newHours) return

                  await fetch(`/api/work-entries/${e.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      hours: newHours,
                      note: e.note,
                      workDate: e.work_date
                    })
                  })

                  fetchData()
                }}
                className="text-blue-500"
              >
                Uredi
              </button>

              <button
                onClick={async () => {
                  if (!confirm("Sigurno?")) return
                  await fetch(`/api/work-entries/${e.id}`, {
                    method: "DELETE"
                  })
                  fetchData()
                }}
                className="text-red-500"
              >
                Obriši
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}