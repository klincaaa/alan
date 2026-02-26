"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function WorkerDetails() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)

  // za filtriranje po periodu
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const fetchData = async () => {
    const res = await fetch(`/api/workers/${id}`)
    const json = await res.json()
    setData({
      worker: json.worker || null,
      entries: json.entries || []
    })
  }

  useEffect(() => {
    fetchData()
  }, [id])

  if (!data) return <div className="p-4">Loading...</div>
  if (!data.worker) return <div className="p-4">Radnik nije pronađen</div>

  // filtriranje unosa po periodu
  const filteredEntries = data.entries.filter((e: any) => {
    const workDate = new Date(e.work_date)
    if (startDate && workDate < startDate) return false
    if (endDate && workDate > endDate) return false
    return true
  })

  const totalHours = filteredEntries.reduce((sum: number, e: any) => sum + Number(e.hours), 0)
  const totalEarned = filteredEntries.reduce((sum: number, e: any) => sum + Number(e.total_earned), 0)

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-2">
        {data.worker.first_name} {data.worker.last_name}
      </h1>
      <p>Satnica: {data.worker.hourly_rate} €</p>

      {/* Filter po periodu */}
      <div className="flex gap-2 mb-4">
        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) => setStartDate(date)}
          selectsStart
          startDate={startDate ?? undefined}
          endDate={endDate ?? undefined}
          placeholderText="Od datuma"
          className="border p-2 rounded w-full"
        />
        <DatePicker
          selected={endDate}
          onChange={(date: Date | null) => setEndDate(date)}
          selectsEnd
          startDate={startDate ?? undefined}
          endDate={endDate ?? undefined}
          minDate={startDate ?? undefined}
          placeholderText="Do datuma"
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Statistika za izabrani period */}
      <div className="mb-4 p-2 border rounded bg-gray-50">
        <p>Ukupno sati: {totalHours}</p>
        <p>Ukupna zarada: {totalEarned.toFixed(2)} €</p>
      </div>

      {/* Lista unosa */}
      <div className="space-y-2">
        {filteredEntries.map((e: any) => (
          <div key={e.id} className="border p-2 rounded">
            <p>{e.project_name}</p>
            <p>{new Date(e.work_date).toLocaleDateString()} - {e.hours}h</p>
            <p>{e.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}