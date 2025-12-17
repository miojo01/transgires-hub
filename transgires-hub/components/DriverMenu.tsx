"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { deleteDriver, updateDriver } from "@/app/actions"

export function DriverMenu({ driver }: { driver: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  async function handleUpdate(formData: FormData) {
    await updateDriver(driver.id, formData)
    setIsEditOpen(false)
  }

  return (
    <>
      {/* 1. O MENU SUSPENSO (Dropdown) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-black">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
            <Pencil className="mr-2 h-4 w-4" /> Editar Dados
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => {
                if(confirm("Tem certeza que deseja excluir este motorista da fila?")) {
                    deleteDriver(driver.id)
                }
            }} 
            className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 2. O MODAL DE EDIÇÃO (Invisível até clicar em Editar) */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Motorista</DialogTitle>
          </DialogHeader>
          
          <form action={handleUpdate} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input name="name" defaultValue={driver.name} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label>Placa</Label>
                 <Input name="licensePlate" defaultValue={driver.licensePlate} className="uppercase" required />
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
    </>
  )
}