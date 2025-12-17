"use client";

import { Button } from "@/components/ui/button";
import { Play, FileText } from "lucide-react";
import { startService } from "@/app/actions";
import { useTransition } from "react";
import { WorkDesk } from "./WorkDesk"; // <--- Importamos a mesa

interface TicketActionsProps {
  driver: any;
  currentUserId?: string;
}

export function TicketActions({ driver }: TicketActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleStart = () => {
    startTransition(async () => {
      await startService(driver.id);
    });
  };

  // 1. Se já finalizou, não mostra nada
  if (driver.status === "DONE") return <div className="text-green-600 font-bold text-xs">Concluído</div>;
  if (driver.status === "PENDING") return <div className="text-orange-500 font-bold text-xs">Pendente</div>;

  // 2. Se está na fila (TODO) -> Botão Assumir
  if (driver.status === "TODO") {
    return (
      <Button 
        size="sm" 
        onClick={handleStart} 
        disabled={isPending}
        className="bg-gray-900 hover:bg-gray-700 transition-all active:scale-95 shadow-lg shadow-gray-900/10"
      >
        <Play className="w-3.5 h-3.5 mr-2" />
        {isPending ? "Assumindo..." : "Assumir"}
      </Button>
    );
  }

  // 3. Se está Em Progresso -> Abre a Mesa de Trabalho
  if (driver.status === "IN_PROGRESS") {
    return (
      <WorkDesk driver={driver}> 
         {/* O WorkDesk precisa de um filho para ser o gatilho do clique */}
         <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
            <FileText className="w-3.5 h-3.5 mr-2" />
            Continuar
         </Button>
      </WorkDesk>
    );
  }

  return null;
}