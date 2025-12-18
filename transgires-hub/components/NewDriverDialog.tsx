"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, UserPlus, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { createAndQueueDriver, getSavedDrivers, queueExistingDriver } from "@/app/actions"
import { toast } from "sonner" 

export function NewDriverDialog() {
  const [open, setOpen] = useState(false)
  const [savedDrivers, setSavedDrivers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")
  
  // Estado para o Romaneio na aba de Lista
  const [romaneioList, setRomaneioList] = useState("")

  useEffect(() => {
    if (open) {
      getSavedDrivers().then(setSavedDrivers)
      setSearchTerm("")
      setError("")
      setRomaneioList("")
    }
  }, [open])

  const filtered = savedDrivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function handleManualSubmit(formData: FormData) {
    const result = await createAndQueueDriver(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false)
    }
  }

  async function handleSelect(id: number) {
    if (!romaneioList.trim()) {
        alert("Por favor, informe o número do Romaneio antes de lançar.")
        return
    }
    // Passa o ID e o Romaneio digitado
    await queueExistingDriver(id, romaneioList)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* PEDIDO ATENDIDO: BOTÃO VERMELHO */}
        <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 font-bold shadow-sm">
          <Plus className="w-5 h-5" /> Novo Motorista
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Lançar na Fila</DialogTitle>
          <DialogDescription>
            Informe o romaneio da viagem atual.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Já Cadastrados</TabsTrigger>
            <TabsTrigger value="manual">Novo Cadastro</TabsTrigger>
          </TabsList>

          {/* ABA 1: LISTA */}
          <TabsContent value="list" className="space-y-4 pt-4">
            
            {/* Campo Romaneio Global para a Lista */}
            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <Label htmlFor="romaneioList" className="text-yellow-800 font-bold text-xs uppercase mb-1 block">
                    1. Romaneio desta Viagem
                </Label>
                <div className="relative">
                    <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                        id="romaneioList" 
                        value={romaneioList} 
                        onChange={e => setRomaneioList(e.target.value)}
                        placeholder="Ex: 998877"
                        className="pl-9 bg-white border-yellow-300 focus-visible:ring-yellow-500"
                        autoFocus
                    />
                </div>
            </div>

            <div>
                <Label className="text-gray-500 text-xs uppercase font-bold mb-1 block">
                    2. Selecione o Motorista
                </Label>
                <div className="relative mb-2">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Buscar por nome ou placa..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="h-[200px] overflow-y-auto border rounded-md p-2 space-y-2 bg-gray-50">
                    {filtered.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 mt-8">Nada encontrado.</p>
                    ) : (
                        filtered.map(driver => (
                        <div key={driver.id} className="flex items-center justify-between p-3 bg-white border rounded shadow-sm hover:border-red-300 transition-all group">
                            <div>
                                <p className="font-bold text-sm text-gray-800">{driver.name}</p>
                                <p className="text-xs text-gray-500 font-mono">{driver.licensePlate}</p>
                            </div>
                            <Button 
                                size="sm" 
                                onClick={() => handleSelect(driver.id)} 
                                className="bg-gray-100 text-gray-600 hover:bg-green-600 hover:text-white border border-gray-200"
                                disabled={!romaneioList} // Desabilita se não tiver romaneio
                                title={!romaneioList ? "Digite o Romaneio acima primeiro" : "Lançar na fila"}
                            >
                                Lançar
                            </Button>
                        </div>
                        ))
                    )}
                </div>
            </div>
          </TabsContent>

          {/* ABA 2: MANUAL */}
          <TabsContent value="manual" className="pt-4">
             {error && (
               <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded text-sm mb-4">
                 {error}
               </div>
             )}
             
             <form action={handleManualSubmit} className="space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" name="name" required placeholder="Ex: Carlos Souza" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="plate">Placa</Label>
                    <Input id="plate" name="licensePlate" required placeholder="ABC-1234" className="uppercase" />
                  </div>
                  {/* NOVO CAMPO NO MANUAL */}
                  <div className="grid gap-2">
                    <Label htmlFor="romaneio" className="text-red-600 font-bold">Romaneio</Label>
                    <Input id="romaneio" name="romaneio" required placeholder="Nº Documento" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Modalidade</Label>
                        <Select name="type" defaultValue="TERCEIRO">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="FROTA">Frota</SelectItem>
                            <SelectItem value="AGREGADO">Agregado</SelectItem>
                            <SelectItem value="TERCEIRO">Terceiro</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Grupo (Cor)</Label>
                        <Select name="group" defaultValue="VERMELHO">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                            <SelectItem value="VERMELHO">🔴 Vermelho</SelectItem>
                            <SelectItem value="AZUL">🔵 Azul</SelectItem>
                            <SelectItem value="VERDE">🟢 Verde</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold mt-2">
                  <UserPlus className="w-4 h-4 mr-2" /> Cadastrar e Lançar
                </Button>
             </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}