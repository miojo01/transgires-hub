"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Truck, User, Info } from "lucide-react"

// Reutilizando as cores para consistência
const groupConfig: any = {
  "VERMELHO": { bg: "bg-red-100 text-red-800", border: "border-red-200" },
  "AZUL":     { bg: "bg-blue-100 text-blue-800", border: "border-blue-200" },
  "VERDE":    { bg: "bg-green-100 text-green-800", border: "border-green-200" },
}

export function DriverDetailsModal({ driver, children }: { driver: any, children: React.ReactNode }) {
  const visual = groupConfig[driver.group] || groupConfig["VERMELHO"]

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-500" />
            Detalhes do Atendimento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Cabeçalho do Card */}
          <div className={`p-4 rounded-lg border ${visual.bg} ${visual.border} flex justify-between items-start`}>
             <div>
                <h3 className="font-bold text-lg">{driver.name}</h3>
                <p className="font-mono text-sm opacity-80">{driver.licensePlate}</p>
             </div>
             <Badge variant="outline" className="bg-white/50 border-white/40">
                {driver.type}
             </Badge>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-2 gap-4 text-sm">
             <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-400 text-xs flex items-center gap-1"><Calendar className="w-3 h-3"/> Chegada</span>
                <span className="font-medium text-gray-700">
                    {new Date(driver.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
             </div>
             
             <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-400 text-xs flex items-center gap-1"><Truck className="w-3 h-3"/> Grupo</span>
                <span className="font-medium text-gray-700 capitalize">{driver.group.toLowerCase()}</span>
             </div>
          </div>

          {/* Rodapé de Status */}
          <div className="text-xs text-center text-gray-400 border-t pt-4">
             Atualmente em emissão. ID do Ticket: #{driver.id}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}