"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { updateProfile, deleteAccount } from "@/app/actions"
import { User, Settings, Trash2 } from "lucide-react"

export function ProfileDialog({ user }: { user: any }) {
  const [open, setOpen] = useState(false)

  async function handleUpdate(formData: FormData) {
    await updateProfile(formData)
    setOpen(false)
  }

  async function handleDelete() {
    if (confirm("Tem certeza absoluta? Sua conta será excluída permanentemente.")) {
      await deleteAccount()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center cursor-pointer text-sm px-2 py-1.5 hover:bg-gray-100 rounded w-full">
            <Settings className="mr-2 h-4 w-4" />
            <span>Editar Perfil</span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Meu Perfil</DialogTitle>
        </DialogHeader>
        
        <form action={handleUpdate} className="space-y-4 py-4">
            <div className="grid gap-2">
                <Label>Nome</Label>
                <Input name="name" defaultValue={user.name} required />
            </div>
            <div className="grid gap-2">
                <Label>Email</Label>
                <Input name="email" defaultValue={user.email} required />
            </div>
            <div className="grid gap-2">
                <Label>Avatar URL (Opcional)</Label>
                <Input name="avatarUrl" defaultValue={user.avatarUrl || ""} placeholder="https://..." />
            </div>

            <Button type="submit" className="w-full bg-black text-white">Salvar Alterações</Button>
            
            <div className="border-t pt-4 mt-4">
                <Button type="button" variant="destructive" className="w-full gap-2" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4" /> Excluir Conta
                </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}