// components/NewDriverDialog.tsx
"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createDriver } from "@/app/actions"
import { useState } from "react"
import { PlusCircle } from "lucide-react"

export function NewDriverDialog() {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await createDriver(formData) // Chama a ação do servidor
    setOpen(false) // Fecha o modal
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-900/20">
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Motorista
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar à Fila</DialogTitle>
        </DialogHeader>
        
        {/* O Formulário Mágico */}
        <form action={handleSubmit} className="grid gap-4 py-4">
          
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Motorista</Label>
            <Input id="name" name="name" placeholder="Ex: João da Silva" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="licensePlate">Placa</Label>
              <Input id="licensePlate" name="licensePlate" placeholder="ABC-1234" required className="uppercase" />
            </div>
            
            {/* SELETOR DE MODALIDADE (Checklist) */}
            <div className="grid gap-2">
              <Label htmlFor="type">Modalidade</Label>
              <Select name="type" required defaultValue="TERCEIRO">
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FROTA">Frota (Sem contrato)</SelectItem>
                  <SelectItem value="AGREGADO">Agregado (Com contrato)</SelectItem>
                  <SelectItem value="TERCEIRO">Terceiro (Com contrato)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* SELETOR DE GRUPO (Cor Visual) - NOVO CAMPO */}
          <div className="grid gap-2">
              <Label htmlFor="group">Grupo Operacional (Cor)</Label>
              <Select name="group" required defaultValue="VERMELHO">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a Cor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VERMELHO">🔴 Grupo Vermelho</SelectItem>
                  <SelectItem value="AZUL">🔵 Grupo Azul</SelectItem>
                  <SelectItem value="VERDE">🟢 Grupo Verde</SelectItem>
                </SelectContent>
              </Select>
            </div>

          <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white mt-4">
            Lançar na Fila
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}