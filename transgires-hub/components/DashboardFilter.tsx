"use client"

import { Calendar } from "lucide-react"

export function DashboardFilter({ defaultDate }: { defaultDate: string }) {
  return (
    <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-md border border-gray-200 shadow-sm">
        <Calendar className="w-4 h-4 text-gray-500" />
        <form>
            <input 
                type="date" 
                name="date"
                defaultValue={defaultDate}
                className="text-sm bg-transparent outline-none text-gray-700 font-medium cursor-pointer"
                onChange={(e) => e.currentTarget.form?.requestSubmit()} 
            />
        </form>
    </div>
  )
}