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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil } from "lucide-react"
import { useState } from "react"
import { updateSavedDriver } from "@/app/actions"

export function EditDriverDialog({ driver }: { driver: any }) {
  const [open, setOpen] = useState(false)

  async function handleUpdate(formData: FormData) {
    await updateSavedDriver(driver.id, formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="hover:bg-gray-100">
            <Pencil className="w-4 h-4 text-gray-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Cadastro</DialogTitle>
        </DialogHeader>
        
        <form action={handleUpdate} className="space-y-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" name="name" defaultValue={driver.name} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="plate">Placa</Label>
                    <Input id="plate" name="licensePlate" defaultValue={driver.licensePlate} required className="uppercase" />
                </div>
                <div className="grid gap-2">
                    <Label>Modalidade</Label>
                    <Select name="type" defaultValue={driver.type}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="FROTA">Frota</SelectItem>
                        <SelectItem value="AGREGADO">Agregado</SelectItem>
                        <SelectItem value="TERCEIRO">Terceiro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-2">
                <Label>Grupo (Cor)</Label>
                <Select name="group" defaultValue={driver.group}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="VERMELHO">🔴 Grupo Vermelho</SelectItem>
                        <SelectItem value="AZUL">🔵 Grupo Azul</SelectItem>
                        <SelectItem value="VERDE">🟢 Grupo Verde</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
                Salvar Alterações
            </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}