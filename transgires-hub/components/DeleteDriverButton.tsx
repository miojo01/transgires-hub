"use client"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteSavedDriver } from "@/app/actions"

export function DeleteDriverButton({ id }: { id: number }) {
  return (
    <Button 
      size="icon" 
      variant="ghost" 
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={() => {
        if (confirm("Tem certeza? Isso apaga o motorista do banco de dados (mas mantém o histórico de tickets).")) {
          deleteSavedDriver(id)
        }
      }}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}