"use client"

import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { ticketAction } from "@/app/actions"
import { useTransition } from "react"
import { WorkDesk } from "./WorkDesk" // Importa a mesa que acabamos de criar

interface TicketActionsProps {
  driver: any
}

export function TicketActions({ driver }: TicketActionsProps) {
  const [isPending, startTransition] = useTransition()

  // Função para começar (Assumir)
  function handleStart() {
    startTransition(async () => {
      await ticketAction(driver.id, 'START')
    })
  }

  // 1. Motorista na Fila -> Botão ASSUMIR
  if (driver.status === 'TODO' || driver.status === 'PENDING') {
    return (
      <Button 
        size="sm" 
        onClick={handleStart} 
        disabled={isPending}
        className="bg-black text-white hover:bg-gray-800 h-9 px-4 font-bold shadow-sm"
      >
        <Play className="w-3 h-3 mr-2 fill-current" />
        {driver.status === 'PENDING' ? 'Retomar' : 'Assumir'}
      </Button>
    )
  }

  // 2. Motorista em Andamento -> MOSTRA A MESA (Checklist)
  if (driver.status === 'IN_PROGRESS') {
    return <WorkDesk driver={driver} />
  }

  return null
}